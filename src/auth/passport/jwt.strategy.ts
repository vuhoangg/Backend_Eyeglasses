
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "JUSTSECRET" , 
    });
    console.log('JWT_ACCESS_TOKEN_SECRET:', process.env.JWT_SECRET) ;
  }

  async validate(payload: any) {
    return {
      userId: payload.userId, // Trích xuất userId từ payload
      username: payload.email, // Thay đổi từ payload.username thành payload.email nếu bạn sử dụng email làm username
      roles: payload.roles || [], // Thêm roles vào đây, đảm bảo có giá trị mặc định nếu không có roles
    };
  }
}

