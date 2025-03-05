import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { Admin } from './entities/admin.entity';
import aqp from 'api-query-params';
import { QueryDto } from './dto/query.dto';


@Injectable()
export class AdminsService {

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

  ) {}

  gethashPassword = (password: string) =>{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }
 


  async create(createAdminDto: CreateAdminDto): Promise<any> {
    const hashPassword = this.gethashPassword(createAdminDto.password);
    const {name, email, password, phone   } = createAdminDto  ; 
    let newAdmin = await this.adminRepository.create({
      name,
      email,
      phone, 
       password :hashPassword ,
     });
    console.log("check user ", newAdmin );
    return instanceToPlain(await this.adminRepository.save(newAdmin));
  }


  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Admin> = {};
    const { phone, isActive, page = 1, limit = 10 } = query;

    if (phone) {
      where.phone = phone;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.adminRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
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

  async findOne(id: number): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException('Admin không tồn tại');
    }

    return instanceToPlain(admin);
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<any> {
    const admin = await this.adminRepository.findOneBy({ id });

    if (!admin) {
      throw new NotFoundException('Admin không tồn tại');
    }
      admin.name = updateAdminDto.name !== undefined ? updateAdminDto.name : admin.name;
      admin.email = updateAdminDto.email !== undefined ? updateAdminDto.email : admin.email;
      admin.phone = updateAdminDto.phone !== undefined ? updateAdminDto.phone : admin.phone; // Sửa thành phone
      const updatedAdmin = await this.adminRepository.save(admin);
      return instanceToPlain(updatedAdmin);;
  }

  async remove(id: number): Promise<void> {
    const admin = await this.findOne(id);

    if (!admin) {
      throw new NotFoundException('Admin không tồn tại');
    }

    await this.adminRepository.remove(admin);
  }



}
