import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true }) // Đảm bảo mỗi phần tử trong mảng là số
    permissions?: number[];
}

 