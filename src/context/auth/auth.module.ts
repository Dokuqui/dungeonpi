import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

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
import { JwtStrategy } from './infra/persistence/security/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,

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
    JwtStrategy,
  ],
  exports: [],
})
export class AuthModule {}
