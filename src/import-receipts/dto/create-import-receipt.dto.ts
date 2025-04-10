import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
  IsEnum, // Thêm IsEnum
} from 'class-validator';
import { CreateImportReceiptDetailDto } from './create-import-receipt-detail.dto';
import { ImportReceiptStatus } from '../entities/import-receipt.entity'; // Import enum


export class CreateImportReceiptDto {
  @IsNotEmpty()
  @IsNumber()
  vendorId: number;

  @IsOptional()
  @IsString()
  receiptCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString() // Ngày nhập có thể truyền vào hoặc để DB tự tạo
  importDate?: string;

  // @IsOptional() // Bỏ comment nếu bạn implement creator_id và lấy từ request (ví dụ: JWT payload)
  // @IsNumber()
  // creatorId?: number;

  // Thêm status khi tạo nếu muốn, nếu không sẽ mặc định là PENDING
  @IsOptional()
  @IsEnum(ImportReceiptStatus)
  status?: ImportReceiptStatus = ImportReceiptStatus.PENDING; // Mặc định là PENDING


  @IsArray()
  @ValidateNested({ each: true }) // Validate từng object trong mảng
  @ArrayMinSize(1) // Ít nhất phải có 1 sản phẩm trong phiếu nhập
  @Type(() => CreateImportReceiptDetailDto) // Chỉ định kiểu cho class-transformer
  details: CreateImportReceiptDetailDto[];
}