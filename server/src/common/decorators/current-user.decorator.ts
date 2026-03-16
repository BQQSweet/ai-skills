import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 从 request.user 中取出当前登录用户。
 *
 * 这个装饰器本身不会“识别用户是谁”，它只是负责读取。
 * 真正把用户信息挂到 request.user 上的，是前面执行过的 JwtAuthGuard。
 *
 * 常见用法：
 * - @CurrentUser() user：拿到完整用户对象
 * - @CurrentUser('id') userId：只拿某个字段
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
