import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CalculoService } from '../calculo/calculo.service';
import { ContatoDto } from './dto/contato.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly calculoService: CalculoService,
  ) {}

  public async receberResultadoCalculo(
    destinatario: string,
    renda: number,
    custos: number,
    tipoCalculo: 'PF' | 'PJ',
  ) {
    try {
      const resultados = this.calculoService.simularCalculos(renda, custos);
      const impostoPF = resultados.resultadoPF.imposto.toFixed(2);
      const liquidaPF = resultados.resultadoPF.rendaLiquida.toFixed(2);
      const impostoPJ = resultados.resultadoPJ.imposto.toFixed(2);
      const liquidaPJ = resultados.resultadoPJ.rendaLiquida.toFixed(2);
      const rendaEntrada = resultados.dadosEntrada.rendaMensal.toFixed(2);
      const htmlContent = `
        <h1>Comparação Tributária - Resultados</h1>
        <p>Prezado(a),</p>
        <p>Abaixo estão os resultados da sua comparação com Renda Mensal de R$ ${rendaEntrada}.</p>
        
        <h2>Pessoa Física (PF)</h2>
        <ul>
          <li>**Renda Bruta**: R$ ${rendaEntrada}</li>
          <li>**Custos Dedução**: R$ ${resultados.dadosEntrada.custosMensais.toFixed(2)}</li>
          <li>**IRPF a Pagar**: R$ ${impostoPF}</li>
          <li>**Renda Líquida**: R$ ${liquidaPF}</li>
        </ul>

        <h2>Pessoa Jurídica (PJ - Simples Nacional)</h2>
        <ul>
          <li>**Renda Bruta**: R$ ${rendaEntrada}</li>
          <li>**Imposto Total (DAS + INSS)**: R$ ${impostoPJ}</li>
          <li>**Renda Líquida**: R$ ${liquidaPJ}</li>
        </ul>
        
        <p>Obrigado por usar nossa calculadora! Qualquer dúvida, entre em contato.</p>
      `;

      await this.mailerService.sendMail({
        to: destinatario,
        subject: 'Resultado da Sua Comparação Tributária',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail devido a uma falha interna.',
      );
    }
  }

  async contatoNaf(contatoDto: ContatoDto): Promise<void> {
    const { nome, email, duvida } = contatoDto;
    const destinatarioNaf = 'naf_unichristus@edu.com';

    await this.mailerService.sendMail({
      to: destinatarioNaf,
      from: 'Calculadora Tributária <naf_unichristus@edu.com>',
      replyTo: email,
      subject: `Nova Mensagem - ${nome}`,

      html: `
        <h2>Nova Mensagem Recebida</h2>
        <p>Prezado NAF,</p>
        <p>Você recebeu uma nova mensagem de contato através da Calculadora Tributária.</p>
        
        <hr>
        
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Dúvida:</strong></p>
        <div style="border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9;">
          ${duvida.replace(/\n/g, '<br>')}
        </div>
        
        <hr>
        
        <p>Obrigado,<br>Sistema de Notificação.</p>
      `,
    });

    console.log(
      `Mensagem de contato de ${nome} enviada para ${destinatarioNaf} com sucesso.`,
    );
  }
}
