import { Inject, Injectable } from '@nestjs/common';

import { TOKEN_SERVICE } from '../interface/token-service.interface';
import { USER_REPOSITORY } from '../interface/user-repository.interface';
import { PASSWORD_HASHER } from '../interface/password-hasher.interface';

import type { ITokenService } from '../interface/token-service.interface';
import type { IUserRepository } from '../interface/user-repository.interface';
import type { IPasswordHasher } from '../interface/password-hasher.interface';

import { Email } from '../../domain/valueObjects/email.vo';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';

export interface LoginInputDto {
  email: string;
  passwordRaw: string;
}

export interface LoginOutputDto {
  accessToken: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInputDto): Promise<LoginOutputDto> {
    const emailVo = Email.create(input.email);

    const user = await this.userRepository.findByEmail(emailVo.value);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.passwordRaw,
      user.password.value,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (user.id === undefined) {
      throw new Error('Critical error: Saved user lacks an ID.');
    }

    const accessToken = await this.tokenService.generateToken(user.id);

    return { accessToken };
  }
}
