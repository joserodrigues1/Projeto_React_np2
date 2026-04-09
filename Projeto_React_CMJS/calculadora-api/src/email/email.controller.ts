import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { ResultadoCalculoEmailDto } from './dto/resultado-calculo-email.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JWT_AUTH } from '../infra/swagger.config';
import { ContatoDto } from './dto/contato.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('email')
@ApiBearerAuth(JWT_AUTH)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post('resultado')
  async receberResultadoCalculo(@Body() dados: ResultadoCalculoEmailDto) {
    try {
      const renda = dados.renda || 0;
      const custos = dados.custos || 0;

      await this.emailService.receberResultadoCalculo(
        dados.destinatario,
        renda,
        custos,
        dados.tipoCalculo,
      );
      return {
        mensagem:
          'E-mail enviado com sucesso! O cálculo foi realizado no servidor.',
      };
    } catch (error) {
      console.error('Erro no EmailController:', error);
      throw new HttpException(
        'Falha no envio do e-mail: ' + (error || 'Erro desconhecido'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('contato')
  async enviar(@Body() contatoDto: ContatoDto) {
    await this.emailService.contatoNaf(contatoDto);
    return { message: 'Mensagem de contato enviada com sucesso!' };
  }
}
