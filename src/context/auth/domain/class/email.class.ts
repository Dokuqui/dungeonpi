import { InvalidEmailError } from '../errors/invalid-email.error';

export class Email {
  private constructor(private readonly _value: string) {}

  public static create(email: string): Email {
    const formattedEmail = email.trim().toLowerCase();

    if (!this.isValid(formattedEmail)) {
      throw new InvalidEmailError(email);
    }

    return new Email(formattedEmail);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    return this._value === other.value;
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
