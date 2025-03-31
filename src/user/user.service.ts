import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { ILike } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
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
    const { username , isActive, page = 1, limit = 10 } = query;

    if (username) {
      where.username = ILike(`%${username}%`); // Tìm kiếm gần đúng
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
    const user = await this.userRepository.findOne({ where: { id ,isActive: true  }, relations: ["roles"] }); // Fetch with relations
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }






  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'], // Eagerly load roles
    });

    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Destructure roles from the update DTO.  Other props are assigned using Object.assign.
    const { roles, ...userDetails } = updateUserDto;

    // Assign basic properties directly
    Object.assign(user, userDetails);

    // Handle password update (hash it)
    if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Handle roles update
    if (roles !== undefined) { // Check if roles is provided in the DTO
        if (Array.isArray(roles) && roles.length > 0) {
            const foundRoles = await this.roleRepository.find({
                where: { id: In(roles) },
            });

            if (foundRoles.length !== roles.length) {
                throw new NotFoundException('One or more roles not found');
            }

            user.roles = foundRoles; // Replace existing roles with the new ones
        } else {
            // If roles is an empty array, remove all roles from the user
            user.roles = [];
        }
    }

    const updatedUser = await this.userRepository.save(user);
    return instanceToPlain(updatedUser);
}
  

  


  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({where:{id}});
    if (!user) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
   user.isActive = false;
    await this.userRepository.save(user);
  }



  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: email, // Tìm kiếm theo username trong cột email
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


    async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
      }
  
      // Xác thực mật khẩu cũ
      const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu cũ không đúng');
      }
  
      // Mã hóa mật khẩu mới
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
  
      // Cập nhật mật khẩu
      user.password = hashedPassword;
      await this.userRepository.save(user);
    }

}
