import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../errors/domain.error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    switch (exception.code) {
      case 'INVALID_EMAIL':
      case 'WEAK_PASSWORD':
        status = HttpStatus.BAD_REQUEST;
        break;
      case 'INVALID_CREDENTIALS':
        status = HttpStatus.UNAUTHORIZED;
        break;
      case 'USER_ALREADY_EXISTS':
        status = HttpStatus.CONFLICT;
        break;
      default:
        console.error('Unhandled Exception:', exception);
        break;
    }

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      code: exception.code,
    });
  }
}
