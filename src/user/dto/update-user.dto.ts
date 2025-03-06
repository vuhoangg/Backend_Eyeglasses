import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    username?: string;
    email?: string;
    phone?: string;
    roleIds?: number[]; // Thêm danh sách ID của Role
}
