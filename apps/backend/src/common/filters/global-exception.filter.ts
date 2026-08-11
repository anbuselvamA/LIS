import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    const message =
      exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : (exception instanceof Error ? exception.message : 'Internal server error');

    // Generate standard API Error Response
    const errorResponse = {
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      errorCode: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'LIS-3000' : 'LIS-1000',
      errors: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      requestId: request.headers['x-request-id'] || 'system-generated', // Placeholder for actual correlation ID
      path: request.url,
    };

    // Log the error
    if (status >= 500) {
      this.logger.error(`[${request.method}] ${request.url} - ${status}`, exception instanceof Error ? exception.stack : '');
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${status} - ${JSON.stringify(errorResponse.errors)}`);
    }

    response.status(status).json(errorResponse);
  }
}
