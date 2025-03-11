import { IsNotEmpty, IsString, IsEnum, IsNumber, IsDate, IsOptional, IsBoolean } from 'class-validator';

export class CreatePromotionDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(['percent', 'amount'])
  discountType: 'percent' | 'amount';

  @IsNotEmpty()
  @IsNumber()
  discountValue: number;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;

      
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
