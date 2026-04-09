import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest } from './dto/request/login.request';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/request/register.request';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { AuthResponse } from './dto/response/auth.response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginRequest: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(loginRequest);
  }

  @Public()
  @Post('register')
  async register(
    @Body() registerRequest: RegisterRequest,
  ): Promise<AuthResponse> {
    return this.authService.register(registerRequest);
  }
}
