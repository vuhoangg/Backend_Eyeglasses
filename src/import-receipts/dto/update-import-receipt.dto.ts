import { PartialType } from '@nestjs/mapped-types';
import { CreateImportReceiptDto } from './create-import-receipt.dto';
import { IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ImportReceiptStatus } from '../entities/import-receipt.entity';

// Không cho phép cập nhật 'details' qua DTO này,
// Cập nhật details cần logic riêng để xử lý stock
class UpdateReceiptPayload extends PartialType(CreateImportReceiptDto) {
    // Remove details field to prevent updating it directly here
    details?: never; // Ngăn chặn việc truyền details vào đây

     // Cho phép cập nhật status
     @IsOptional()
     @IsEnum(ImportReceiptStatus)
     status?: ImportReceiptStatus;

     // Thêm isActive
     @IsOptional()
     @IsBoolean()
     isActive?: boolean;
}

export class UpdateImportReceiptDto extends UpdateReceiptPayload {}