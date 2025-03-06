import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDateColumn, FindOptionsWhere, In, Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { QueryDto } from './dto/query.dto';
import { instanceToPlain } from 'class-transformer';
import { Permission } from 'src/permissions/entities/permission.entity';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const {permissions , ...roleDetails } =  createRoleDto;
    const role = this.roleRepository.create({
      ...roleDetails,
      permissions: [] ,
    });

    if (permissions && permissions.length > 0) {
      // Find roles by IDs
      const foundPermissions  = await this.permissionRepository.findByIds(permissions);
      role.permissions = foundPermissions; // Assign roles to the user
    }
    return await this.roleRepository.save(role);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Role> = {
      isActive: true // Default to isActive = true
    };
    const { isActive, page = 1, limit = 10 } = query;
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [data, total] = await this.roleRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['permissions'],
    });
    const totalPage = Math.ceil(total / limit);
    return {
      total,
      totalPage,
      page,
      limit,
      data: instanceToPlain(data),
    };
  }


    async getOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['permissions', 'users']  }); // Fetch with relations
    if (!role) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return role;
  }

  // async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
  //   const role = await this.getOne(id);
  //   Object.assign(role, updateRoleDto);
  //   return await this.roleRepository.save(role);
  // }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<any> {
    const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'], // Nạp sẵn danh sách roles
    });

    if (!role) {
        throw new NotFoundException('Roles không tồn tại');
    }

    // Cập nhật các trường cơ bản
    role.name = updateRoleDto.name?? role.name;
    role.description = updateRoleDto.description ?? role.description;


    // Nếu có danh sách roleIds cần cập nhật
    if (updateRoleDto.permissions && Array.isArray(updateRoleDto.permissions) && updateRoleDto.permissions.length > 0) {
        const permissions = await this.permissionRepository.find({
            where: { id: In(updateRoleDto.permissions) },
        });

        if (permissions.length !== updateRoleDto.permissions.length) {
            throw new NotFoundException('Một hoặc nhiều vai trò không hợp lệ');
        }

        role.permissions = permissions;
    }
  }
   
  async delete(id: number): Promise<void> {
    const user = await this.getOne(id); // Reuse getOne for validation
        user.isActive = false;
        await this.roleRepository.save(user); // Soft delete by setting isActive to false
  }



}
