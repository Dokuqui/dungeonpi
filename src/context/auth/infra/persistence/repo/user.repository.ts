import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUserRepository } from '../../../app/interface/user-repository.interface';
import { AuthUser } from '../../../domain/class/auth-user.class';
import { Email } from 'src/context/auth/domain/class/email.class';
import { Password } from 'src/context/auth/domain/class/password.class';

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
      ormEntity.role,
      ormEntity.createdAt,
      ormEntity.riskScore,
      ormEntity.tokenVersion,
    );
  }

  private toOrmEntity(domainEntity: AuthUser): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    if (domainEntity.id !== undefined) {
      ormEntity.id = domainEntity.id;
    }
    ormEntity.email = domainEntity.email.value;
    ormEntity.password = domainEntity.password.value;
    ormEntity.role = domainEntity.role;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.riskScore = domainEntity.riskScore;
    ormEntity.tokenVersion = domainEntity.tokenVersion;
    return ormEntity;
  }

  async findById(id: number): Promise<AuthUser | null> {
    const userOrm = await this.ormRepository.findOne({ where: { id } });
    if (!userOrm) return null;
    return this.toDomain(userOrm);
  }
}
