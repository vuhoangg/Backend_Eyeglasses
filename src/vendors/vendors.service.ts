import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm'; // ILike cho tìm kiếm không phân biệt hoa thường
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { instanceToPlain } from 'class-transformer'; // Loại bỏ metadata của TypeORM

@Injectable()
export class VendorsService {
  constructor(
    // Tiêm Repository của Vendor vào service
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  // Tạo nhà cung cấp mới
  async create(createVendorDto: CreateVendorDto): Promise<any> {
     // Kiểm tra email đã tồn tại chưa (nếu email được cung cấp)
     if (createVendorDto.email) {
        const existingVendor = await this.vendorRepository.findOne({ where: { email: createVendorDto.email } });
        if (existingVendor) {
            throw new BadRequestException(`Email ${createVendorDto.email} đã được sử dụng.`);
        }
     }
    // Tạo một instance mới từ DTO
    const vendor = this.vendorRepository.create(createVendorDto);
    // Lưu vào database
    const savedVendor = await this.vendorRepository.save(vendor);
    // Trả về dữ liệu đã được làm sạch
    return instanceToPlain(savedVendor);
  }

  // Lấy danh sách nhà cung cấp (có phân trang và lọc)
  async findAll(query: QueryVendorDto): Promise<any> {
    const { page = 1, limit = 10, name, email, isActive } = query;
    // Điều kiện lọc (WHERE)
    const where: FindOptionsWhere<Vendor> = {};

    if (name) {
      where.name = ILike(`%${name}%`); // Tìm kiếm tên gần đúng
    }
    if (email) {
        where.email = ILike(`%${email}%`); // Tìm kiếm email gần đúng
    }
    // Lọc theo trạng thái isActive
    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
       // Mặc định chỉ lấy các vendor đang hoạt động nếu không chỉ định
       where.isActive = true;
    }

    // Lấy dữ liệu và tổng số lượng
    const [data, total] = await this.vendorRepository.findAndCount({
      where, // Áp dụng điều kiện lọc
      skip: (page - 1) * limit, // Bỏ qua số lượng item của các trang trước
      take: limit, // Lấy số lượng item cho trang hiện tại
      order: { creationDate: 'DESC' }, // Sắp xếp theo ngày tạo giảm dần
    });

    // Tính tổng số trang
    const totalPage = Math.ceil(total / limit);

    return {
      total, // Tổng số item khớp điều kiện
      totalPage, // Tổng số trang
      page, // Trang hiện tại
      limit, // Giới hạn item mỗi trang
      data: instanceToPlain(data), // Dữ liệu của trang hiện tại
    };
  }

  // Lấy một nhà cung cấp theo ID
  async findOne(id: number): Promise<any> {
    // Tìm vendor theo id và phải đang hoạt động
    const vendor = await this.vendorRepository.findOne({ where: { id, isActive: true } });
    if (!vendor) {
      // Ném lỗi nếu không tìm thấy
      throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID ${id} hoặc đã bị vô hiệu hóa.`);
    }
    return instanceToPlain(vendor);
  }

   // Hàm nội bộ để lấy entity (bao gồm cả inactive) cho việc update/delete
   async findOneInternal(id: number): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID ${id}.`);
    }
    return vendor;
  }


  // Cập nhật nhà cung cấp
  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<any> {
    // Lấy entity hiện tại (dùng hàm internal để lấy cả inactive)
    const vendor = await this.findOneInternal(id);

    // Kiểm tra nếu email thay đổi và email mới đã tồn tại ở vendor khác
    if (updateVendorDto.email && updateVendorDto.email !== vendor.email) {
        const existing = await this.vendorRepository.findOne({where: {email: updateVendorDto.email}});
        // Nếu email mới đã tồn tại VÀ không phải là của chính vendor đang cập nhật
        if(existing && existing.id !== id) {
            throw new BadRequestException(`Email ${updateVendorDto.email} đã được sử dụng bởi nhà cung cấp khác.`);
        }
    }

    // Gộp dữ liệu từ DTO vào entity đã tìm thấy
    Object.assign(vendor, updateVendorDto);
    // Lưu lại thay đổi
    const updatedVendor = await this.vendorRepository.save(vendor);
    return instanceToPlain(updatedVendor);
  }

  // Xóa nhà cung cấp (xóa mềm)
  async remove(id: number): Promise<void> {
    const vendor = await this.findOneInternal(id);
    // Đặt trạng thái isActive thành false thay vì xóa hẳn khỏi DB
    vendor.isActive = false;
    await this.vendorRepository.save(vendor);
    // Không cần trả về gì cả
  }
}