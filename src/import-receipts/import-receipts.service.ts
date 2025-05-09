// src/import-receipts/import-receipts.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual, ILike, FindOptionsOrder } from 'typeorm'; // Thêm FindOptionsOrder
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
    private readonly dataSource: DataSource,
  ) {}

  // ... (create, findOne, update, delete methods không thay đổi) ...
  async create(createImportReceiptDto: CreateImportReceiptDto /*, creatorId?: number */): Promise<any> {
    const { vendorId, details, status, ...receiptData } = createImportReceiptDto;

    const vendor = await this.vendorRepository.findOneBy({ id: vendorId, isActive: true });
    if (!vendor) {
      throw new NotFoundException(`Nhà cung cấp với ID ${vendorId} không tồn tại hoặc không hoạt động.`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const newReceipt = queryRunner.manager.create(ImportReceipt, {
            ...receiptData,
            vendor: vendor,
            status: status || ImportReceiptStatus.PENDING,
            totalAmount: 0,
            // creatorId: creatorId,
        });
        await queryRunner.manager.save(newReceipt);

        let calculatedTotalAmount = 0;

        for (const detailDto of details) {
            const product = await queryRunner.manager.findOneBy(Product, { id: detailDto.productId, isActive: true });
            if (!product) {
            throw new NotFoundException(`Sản phẩm với ID ${detailDto.productId} không tồn tại hoặc không hoạt động.`);
            }

            const newDetail = queryRunner.manager.create(ImportReceiptDetail, {
                importReceipt: newReceipt,
                product: product,
                quantity: detailDto.quantity,
                importPrice: detailDto.importPrice,
            });
            await queryRunner.manager.save(newDetail);

            calculatedTotalAmount += detailDto.quantity * detailDto.importPrice;

            if (newReceipt.status === ImportReceiptStatus.COMPLETED) {
                product.stock_quantity += detailDto.quantity;
                await queryRunner.manager.save(product);
                this.logger.log(`Updated stock for product ID ${product.id}: +${detailDto.quantity}`);
            }
        }

        newReceipt.totalAmount = calculatedTotalAmount;
        await queryRunner.manager.save(newReceipt);

        await queryRunner.commitTransaction();

        const savedReceipt = await this.importReceiptRepository.findOne({
             where: { id: newReceipt.id },
             relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator' */ ]
        });

        return instanceToPlain(savedReceipt);

    } catch (error) {
        this.logger.error(`Failed to create import receipt: ${error.message}`, error.stack);
        await queryRunner.rollbackTransaction();
        if (error instanceof NotFoundException) {
            throw error;
        }
        throw new InternalServerErrorException('Tạo phiếu nhập thất bại. Đã hoàn tác các thay đổi.');
    } finally {
        await queryRunner.release();
    }
  }


  async findAll(query: QueryImportReceiptDto): Promise<any> {
    const {
        page = 1,
        limit = 10,
        vendorId,
        receiptCode,
        status,
        startDate,
        endDate,
        isActive,
        sortBy, // Lấy từ query
        sortOrder // Lấy từ query
    } = query;
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

    // Xây dựng đối tượng order động
    const orderOptions: FindOptionsOrder<ImportReceipt> = {};
    if (sortBy && sortOrder) {
        // Cần kiểm tra xem sortBy có phải là một trường hợp lệ của ImportReceipt không để tránh lỗi
        const allowedSortFields = ['id', 'receiptCode', 'totalAmount', 'status', 'importDate', 'creationDate', 'modifiedDate'];
        if (allowedSortFields.includes(sortBy)) {
            orderOptions[sortBy] = sortOrder;
        } else {
            // Nếu sortBy không hợp lệ, dùng default
            orderOptions.creationDate = 'DESC';
        }
    } else {
        // Mặc định sắp xếp theo ngày tạo mới nhất
        orderOptions.creationDate = 'DESC';
    }
    // Nếu muốn luôn có một sắp xếp phụ, có thể thêm ở đây
    // Ví dụ: nếu sortBy không phải là 'id', thì sắp xếp phụ theo id
    // if (sortBy !== 'id') {
    //   orderOptions.id = 'DESC'; // Hoặc 'ASC' tùy ý
    // }


    const [data, total] = await this.importReceiptRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: orderOptions, // Sử dụng orderOptions đã được xây dựng
      relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator'*/ ],
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
      where: { id },
      relations: ['vendor', 'importReceiptDetails', 'importReceiptDetails.product' /*, 'creator'*/ ],
    });
    if (!receipt) {
      throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại.`);
    }
    return instanceToPlain(receipt);
  }

  async update(id: number, updateImportReceiptDto: UpdateImportReceiptDto): Promise<any> {
    const receipt = await this.importReceiptRepository.findOne({ where:{ id }, relations: ['importReceiptDetails', 'importReceiptDetails.product'] });
    if (!receipt) {
        throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại.`);
    }

    const { status: newStatus, ...otherUpdateData } = updateImportReceiptDto;
    const oldStatus = receipt.status;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        queryRunner.manager.merge(ImportReceipt, receipt, otherUpdateData);

        if (newStatus && newStatus !== oldStatus) {
            if (newStatus === ImportReceiptStatus.COMPLETED && oldStatus !== ImportReceiptStatus.COMPLETED) {
                this.logger.log(`Updating receipt ID ${id} status to COMPLETED. Updating stock...`);
                for (const detail of receipt.importReceiptDetails) {
                    const product = detail.product;
                    if (!product) {
                        throw new InternalServerErrorException(`Không tìm thấy sản phẩm ID ${detail.productId} cho chi tiết ID ${detail.id}`);
                    }
                    product.stock_quantity += detail.quantity;
                    await queryRunner.manager.save(product);
                    this.logger.log(`Updated stock for product ID ${product.id}: +${detail.quantity}`);
                }
            }
            else if (oldStatus === ImportReceiptStatus.COMPLETED && (newStatus === ImportReceiptStatus.PENDING || newStatus === ImportReceiptStatus.CANCELLED)) {
                this.logger.log(`Updating receipt ID ${id} status from COMPLETED to ${newStatus}. Reverting stock...`);
                for (const detail of receipt.importReceiptDetails) {
                     const product = detail.product;
                     if (!product) {
                         throw new InternalServerErrorException(`Không tìm thấy sản phẩm ID ${detail.productId} cho chi tiết ID ${detail.id}`);
                     }
                     if (product.stock_quantity < detail.quantity) {
                        this.logger.warn(`Cannot revert stock for product ID ${product.id}. Current stock (${product.stock_quantity}) is less than import quantity (${detail.quantity}).`);
                     } else {
                         product.stock_quantity -= detail.quantity;
                         await queryRunner.manager.save(product);
                         this.logger.log(`Reverted stock for product ID ${product.id}: -${detail.quantity}`);
                     }
                }
            }
            receipt.status = newStatus;
        }

        const updatedReceipt = await queryRunner.manager.save(receipt);
        await queryRunner.commitTransaction();

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

  async delete(id: number): Promise<void> {
    const receipt = await this.importReceiptRepository.findOneBy({ id });
    if (!receipt) {
      throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại.`);
    }
    // if (receipt.status === ImportReceiptStatus.COMPLETED) {
    //     throw new BadRequestException('Không thể xóa phiếu nhập đã hoàn thành. Hãy chuyển trạng thái sang CANCELLED.');
    // }
    receipt.isActive = false;
    await this.importReceiptRepository.save(receipt);
    this.logger.log(`Soft deleted import receipt ID ${id}. Stock quantity was NOT reverted.`);
  }
}