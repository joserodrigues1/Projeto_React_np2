import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ContatoDto {
  @IsNotEmpty({ message: 'O campo Nome é obrigatório.' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  nome: string;

  @IsNotEmpty({ message: 'O campo Email é obrigatório.' })
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  email: string;

  @IsNotEmpty({ message: 'A mensagem é obrigatória.' })
  @MinLength(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' })
  @MaxLength(500, { message: 'A mensagem não pode exceder 500 caracteres.' })
  duvida: string;
}
