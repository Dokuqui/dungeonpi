import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  ITokenService,
  TokenPair,
  ExpectedJwtPayload,
} from '../../../../auth/app/interface/token-service.interface';
import { Role } from '../../../domain/enum/role.enum';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly configService: ConfigService) {}

  private signPayload(
    payload: Partial<ExpectedJwtPayload>,
    secret: string,
  ): string {
    const header = { alg: 'HS256', typ: 'JWT' };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64url');

    return `${signatureInput}.${signature}`;
  }

  generateTokenPair(
    userId: number,
    role: Role,
    tokenVersion: number,
    fingerprint: string,
  ): Promise<TokenPair> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const now = Math.floor(Date.now() / 1000);

    const accessPayload: ExpectedJwtPayload = {
      sub: userId,
      role: role,
      typ: 'access',
      iat: now,
      exp: now + 15 * 60, // 15 minutes,
      v: tokenVersion,
      fgp: fingerprint,
    };
    const accessToken = this.signPayload(accessPayload, secret);

    const refreshPayload: ExpectedJwtPayload = {
      sub: userId,
      role: role,
      typ: 'refresh',
      iat: now,
      exp: now + 7 * 24 * 60 * 60, // 7 Days
      v: tokenVersion,
      fgp: fingerprint,
    };
    const refreshToken = this.signPayload(refreshPayload, secret);

    return Promise.resolve({ accessToken, refreshToken });
  }

  verifyToken(
    token: string,
    currentFingerprint: string,
  ): Promise<ExpectedJwtPayload> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64url');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(encodedSignature),
        Buffer.from(expectedSignature),
      )
    ) {
      throw new Error('Invalid token signature! Tampering detected.');
    }

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString(
      'utf-8',
    );
    const payload = JSON.parse(payloadStr) as ExpectedJwtPayload;

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token has expired');
    }

    if (currentFingerprint !== 'skip' && payload.fgp !== currentFingerprint) {
      throw new Error('CRITICAL: Token hijacked! Device fingerprint mismatch.');
    }

    return Promise.resolve(payload);
  }
}
