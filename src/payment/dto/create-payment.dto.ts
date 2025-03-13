import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

   @IsNotEmpty()
    @IsNumber()
    paymentStatusId: number;
}