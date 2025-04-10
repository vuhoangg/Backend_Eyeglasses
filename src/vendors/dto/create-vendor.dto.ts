import { IsString, IsEmail, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  logo?: string; // Chỉ lưu tên file, handle upload ở controller/service khác

  @IsOptional()
  @IsString()
  description?: string;
}