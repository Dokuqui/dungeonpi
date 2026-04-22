import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { TOKEN_SERVICE } from '../interface/token-service.interface';
import { USER_REPOSITORY } from '../interface/user-repository.interface';
import { PASSWORD_HASHER } from '../interface/password-hasher.interface';
import {
  CONNECTION_LOG_REPOSITORY,
  type IConnectionLogRepository,
} from '../interface/connection-log-repository.interface';
import {
  DEVICE_SESSION_REPOSITORY,
  type IDeviceSessionRepository,
} from '../interface/device-session-repository.interface';

import type { ITokenService } from '../interface/token-service.interface';
import type { IUserRepository } from '../interface/user-repository.interface';
import type { IPasswordHasher } from '../interface/password-hasher.interface';

import { Email } from '../../domain/valueObjects/email.vo';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';

export interface LoginInputDto {
  email: string;
  passwordRaw: string;
  ip: string;
  userAgent: string;
}

export interface LoginOutputDto {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(CONNECTION_LOG_REPOSITORY)
    private readonly connectionLogRepo: IConnectionLogRepository,
    @Inject(DEVICE_SESSION_REPOSITORY)
    private readonly deviceSessionRepo: IDeviceSessionRepository,
  ) {}

  async execute(input: LoginInputDto): Promise<LoginOutputDto> {
    const emailVo = Email.create(input.email);
    const user = await this.userRepository.findByEmail(emailVo.value);

    if (!user) {
      await this.logConnection(null, input.ip, input.userAgent, 'FAIL');
      throw new InvalidCredentialsError();
    }

    if (user.id === undefined)
      throw new Error('Critical error: Saved user lacks an ID.');

    const isPasswordValid = await this.passwordHasher.compare(
      input.passwordRaw,
      user.password.value,
    );

    if (!isPasswordValid) {
      await this.logConnection(user.id, input.ip, input.userAgent, 'FAIL');

      user.riskScore += 1;
      if (user.riskScore > 5) {
        await this.logConnection(
          user.id,
          input.ip,
          input.userAgent,
          'SUSPICIOUS',
        );
      }
      await this.userRepository.save(user);

      throw new InvalidCredentialsError();
    }

    user.riskScore = 0;
    await this.userRepository.save(user);
    await this.logConnection(user.id, input.ip, input.userAgent, 'SUCCESS');

    const fingerprint = crypto
      .createHash('sha256')
      .update(`${input.ip}-${input.userAgent}`)
      .digest('hex');

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.role,
      user.tokenVersion,
      fingerprint,
    );

    const familyId = crypto.randomUUID();
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(tokens.refreshToken)
      .digest('hex');

    await this.deviceSessionRepo.create({
      familyId,
      userId: user.id,
      refreshTokenHash,
      fingerprint,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return tokens;
  }

  private async logConnection(
    userId: number | null,
    ip: string,
    userAgent: string,
    status: 'SUCCESS' | 'FAIL' | 'SUSPICIOUS',
  ) {
    await this.connectionLogRepo.create({
      userId,
      ipAddress: ip,
      userAgent,
      status,
    });
  }
}
