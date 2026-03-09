import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../interface/user-repository.interface';
import { PASSWORD_HASHER } from '../interface/password-hasher.interface';

import type { IUserRepository } from '../interface/user-repository.interface';
import type { IPasswordHasher } from '../interface/password-hasher.interface';

import { Email } from '../../domain/valueObjects/email.vo';
import { Password } from '../../domain/valueObjects/password.vo';
import { AuthUser } from '../../domain/auth-user.entity';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';

export interface RegisterInputDto {
  email: string;
  passwordRaw: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterInputDto): Promise<void> {
    const emailVo = Email.create(input.email);
    const rawPasswordVo = Password.create(input.passwordRaw);

    const existingUser = await this.userRepository.findByEmail(emailVo.value);
    if (existingUser) {
      throw new UserAlreadyExistsError(emailVo.value);
    }

    const hashedPasswordString = await this.passwordHasher.hash(
      rawPasswordVo.value,
    );

    const hashedPasswordVo = Password.createFromHash(hashedPasswordString);

    const newUser = AuthUser.create(emailVo, hashedPasswordVo);

    await this.userRepository.save(newUser);
  }
}
