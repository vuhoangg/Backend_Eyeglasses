import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        private jwtService: JwtService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Role) private roleRepository: Repository<Role>,

    ) {}

    async validateUser(email: string, password : string): Promise<any> {
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
          throw new UnauthorizedException('Incorrect email or password'); // Báo lỗi rõ ràng
      }
          const isValid = this.userService.isValidPassword(password , user.password)
          if(isValid === true)
              {
                  return user ;
              }
      
      throw new UnauthorizedException('Incorrect email or password'); // Báo lỗi nếu password không đúng
    }



    async login(user: any) {
      const payload = {
          username : user.username,
          email: user.email,
          sub: user.id, // Sử dụng user.id thay vì user.userId
          roles: user.roles.map(role => role.name), // Thêm roles vào payload
      };

      const accessToken = this.jwtService.sign(payload);

      return {

          status: 'success',
          message: 'Đăng nhập thành công',
          username : payload.username,
          role: payload.roles,
          token: accessToken,
      };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { ...userDetails } = createUserDto;
    const hashedPassword = await bcrypt.hash(userDetails.password, 10);

    // Tìm role 'customer'
    const customerRole = await this.roleRepository.findOne({
      where: { name: 'customer' },
    });

    if (!customerRole) {
      throw new NotFoundException('Customer role not found');
    }

    const user = this.userRepository.create({
      ...userDetails,
      password: hashedPassword,
      roles: [customerRole], // Gán role 'customer' mặc định
    });

    return await this.userRepository.save(user);
  }
  


  
}