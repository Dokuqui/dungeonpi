import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json(exceptionResponse);
    }

    if (exception instanceof Error) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';

      switch (exception.name) {
        case 'InvalidEmailError':
        case 'WeakPasswordError':
          status = HttpStatus.BAD_REQUEST;
          message = exception.message;
          break;
        case 'InvalidCredentialsError':
          status = HttpStatus.UNAUTHORIZED;
          message = exception.message;
          break;
        case 'UserAlreadyExistsError':
          status = HttpStatus.CONFLICT;
          message = exception.message;
          break;
        default:
          console.error('Unhandled Exception:', exception);
          break;
      }

      return response.status(status).json({
        statusCode: status,
        error: exception.name,
        message: message,
        timestamp: new Date().toISOString(),
      });
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
