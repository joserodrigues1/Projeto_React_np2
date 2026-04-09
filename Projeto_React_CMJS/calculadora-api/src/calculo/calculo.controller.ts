import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CalculoService } from './calculo.service';
import { CalculoDto } from './dto/calculo.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('calculo')
@Controller('calculo')
export class CalculoController {
  constructor(private readonly calculoService: CalculoService) {}

  @Public()
  @Post('simular')
  simularCalculo(@Body() dados: CalculoDto) {
    const { renda, custos } = dados;

    // A validação por DTO
    if (
      renda === undefined ||
      custos === undefined ||
      renda < 0 ||
      custos < 0
    ) {
      throw new HttpException(
        'Renda e Custos são obrigatórios e devem ser números positivos.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const resultadoPF = this.calculoService.calculadoraIRPF(renda, custos);
      const resultadoPJ = this.calculoService.calculadoraIRPJ(renda);

      return {
        mensagem: `Comparação de PF e PJ realizada com sucesso.`,
        dados: {
          dadosEntrada: {
            rendaMensal: renda,
            custosMensais: custos,
          },
          resultadoPF: resultadoPF,
          resultadoPJ: resultadoPJ,
        },
      };
    } catch (error) {
      console.error('Erro durante o cálculo no serviço:', error);
      throw new HttpException(
        'Falha interna ao calcular tributação. Verifique o console do servidor.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
