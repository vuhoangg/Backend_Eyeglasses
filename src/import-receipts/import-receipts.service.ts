import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual, ILike } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { ImportReceipt, ImportReceiptStatus } from './entities/import-receipt.entity';
import { ImportReceiptDetail } from './entities/import-receipt-detail.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateImportReceiptDto } from './dto/create-import-receipt.dto';
import { UpdateImportReceiptDto } from './dto/update-import-receipt.dto';
import { QueryImportReceiptDto } from './dto/query-import-receipt.dto';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@Injectable()
export class ImportReceiptService {
  private readonly logger = new Logger(ImportReceiptService.name);

  constructor(
    @InjectRepository(ImportReceipt)
    private readonly importReceiptRepository: Repository<ImportReceipt>,
    @InjectRepository(ImportReceiptDetail)
    private readonly importReceiptDetailRepository: Repository<ImportReceiptDetail>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource, // Inject DataSource để dùng transaction
  ) {}

  async create(createImportReceiptDto: CreateImportReceiptDto /*, creatorId?: number */): Promise<any> {
    const { vendorId, details, status, ...receiptData } = createImportReceiptDto;

    // --- Tìm Vendor ---
    const vendor = await this.vendorRepository.findOneBy({ id: vendorId, isActive: true });
    if (!vendor) {
      throw new NotFoundException(`Nhà cung cấp với ID ${vendorId} không tồn tại hoặc không hoạt động.`);
    }

    // --- Bắt đầu Transaction ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // --- Tạo Phiếu Nhập Chính ---
        const newReceipt = queryRunner.manager.create(ImportReceipt, {
            ...receiptData,
            vendor: vendor,
            status: status || ImportReceiptStatus.PENDING, // Mặc định PENDING nếu không truyền
            totalAmount: 0, // Sẽ tính lại sau
            // creatorId: creatorId, // Gán người tạo nếu có
        });
        await queryRunner.manager.save(newReceipt); // Lưu phiếu nhập chính trước

        let calculatedTotalAmount = 0;

        // --- Xử lý từng Chi Tiết Phiếu Nhập ---
        for (const detailDto of details) {
            const product = await queryRunner.manager.findOneBy(Product, { id: detailDto.productId, isActive: true });
            if (!product) {
            throw new NotFoundException(`Sản phẩm với ID ${detailDto.productId} không tồn tại hoặc không hoạt động.`);
            }

            // Tạo chi tiết phiếu nhập
            const newDetail = queryRunner.manager.create(ImportReceiptDetail, {
                importReceipt: newReceipt, // Liên kết với phiếu nhập vừa tạo
                product: product,
                quantity: detailDto.quantity,
                importPrice: detailDto.importPrice,
            });
            await queryRunner.manager.save(newDetail); // Lưu chi tiết

            // Tính tổng tiền tạm thời
            calculatedTotalAmount += detailDto.quantity * detailDto.importPrice;

            // **QUAN TRỌNG: Cập nhật tồn kho chỉ khi phiếu được đánh dấu COMPLETED**
            if (newReceipt.status === ImportReceiptStatus.COMPLETED) {
                product.stock_quantity += detailDto.quantity;
                await queryRunner.manager.save(product); // Lưu lại sản phẩm với stock mới
                this.logger.log(`Updated stock for product ID ${product.id}: +${detailDto.quantity}`);
            }
        }

        // --- Cập nhật lại Tổng tiền cho Phiếu Nhập ---
        newReceipt.totalAmount = calculatedTotalAmount;
        await queryRunner.manager.save(newReceipt); // Lưu lại phiếu nhập với tổng tiền đúng

        // --- Kết thúc Transaction ---
        await queryRunner.commitTransaction();

        // Lấy lại thông tin đầy đủ sau khi commit thành công
        const savedReceipt = await this.importReceiptRepository.findOne({
             where: { id: newReceipt.id },
             relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator' */ ]
        });

        return instanceToPlain(savedReceipt);

    } catch (error) {
        this.logger.error(`Failed to create import receipt: ${error.message}`, error.stack);
        await queryRunner.rollbackTransaction(); // Hoàn tác nếu có lỗi
        if (error instanceof NotFoundException) {
            throw error;
        }
        throw new InternalServerErrorException('Tạo phiếu nhập thất bại. Đã hoàn tác các thay đổi.');
    } finally {
        await queryRunner.release(); // Luôn giải phóng queryRunner
    }
  }


  async findAll(query: QueryImportReceiptDto): Promise<any> {
    const { page = 1, limit = 10, vendorId, receiptCode, status, startDate, endDate, isActive } = query;
    const where: FindOptionsWhere<ImportReceipt> = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }
    if (receiptCode) {
      where.receiptCode = ILike(`%${receiptCode}%`);
    }
    if (status) {
        where.status = status;
    }
    if (startDate && endDate) {
        where.importDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
        where.importDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
        where.importDate = LessThanOrEqual(new Date(endDate));
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true; // Mặc định lấy active
    }

    const [data, total] = await this.importReceiptRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { importDate: 'DESC', creationDate: 'DESC' },
      relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator'*/ ], // Load relations
    });

    const totalPage = Math.ceil(total / limit);
    return {
      total,
      totalPage,
      currentPage: page,
      limit,
      data: instanceToPlain(data),
    };
  }

  async findOne(id: number): Promise<any> {
    const receipt = await this.importReceiptRepository.findOne({
      where: { id }, // Lấy cả inactive để xem chi tiết
      relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator'*/ ],
    });
    if (!receipt) {
      throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại.`);
    }
    return instanceToPlain(receipt);
  }

  // Cập nhật thông tin cơ bản của phiếu nhập (vd: notes, status)
  // KHÔNG cập nhật details ở đây để tránh phức tạp về stock
  async update(id: number, updateImportReceiptDto: UpdateImportReceiptDto): Promise<any> {
    const receipt = await this.importReceiptRepository.findOne({ where:{ id }, relations: ['importReceiptDetails', 'importReceiptDetails.product'] });
    if (!receipt) {
        throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại.`);
    }

    const { status: newStatus, ...otherUpdateData } = updateImportReceiptDto;
    const oldStatus = receipt.status;

    // --- Bắt đầu Transaction ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Cập nhật các trường khác
        queryRunner.manager.merge(ImportReceipt, receipt, otherUpdateData);

        // Xử lý cập nhật STATUS (Phần quan trọng)
        if (newStatus && newStatus !== oldStatus) {
            // Trường hợp 1: Chuyển từ trạng thái khác sang COMPLETED
            if (newStatus === ImportReceiptStatus.COMPLETED && oldStatus !== ImportReceiptStatus.COMPLETED) {
                this.logger.log(`Updating receipt ID ${id} status to COMPLETED. Updating stock...`);
                for (const detail of receipt.importReceiptDetails) {
                    const product = detail.product; // Đã load từ relation
                    if (!product) {
                        // Nên có check này để đảm bảo, dù relation đã load
                        throw new InternalServerErrorException(`Không tìm thấy sản phẩm ID ${detail.productId} cho chi tiết ID ${detail.id}`);
                    }
                    product.stock_quantity += detail.quantity;
                    await queryRunner.manager.save(product);
                    this.logger.log(`Updated stock for product ID ${product.id}: +${detail.quantity}`);
                }
            }
            // Trường hợp 2: Chuyển từ COMPLETED sang trạng thái khác (PENDING hoặc CANCELLED) - Hoàn tác stock
            else if (oldStatus === ImportReceiptStatus.COMPLETED && (newStatus === ImportReceiptStatus.PENDING || newStatus === ImportReceiptStatus.CANCELLED)) {
                this.logger.log(`Updating receipt ID ${id} status from COMPLETED to ${newStatus}. Reverting stock...`);
                for (const detail of receipt.importReceiptDetails) {
                     const product = detail.product;
                     if (!product) {
                         throw new InternalServerErrorException(`Không tìm thấy sản phẩm ID ${detail.productId} cho chi tiết ID ${detail.id}`);
                     }
                     // Kiểm tra số lượng tồn trước khi trừ để tránh âm kho (tùy nghiệp vụ)
                     if (product.stock_quantity < detail.quantity) {
                        this.logger.warn(`Cannot revert stock for product ID ${product.id}. Current stock (${product.stock_quantity}) is less than import quantity (${detail.quantity}).`);
                         // Có thể throw lỗi hoặc chỉ log warning tùy yêu cầu
                        // throw new BadRequestException(`Không thể hoàn tác kho cho sản phẩm ${product.name}. Số lượng tồn (${product.stock_quantity}) nhỏ hơn số lượng nhập (${detail.quantity}).`);
                     } else {
                         product.stock_quantity -= detail.quantity;
                         await queryRunner.manager.save(product);
                         this.logger.log(`Reverted stock for product ID ${product.id}: -${detail.quantity}`);
                     }
                }
            }
             // Cập nhật status mới cho phiếu nhập
            receipt.status = newStatus;
        }

         // Lưu lại phiếu nhập với các thay đổi (bao gồm cả status nếu có)
        const updatedReceipt = await queryRunner.manager.save(receipt);

        // --- Kết thúc Transaction ---
        await queryRunner.commitTransaction();

        // Lấy lại thông tin đầy đủ
        const result = await this.importReceiptRepository.findOne({
             where: { id: updatedReceipt.id },
             relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator' */]
        });

        return instanceToPlain(result);

    } catch (error) {
        this.logger.error(`Failed to update import receipt ID ${id}: ${error.message}`, error.stack);
        await queryRunner.rollbackTransaction();
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error;
        }
        throw new InternalServerErrorException('Cập nhật phiếu nhập thất bại. Đã hoàn tác các thay đổi.');
    } finally {
        await queryRunner.release();
    }
  }


  // Soft delete phiếu nhập. Cần xem xét việc có hoàn tác stock hay không.
  // Thông thường, phiếu nhập đã COMPLETED thì không nên xóa/inactive, mà nên CANCEL.
  // Logic này giả định việc inactive KHÔNG hoàn tác stock.
  async delete(id: number): Promise<void> {
    const receipt = await this.importReceiptRepository.findOneBy({ id });
    if (!receipt) {
      throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại.`);
    }

    // Kiểm tra trạng thái trước khi inactive (tùy chọn)
    // if (receipt.status === ImportReceiptStatus.COMPLETED) {
    //     throw new BadRequestException('Không thể xóa phiếu nhập đã hoàn thành. Hãy chuyển trạng thái sang CANCELLED.');
    // }

    receipt.isActive = false;
    await this.importReceiptRepository.save(receipt);
    this.logger.log(`Soft deleted import receipt ID ${id}. Stock quantity was NOT reverted.`);

    // Nếu muốn Hard delete (không khuyến khích nếu đã có ràng buộc khóa ngoại):
    // await this.importReceiptRepository.delete(id);
  }
}