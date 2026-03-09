import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUserRepository } from '../../../app/interface/user-repository.interface';
import { AuthUser } from '../../../domain/auth-user.entity';
import { Email } from '../../../domain/valueObjects/email.vo';
import { Password } from '../../../domain/valueObjects/password.vo';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(emailString: string): Promise<AuthUser | null> {
    const ormUser = await this.ormRepository.findOne({
      where: { email: emailString },
    });

    if (!ormUser) {
      return null;
    }

    return this.toDomain(ormUser);
  }

  async save(user: AuthUser): Promise<void> {
    const ormUser = this.toOrmEntity(user);
    await this.ormRepository.save(ormUser);
  }

  private toDomain(ormEntity: UserOrmEntity): AuthUser {
    return AuthUser.reconstitute(
      ormEntity.id,
      Email.create(ormEntity.email),
      Password.createFromHash(ormEntity.password),
      ormEntity.createdAt,
    );
  }

  private toOrmEntity(domainEntity: AuthUser): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    if (domainEntity.id !== undefined) {
      ormEntity.id = domainEntity.id;
    }
    ormEntity.email = domainEntity.email.value;
    ormEntity.password = domainEntity.password.value;
    ormEntity.createdAt = domainEntity.createdAt;
    return ormEntity;
  }
}
