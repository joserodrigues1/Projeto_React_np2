
// Função que calcula o imposto de renda para Pessoa Física
export function calculadoraIRPF(rendaMensal, custosMensais) {
    
    const renda = Number(rendaMensal);
    const custos = Number(custosMensais);
    const basePF = renda - custos;
    let imposto = 0;
    let deducao = 0;
    // Aplicação das faixas progressivas de IRPF (valores aproximados)
    if (basePF <= 2428.8) {
        imposto = 0;
        deducao = 0;
    } else if (basePF >= 2428.81 && basePF <= 2826.65) {
        deducao = 142.80;
        imposto = (basePF * 0.075) - deducao;  
    } else if (basePF >= 2826.66 && basePF <= 3751.05) {
        deducao = 394.16;
        imposto = (basePF * 0.15) - deducao;
    } else if (basePF >= 3751.06 && basePF <= 4664.68) {
        deducao = 675.49;
        imposto = (basePF * 0.225) - deducao;
    } else {
        deducao = 908.73;
        imposto = (basePF * 0.275) - deducao;
    }

    
    imposto = Math.max(0, imposto);
    // Cálculo da renda líquida após imposto
    const rendaLiquida = renda - imposto;

    return {
        rendaMensal: renda,
        custosMensais: custos,
        basePF,
        deducao,
        imposto, 
        rendaLiquida
    };

}
// Função que calcula o imposto de renda para Pessoa Jurídica
export function calculadoraIRPJ(rendaMensal){
    const renda = Number(rendaMensal);
    // Simples Nacional (6%) 
    const simples_nac = renda * 0.06;
    // Pro-labore (11%)
    const pro_labore = renda * 0.11;

    // Percentual de 28% usado como referência de rendimento,
    // com mínimo de R$ 1518,01 para evitar distorções em rendas muito baixas.
    const perce28 = renda < 1518.01 ? 1518 : renda * 0.28;
    // Soma dos encargos para cálculo do imposto total
    const imposto = simples_nac + pro_labore;
    // Renda líquida após dedução dos impostos
    const rendaLiquida = renda - imposto;
    return {
        rendaMensal: renda,
        perce28,
        simples_nac,
        pro_labore,
        imposto,
        rendaLiquida
    };

}