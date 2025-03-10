import { PartialType } from '@nestjs/mapped-types';
import { CreateCartItemDto } from './create-cart-item.dto';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {
   @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
