import { Controller, Get, Post, Body, Patch, Param, Delete , Request, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

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

}
