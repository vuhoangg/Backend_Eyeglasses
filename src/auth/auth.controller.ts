import { Controller, Get, Post, Body, Patch, Param, Delete , Request, UseGuards, HttpStatus, HttpCode, } from '@nestjs/common';
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private Service: AuthService
  ) {}




  @UseGuards(AuthGuard('local'))
  @Post('login')
  async handleLogin
   (@Request() req) {
    return this.authService.login(req.user)
   }

   @UseGuards(JwtAuthGuard)
   @Get('profile')
   getProfile(@Request() req) {
     return req.user;
   }

   @Post('register')
   async register(@Body() createUserDto: CreateUserDto) {
     const user = await this.authService.register(createUserDto);
     return {
       statusCode: HttpStatus.CREATED,
       message: 'User registered successfully',
       data: user,
     };
   }

   @Post('logout')
   @HttpCode(HttpStatus.OK) // trả về mã trạng thái 200 OK
   async logout(): Promise<{ message: string }> {
       return { message: 'Đăng xuất thành công' };
   }

}
