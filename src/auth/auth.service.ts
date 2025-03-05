import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        private jwtService: JwtService

    ) {}

  async validateUser(username: string, password : string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    if (user) {
        const isValid = this.userService.isValidPassword(password , user.password)
        if(isValid === true)
            {
                return user ;
            }
    }
    return null;
  }

  // async login(user: any) {
  //   const { id, name , email, role, permission } = user ;
  //   const payload = { id, name , email, role, permission};
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
   
    return {
      username : payload.username,
      access_token: this.jwtService.sign(payload),
    };
  }

  
}