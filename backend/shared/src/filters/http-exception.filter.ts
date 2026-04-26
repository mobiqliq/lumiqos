import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpStatusToErrorCode, ErrorCodes } from './error-codes';
import { CORRELATION_ID_HEADER } from '../logger/correlation.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers[CORRELATION_ID_HEADER] as string) || '-';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || message;
        details = res.details ?? undefined;
      }
    } else if (exception instanceof Error) {
      if (/^Cannot (GET|POST|PUT|PATCH|DELETE|HEAD) /.test(exception.message)) {
        status = HttpStatus.NOT_FOUND;
        message = 'Route not found';
      } else {
        message = this.isProduction ? 'An unexpected error occurred' : exception.message;
      }
    }

    const code = HttpStatusToErrorCode[status] || ErrorCodes.INTERNAL_001;

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} | ${status} | cid=${correlationId} | ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} | ${status} | cid=${correlationId} | ${message}`,
      );
    }

    response.status(status).json({
      code,
      message,
      ...(details ? { details } : {}),
      traceId: correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
