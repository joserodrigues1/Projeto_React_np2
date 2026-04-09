import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequest } from './dto/request/login.request';
import { RegisterRequest } from './dto/request/register.request';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/response/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginRequest;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log('Credenciais inválidas');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      console.log('Credenciais inválidas');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateToken(user);
  }

  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    const userExists = await this.userService.findByEmail(
      registerRequest.email,
    );
    if (userExists) throw new ConflictException('Email already registered');

    const salt = await bcrypt.genSalt(10);
    const user = new UserEntity();
    user.email = registerRequest.email;
    user.password = await bcrypt.hash(registerRequest.password, salt);
    user.name = registerRequest.name;
    const createdUser: UserEntity = await this.userService.save(user);
    return this.generateToken(createdUser);
  }

  private generateToken(user: UserEntity): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateUser(userId: string): Promise<UserEntity> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}
