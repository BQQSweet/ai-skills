import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import dayjs from 'dayjs';

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

/**
 * 成功响应统一包装拦截器。
 *
 * 执行顺序上，它发生在 Controller / Service 正常 return 之后、响应真正发回前端之前。
 * 所以 Controller 里返回的通常只是业务数据，最终前端看到的是：
 * { code: 0, data: 原始返回值, msg: 'success' }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  private formatDateValue(value: unknown): unknown {
    if (value instanceof Date) {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatDateValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [
          key,
          this.formatDateValue(nestedValue),
        ]),
      );
    }

    return value;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // next.handle() 拿到的是“原始业务返回值”的流，map 用来统一改造成约定响应结构
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data: this.formatDateValue(data) as T,
        msg: 'success',
      })),
    );
  }
}
