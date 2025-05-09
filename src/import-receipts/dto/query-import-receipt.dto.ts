import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min, IsDateString, IsEnum } from 'class-validator';
import { ImportReceiptStatus } from '../entities/import-receipt.entity';

export class QueryImportReceiptDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    vendorId?: number;

    @IsOptional()
    @IsString()
    receiptCode?: string;

    @IsOptional()
    @IsEnum(ImportReceiptStatus)
    status?: ImportReceiptStatus;


    @IsOptional()
    @IsDateString()
    startDate?: string; // Lọc theo ngày bắt đầu

    @IsOptional()
    @IsDateString()
    endDate?: string; // Lọc theo ngày kết thúc

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    limit?: number = 10;

     // THÊM CÁC THUỘC TÍNH NÀY
  @IsOptional()
  @IsString()
  sortBy?: string; // Ví dụ: 'creationDate', 'importDate', 'totalAmount'

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
  
}