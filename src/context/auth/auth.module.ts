import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './api/auth.controller';

import { LoginUseCase } from './app/usecases/login.usecase';
import { USER_REPOSITORY } from './app/interface/user-repository.interface';
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
export class AuthModule {}
