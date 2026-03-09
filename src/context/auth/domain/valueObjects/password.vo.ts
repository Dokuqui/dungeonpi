import { WeakPasswordError } from '../errors/weak-password.error';

export class Password {
  private constructor(
    private readonly _value: string,
    public readonly isHashed: boolean,
  ) {}

  public static create(rawPassword: string): Password {
    if (rawPassword.length < 6) {
      throw new WeakPasswordError(
        'Password must be at least 6 characters long.',
      );
    }

    return new Password(rawPassword, false);
  }

  public static createFromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  public get value(): string {
    return this._value;
  }
}
