import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderStatusDto } from './create-order-status.dto';
import { IsString, IsOptional } from 'class-validator';
export class UpdateOrderStatusDto extends PartialType(CreateOrderStatusDto) {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
}
