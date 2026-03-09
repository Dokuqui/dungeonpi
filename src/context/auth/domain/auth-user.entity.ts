import { Email } from './valueObjects/email.vo';
import { Password } from './valueObjects/password.vo';

export class AuthUser {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _email: Email,
    private _password: Password,
    private readonly _createdAt: Date,
  ) {}

  public static create(email: Email, password: Password): AuthUser {
    return new AuthUser(undefined, email, password, new Date());
  }

  public static reconstitute(
    id: number,
    email: Email,
    password: Password,
    createdAt: Date,
  ): AuthUser {
    return new AuthUser(id, email, password, createdAt);
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

  public get createdAt(): Date {
    return this._createdAt;
  }

  public updatePassword(newHashedPassword: Password): void {
    if (!newHashedPassword.isHashed) {
      throw new Error('Entity rule violation: Password must be hashed.');
    }
    this._password = newHashedPassword;
  }
}
