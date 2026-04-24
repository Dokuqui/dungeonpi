import { forwardRef, Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './api/auth.controller';

import { LoginUseCase } from './app/usecases/login.usecase';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from './app/interface/user-repository.interface';
import { PASSWORD_HASHER } from './app/interface/password-hasher.interface';
import { TOKEN_SERVICE } from './app/interface/token-service.interface';

import { UserOrmEntity } from './infra/persistence/entities/user.orm-entity';
import { UserRepository } from './infra/persistence/repo/user.repository';
import { BcryptPasswordHasher } from './infra/persistence/security/bcrypt-password-hasher';
import { JwtTokenService } from './infra/persistence/security/jwt-token.service';
import { RegisterUseCase } from './app/usecases/register.usecase';
import { ConnectionLogOrmEntity } from './infra/persistence/entities/connection-log.orm-entity';
import { DeviceSessionOrmEntity } from './infra/persistence/entities/device-session.orm-entity';
import { CONNECTION_LOG_REPOSITORY } from './app/interface/connection-log-repository.interface';
import { ConnectionLogRepository } from './infra/persistence/repo/connection-log.repository';
import { DEVICE_SESSION_REPOSITORY } from './app/interface/device-session-repository.interface';
import { DeviceSessionRepository } from './infra/persistence/repo/device-session.repository';
import { ChatModule } from '../chat/chat.module';
import { RefreshUseCase } from './app/usecases/referesh.usecase';
import { LogoutUseCase } from './app/usecases/logout.usecase';
import { BloomFilter } from 'src/core/filters/bloom.filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      ConnectionLogOrmEntity,
      DeviceSessionOrmEntity,
    ]),
    forwardRef(() => ChatModule),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    LogoutUseCase,
    RegisterUseCase,
    RefreshUseCase,
    {
      provide: 'BLOOM_FILTER_EMAIL',
      useFactory: () => new BloomFilter(100000, 3),
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: CONNECTION_LOG_REPOSITORY,
      useClass: ConnectionLogRepository,
    },
    {
      provide: DEVICE_SESSION_REPOSITORY,
      useClass: DeviceSessionRepository,
    },
  ],
  exports: [TOKEN_SERVICE, PASSWORD_HASHER],
})
export class AuthModule implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject('BLOOM_FILTER_EMAIL')
    private readonly emailBloomFilter: BloomFilter,
  ) {}

  async onModuleInit() {
    console.log('[AuthModule] Bootstrapping Email Bloom Filter...');

    try {
      const allUsers = await this.userRepository.findAll();

      for (const user of allUsers) {
        this.emailBloomFilter.add(user.email.value);
      }

      console.log(
        `[AuthModule] Bloom Filter securely loaded with ${allUsers.length} existing emails.`,
      );
    } catch (error) {
      console.error(
        '[AuthModule] Failed to bootstrap Bloom Filter. Does findAll() exist?',
        error,
      );
    }
  }
}
