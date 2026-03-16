import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 全局异常过滤器。
 *
 * 当 Controller / Service 抛出异常时，Nest 会把异常交给过滤器处理。
 * 这个项目在这里把各种异常统一转换成前端约定的错误格式：
 * { code, data: null, msg }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 5000;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      // Nest 内置异常可能返回字符串，也可能返回对象，这里统一兜底取 message
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      code = status;
    }

    // 不暴露 500 原始堆栈
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error('Unhandled exception', exception);
      message = '服务器内部错误，请稍后重试';
    }

    // 统一错误响应格式，和 TransformInterceptor 的成功响应格式形成一套完整约定
    response.status(status).json({
      code,
      data: null,
      msg: Array.isArray(message) ? message[0] : message,
    });
  }
}
