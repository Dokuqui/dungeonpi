import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';

import { TOKEN_SERVICE } from '../interface/token-service.interface';
import { USER_REPOSITORY } from '../interface/user-repository.interface';
import { DEVICE_SESSION_REPOSITORY } from '../interface/device-session-repository.interface';
import { ChatGateway } from '../../../chat/api/chat.gateway';

import type {
  ITokenService,
  ExpectedJwtPayload,
} from '../interface/token-service.interface';
import type { IUserRepository } from '../interface/user-repository.interface';
import type { IDeviceSessionRepository } from '../interface/device-session-repository.interface';

export interface RefreshInputDto {
  refreshToken: string;
  currentIp: string;
  currentUserAgent: string;
}

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(DEVICE_SESSION_REPOSITORY)
    private readonly deviceSessionRepo: IDeviceSessionRepository,

    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async execute(input: RefreshInputDto) {
    let payload: ExpectedJwtPayload;

    try {
      // 🛠️ We add .trim() just in case Swagger accidentally added a hidden space or newline!
      const cleanToken = input.refreshToken.trim();
      payload = await this.tokenService.verifyToken(cleanToken, 'skip');
    } catch (err: any) {
      // 🚨 THE GHOST FINDER: Print the EXACT reason the Bouncer rejected it to your terminal!
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('🚨 BOUNCER REJECTED REFRESH TOKEN:', err.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.typ !== 'refresh')
      throw new UnauthorizedException('Wrong token type');

    const incomingHash = crypto
      .createHash('sha256')
      .update(input.refreshToken)
      .digest('hex');
    const session =
      await this.deviceSessionRepo.findByRefreshTokenHash(incomingHash);

    if (!session) throw new UnauthorizedException('Session not found');

    if (session.isRevoked) {
      console.error(
        `[SECURITY ALERT] Stolen token reuse attempted on Family: ${session.familyId}`,
      );

      this.chatGateway.server
        .to(`user_${session.userId}`)
        .emit('system_alert', {
          type: 'SECURITY_BREACH',
          content:
            'WARNING: Someone attempted to use a stolen session token from your account!',
          timestamp: new Date().toISOString(),
        });

      throw new UnauthorizedException(
        'Compromised session. Please log in again.',
      );
    }

    const currentFingerprint = crypto
      .createHash('sha256')
      .update(`${input.currentIp}-${input.currentUserAgent}`)
      .digest('hex');
    if (session.fingerprint !== currentFingerprint) {
      console.error(
        `[SECURITY ALERT] Fingerprint mismatch! Hijack attempt blocked.`,
      );

      await this.deviceSessionRepo.revokeFamily(session.familyId);

      this.chatGateway.server
        .to(`user_${session.userId}`)
        .emit('system_alert', {
          type: 'SECURITY_BREACH',
          content: `WARNING: A login attempt was blocked from an unrecognized device (IP: ${input.currentIp}). Your current sessions have been secured.`,
          timestamp: new Date().toISOString(),
        });

      throw new UnauthorizedException(
        'Security constraint failed. Session revoked.',
      );
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user) throw new UnauthorizedException('User no longer exists');

    if (user.tokenVersion !== payload.v) {
      await this.deviceSessionRepo.revokeFamily(session.familyId);
      throw new UnauthorizedException('Token version obsolete. Logged out.');
    }

    const newTokens = await this.tokenService.generateTokenPair(
      user.id!,
      user.role,
      user.tokenVersion,
      currentFingerprint,
    );

    const newRefreshHash = crypto
      .createHash('sha256')
      .update(newTokens.refreshToken)
      .digest('hex');

    await this.deviceSessionRepo.updateHash(session.familyId, newRefreshHash);

    return newTokens;
  }
}
