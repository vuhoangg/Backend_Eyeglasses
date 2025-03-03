import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsNotEmpty()
    phone: string;
  
    @IsEmail()
    @IsString()
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    email?: string;
  
    @IsString()
    @IsNotEmpty()
    password: string;
}
