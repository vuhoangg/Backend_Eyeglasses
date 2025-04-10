import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}