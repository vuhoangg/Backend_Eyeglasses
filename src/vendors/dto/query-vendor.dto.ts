import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryVendorDto {
  @IsOptional()
  @IsString()
  name?: string ;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) // Đảm bảo chuyển đổi string 'true'/'false' từ query param thành boolean
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1; // Giá trị mặc định

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10; // Giá trị mặc định
}