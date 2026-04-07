import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : { message: (exception as any)?.message || 'Internal server error' };

    // Log full stack and request info for debugging (App Insights will pick this up)
    this.logger.error({
      message: 'Unhandled exception caught',
      status,
      path: request.originalUrl,
      method: request.method,
      body: request.body,
      params: request.params,
      query: request.query,
      exception: (exception as any)?.stack || exception,
    });

    response.status(status).json({
      ...(typeof message === 'string' ? { message } : message),
      statusCode: status,
    });
  }
}
