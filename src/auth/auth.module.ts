import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from 'src/roles/roles.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';


@Module({
  imports: [
    UserModule, // Import UsersModule to make UserService available
    PassportModule,
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') || "JUSTSECRET" , // Sử dụng 'secret'
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRE') || '1h', // Thời gian hết hạn
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Role]), // Import TypeOrmModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],


})
export class AuthModule {}
