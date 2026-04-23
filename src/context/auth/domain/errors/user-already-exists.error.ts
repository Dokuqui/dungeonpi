import { DomainError } from '../../../../core/errors/domain.error';

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      `A user with email <${email}> already exists.`,
      'USER_ALREADY_EXISTS',
    );
  }
}
