import {
  BadRequestException,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const validationErrors = exception.getResponse()?.['message'] || [];
    const formattedErrors = this.formatErrors(validationErrors);

    const status = HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: 'Bad Request',
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatErrors(errors: ValidationError[]): string[] {
    const result: string[] = [];

    errors.forEach((err) => {
      Object.values(err.constraints).forEach((message) => {
        result.push(message);
      });
    });

    return result;
  }
}
