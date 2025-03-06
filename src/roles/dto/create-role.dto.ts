import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray() // Add validation for roles
  @Type(() => Number)
  permissions?: number[]; // Array of role IDs
}
