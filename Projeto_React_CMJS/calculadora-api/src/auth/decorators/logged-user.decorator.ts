import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../user/user.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: UserEntity;
}

export const LoggedUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserEntity => {
    const request: RequestWithUser = ctx
      .switchToHttp()
      .getRequest<RequestWithUser>();
    return request.user;
  },
);
