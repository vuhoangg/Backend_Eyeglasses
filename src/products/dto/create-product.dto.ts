// create-product.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @IsNotEmpty()
  @IsNumber()
  brand_id: number;

  imageProduct?: string;

  @IsOptional()
  @IsString()
  sku?: string;


}
