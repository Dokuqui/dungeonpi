import { DomainError } from '../../../../core/errors/domain.error';

export class WeakPasswordError extends DomainError {
  constructor(message: string) {
    super(message, 'WEAK_PASSWORD');
  }
}
