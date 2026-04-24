import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../interface/user-repository.interface';
import { PASSWORD_HASHER } from '../interface/password-hasher.interface';

import type { IUserRepository } from '../interface/user-repository.interface';
import type { IPasswordHasher } from '../interface/password-hasher.interface';

import { AuthUser } from '../../domain/class/auth-user.class';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { Email } from '../../domain/class/email.class';
import { Password } from '../../domain/class/password.class';
import { BloomFilter } from 'src/core/filters/bloom.filter';

export interface RegisterInputDto {
  email: string;
  passwordRaw: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject('BLOOM_FILTER_EMAIL')
    private readonly emailBloomFilter: BloomFilter,
  ) {}

  async execute(input: RegisterInputDto): Promise<void> {
    const emailVo = Email.create(input.email);
    const rawPasswordVo = Password.create(input.passwordRaw);

    if (this.emailBloomFilter.mightContain(emailVo.value)) {
      console.log(
        `[BloomFilter] Email <${emailVo.value}> might exist. Querying Database...`,
      );

      const existingUser = await this.userRepository.findByEmail(emailVo.value);
      if (existingUser) {
        throw new UserAlreadyExistsError(emailVo.value);
      }
    } else {
      console.log(
        `[BloomFilter] Email <${emailVo.value}> is unique. DB check bypassed!`,
      );
    }

    const hashedPasswordString = await this.passwordHasher.hash(
      rawPasswordVo.value,
    );
    const hashedPasswordVo = Password.createFromHash(hashedPasswordString);
    const newUser = AuthUser.create(emailVo, hashedPasswordVo);

    await this.userRepository.save(newUser);

    this.emailBloomFilter.add(emailVo.value);
  }
}
