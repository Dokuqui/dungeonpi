import { Email } from './email.class';
import { Password } from './password.class';
import { Role } from '../enum/role.enum';

export class AuthUser {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _email: Email,
    private _password: Password,
    private _role: Role,
    private readonly _createdAt: Date,
    private _riskScore: number,
    private _tokenVersion: number,
  ) {}

  public static create(email: Email, password: Password): AuthUser {
    return new AuthUser(
      undefined,
      email,
      password,
      Role.PLAYER,
      new Date(),
      0,
      1,
    );
  }

  public static reconstitute(
    id: number,
    email: Email,
    password: Password,
    role: Role,
    createdAt: Date,
    riskScore: number,
    tokenVersion: number,
  ): AuthUser {
    return new AuthUser(
      id,
      email,
      password,
      role,
      createdAt,
      riskScore,
      tokenVersion,
    );
  }

  public get id(): number | undefined {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get password(): Password {
    return this._password;
  }

  public get role(): Role {
    return this._role;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get riskScore(): number {
    return this._riskScore;
  }

  public set riskScore(value: number) {
    this._riskScore = value;
  }

  public get tokenVersion(): number {
    return this._tokenVersion;
  }

  public incrementTokenVersion(): void {
    this._tokenVersion += 1;
  }

  public updatePassword(newHashedPassword: Password): void {
    if (!newHashedPassword.isHashed) {
      throw new Error('Entity rule violation: Password must be hashed.');
    }
    this._password = newHashedPassword;
  }

  // Only in dev mode
  public makeAdmin(): void {
    this._role = Role.ADMIN;
  }
}
