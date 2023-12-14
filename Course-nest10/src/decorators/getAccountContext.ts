import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAccountContext = createParamDecorator((data: string | string[], context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  if (!data) return request.user;

  if (typeof data === 'string') return request.user[data];

  if (Array.isArray(data)) {
    return data.map((item) => {
      return request.user[item];
    });
  }
});
