import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import {
  type ITokenService,
  TOKEN_SERVICE,
} from 'src/context/auth/app/interface/token-service.interface';
import * as crypto from 'crypto';

interface ExpectedJwtPayload {
  sub: number;
  role: string;
  v: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: string;
    tokenVersion: number;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    const currentFingerprint = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

    try {
      const payload = (await this.tokenService.verifyToken(
        token,
        currentFingerprint,
      )) as ExpectedJwtPayload;

      request.user = {
        userId: payload.sub,
        role: payload.role,
        tokenVersion: payload.v,
      };
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Guard rejected token:', errorMessage);
      throw new UnauthorizedException('Invalid, expired, or stolen token');
    }
  }
}
