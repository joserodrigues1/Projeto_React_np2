import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CalculoDto {
  @ApiProperty({
    example: 5000,
    description: 'Renda mensal do usuário em reais',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  renda: number;

  @ApiProperty({
    example: 1500,
    description: 'Custos mensais do usuário em reais',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  custos: number;

  @ApiProperty({
    example: 'PF',
    description: 'Tipo de cálculo: PF (Pessoa Física) ou PJ (Pessoa Jurídica)',
  })
  @IsNotEmpty()
  @IsString()
  tipoCalculo: string;
}
