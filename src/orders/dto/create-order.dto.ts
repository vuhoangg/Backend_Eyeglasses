import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @IsNotEmpty()
  @IsNumber()
  order_status_id: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional() // Cho phép giá trị null hoặc undefined
  @IsNumber()
  promotion_id?: number | null; // Thay đổi kiểu dữ liệu
}
