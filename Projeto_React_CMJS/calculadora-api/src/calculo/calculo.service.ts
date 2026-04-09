import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculoService {
  public simularCalculos(rendaMensal: number, custosMensais: number) {
    const renda = rendaMensal || 0;
    const custos = custosMensais || 0;
    const resultadoPF = this.calculadoraIRPF(renda, custos);
    const resultadoPJ = this.calculadoraIRPJ(renda);

    return {
      dadosEntrada: {
        rendaMensal: renda,
        custosMensais: custos,
      },
      resultadoPF: resultadoPF,
      resultadoPJ: resultadoPJ,
    };
  }

  public calculadoraIRPF(rendaMensal: number, custosMensais: number) {
    const renda = rendaMensal || 0;
    const custos = custosMensais || 0;
    const basePF = renda - custos;
    let imposto = 0;
    let deducao = 0;

    // Aplicação das faixas progressivas de IRPF
    if (basePF <= 2428.8) {
      imposto = 0;
      deducao = 0;
    } else if (basePF < 2826.66) {
      deducao = 142.8;
      imposto = basePF * 0.075 - deducao;
    } else if (basePF < 3751.06) {
      deducao = 394.16;
      imposto = basePF * 0.15 - deducao;
    } else if (basePF < 4664.69) {
      deducao = 675.49;
      imposto = basePF * 0.225 - deducao;
    } else {
      deducao = 908.73;
      imposto = basePF * 0.275 - deducao;
    }

    // Garante que o imposto nunca seja negativo
    imposto = Math.max(0, imposto);
    const rendaLiquida = renda - imposto;

    return {
      rendaMensal: renda,
      custosMensais: custos,
      basePF,
      deducao,
      imposto,
      rendaLiquida,
    };
  }

  public calculadoraIRPJ(rendaMensal: number) {
    const renda = rendaMensal || 0;
    // Simples Nacional
    const simples_nac = renda * 0.06;
    const pro_labore = renda * 0.11;
    const perce28 = renda < 1518.01 ? 1518 : renda * 0.28;
    const imposto = simples_nac + pro_labore;
    const rendaLiquida = renda - imposto;

    return {
      rendaMensal: renda,
      perce28,
      simples_nac,
      pro_labore,
      imposto,
      rendaLiquida,
    };
  }
}
