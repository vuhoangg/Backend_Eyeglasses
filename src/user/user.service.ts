import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}



  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async getAll(): Promise<User[]> {
    return await this.userRepository.find({relations:["roles"]}); // Fetch with relations
  }

  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ["roles"] }); // Fetch with relations
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }




  async update(id: number, updateAdminDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Admin không tồn tại');
    }
      user.username = updateAdminDto.username !== undefined ? updateAdminDto.username : user.username;
      user.email = updateAdminDto.email !== undefined ? updateAdminDto.email : user.email;
      user.phone = updateAdminDto.phone !== undefined ? updateAdminDto.phone : user.phone; // Sửa thành phone
      const updatedAdmin = await this.userRepository.save(user);
      return instanceToPlain(updatedAdmin);;
  }

  

  async delete(id: number): Promise<void> {
    const user = await this.getOne(id); // Reuse getOne for validation
    await this.userRepository.remove(user);
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
