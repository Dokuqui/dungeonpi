import { AuthUser } from '../../domain/class/auth-user.class';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: number): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<void>;
}
