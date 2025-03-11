import { PartialType } from '@nestjs/mapped-types';
import { CreatePromotionDto } from './create-promotion.dto';
import { IsOptional, IsString, IsEnum, IsNumber, IsDate } from 'class-validator';
export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
    @IsOptional()
    @IsString()
    code?: string;
  
    @IsOptional()
    @IsEnum(['percent', 'amount'])
    discountType?: 'percent' | 'amount';
  
    @IsOptional()
    @IsNumber()
    discountValue?: number;
  
    @IsOptional()
    @IsDate()
    startDate?: Date;
  
    @IsOptional()
    @IsDate()
    endDate?: Date;
  
    @IsOptional()
    isActive?: boolean;
}
