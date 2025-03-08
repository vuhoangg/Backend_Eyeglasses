import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { IsOptional } from 'class-validator';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
    @IsOptional()
    isActive?: boolean;
}
