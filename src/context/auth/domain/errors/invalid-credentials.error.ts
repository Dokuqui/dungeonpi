import { DomainError } from '../../../../core/errors/domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password.', 'INVALID_CREDENTIALS');
  }
}
