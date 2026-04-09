import { Controller, Get } from '@nestjs/common';
import { LoggedUser } from '../auth/decorators/logged-user.decorator';
import { UserEntity } from './user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JWT_AUTH } from '../infra/swagger.config';

@ApiTags('users')
@ApiBearerAuth(JWT_AUTH)
@Controller('users')
export class UserController {
  @Get('profile')
  getProfile(@LoggedUser() user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
