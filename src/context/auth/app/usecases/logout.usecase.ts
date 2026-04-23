import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { DEVICE_SESSION_REPOSITORY } from '../interface/device-session-repository.interface';
import type { IDeviceSessionRepository } from '../interface/device-session-repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(DEVICE_SESSION_REPOSITORY)
    private readonly deviceSessionRepo: IDeviceSessionRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await this.deviceSessionRepo.findByRefreshTokenHash(hash);

    if (session) {
      await this.deviceSessionRepo.revokeFamily(session.familyId);
      console.log(
        `[Auth] Session formally revoked for Family: ${session.familyId}`,
      );
    }
  }
}
