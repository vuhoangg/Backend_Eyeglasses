import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { IsOptional, IsString, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
    @IsNotEmpty()
    @IsNumber()
    user_id: number;
    
    @IsOptional()
    @IsString()
    discountCode?: string;
  

    @IsOptional()
    @IsNumber()
    totalPrice?:number
    
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
