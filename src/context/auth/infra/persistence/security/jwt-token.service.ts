import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from 'src/context/auth/app/interface/token-service.interface';
import { Role } from 'src/context/auth/domain/role.enum';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(userId: number, role: Role): Promise<string> {
    const payload = { sub: userId, role: role };

    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }
}
