import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ResultadoCalculoEmailDto {
  @IsNotEmpty({ message: 'O destinatário é obrigatório.' })
  @IsEmail({}, { message: 'O e-mail deve ser válido.' })
  destinatario: string;

  @IsNotEmpty({ message: 'A renda é obrigatória.' })
  @IsNumber({}, { message: 'A renda deve ser um número.' })
  @Min(0, { message: 'A renda não pode ser negativa.' })
  renda: number;

  @IsNotEmpty({ message: 'Os custos são obrigatórios.' })
  @IsNumber({}, { message: 'Os custos devem ser um número.' })
  @Min(0, { message: 'Os custos não podem ser negativos.' })
  custos: number;

  @IsNotEmpty({ message: 'O tipo de cálculo é obrigatório.' })
  @IsString()
  tipoCalculo: 'PF' | 'PJ';
}
