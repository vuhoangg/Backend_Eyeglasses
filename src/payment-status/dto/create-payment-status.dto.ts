import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePaymentStatusDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
