import { IsNotEmpty, IsNumber, Min, IsPositive } from 'class-validator';

export class CreateImportReceiptDetailDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive() // ID sản phẩm phải là số dương
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1) // Số lượng ít nhất là 1
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0) // Giá nhập không âm
  importPrice: number;
}