import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';
import { Role } from 'src/roles/entities/role.entity';
import { In } from 'typeorm';
@Injectable()
export class UserService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role) // Inject Role repository
    private readonly roleRepository: Repository<Role>,
  ) {}


  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roles, ...userDetails } = createUserDto; // Separate roles from user details
    const hashedPassword = await bcrypt.hash(userDetails.password, 10);
    const user = this.userRepository.create({
      ...userDetails,
      password: hashedPassword,
      roles: [], // Initialize roles array
    });

    if (roles && roles.length > 0) {
      // Find roles by IDs
      const foundRoles = await this.roleRepository.findByIds(roles);
      user.roles = foundRoles; // Assign roles to the user
    }

    return await this.userRepository.save(user);
  }



  
  

  

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<User> = {
      isActive: true // Default to isActive = true
    };
    const { phone, isActive, page = 1, limit = 10 } = query;

    if (phone) {
      where.phone = phone;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ["roles"], // Load relations here
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

  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ["roles"] }); // Fetch with relations
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }






  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'], // Nạp sẵn danh sách roles
    });

    if (!user) {
        throw new NotFoundException('User không tồn tại');
    }

    // Cập nhật các trường cơ bản
    user.username = updateUserDto.username ?? user.username;
    user.email = updateUserDto.email ?? user.email;
    user.phone = updateUserDto.phone ?? user.phone;
    user.address = updateUserDto.address ?? user.address;

    // Nếu có danh sách roleIds cần cập nhật
    if (updateUserDto.roles && Array.isArray(updateUserDto.roles) && updateUserDto.roles.length > 0) {
        const roles = await this.roleRepository.find({
            where: { id: In(updateUserDto.roles) },
        });

        if (roles.length !== updateUserDto.roles.length) {
            throw new NotFoundException('Một hoặc nhiều vai trò không hợp lệ');
        }

        user.roles = roles;
    }

    const updatedAdmin = await this.userRepository.save(user);
    return instanceToPlain(updatedAdmin);
}
  

  
  async delete(id: number): Promise<void> {
    const user = await this.getOne(id); // Reuse getOne for validation
        user.isActive = false;
        await this.userRepository.save(user); // Soft delete by setting isActive to false
  }



  async findOneByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: username, // Tìm kiếm theo username trong cột email
      },
      relations: ['roles', 'roles.permissions'], // Load quan hệ (nếu cần)
    });
  }

    // check password 
    isValidPassword(password: string, hash: string): boolean {
      console.log("Input Password:", password);
      console.log("Hashed Password:", hash);
      const result = bcrypt.compareSync(password, hash);
      console.log("check result",result  )
      return result; 
  
    }

}
