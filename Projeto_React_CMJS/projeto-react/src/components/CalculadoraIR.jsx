
// Função que calcula o imposto de renda para Pessoa Física.
export function calculadoraIRPF(rendaMensal, custosMensais) {
    // Converte os parâmetros de entrada para números.
    const renda = Number(rendaMensal);
    const custos = Number(custosMensais);
    // Calcula a base de cálculo após deduzir custos.
    const basePF = renda - custos;
    let imposto = 0;
    let deducao = 0;
    // Aplicação das faixas progressivas de IRPF (valores aproximados).
    if (basePF <= 2428.8) {
        imposto = 0;
        deducao = 0;
    } else if (basePF >= 2428.81 && basePF <= 2826.65) {
        deducao = 182.16;
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

    
    // 2. Aplicação da Tabela 2 (redução adicional do imposto a pagar).
    let valorReducao = 0;

    if (renda <= 5000) {
        // Até R$ 5.000: aplica redução fixa de R$ 312,89.
        valorReducao = 312.89;
    } else if (renda <= 7350) {
        // De R$ 5.000,01 a R$ 7.350: aplica fórmula progressiva.
        valorReducao = 978.62 - (0.133145 * renda);
    } else {
        // A partir de R$ 7.350, não há redução adicional.
        valorReducao = 0;
    }

    // Subtrai a redução do imposto calculado, garantindo valor não negativo.
    imposto = Math.max(0, imposto - Math.max(0, valorReducao));

    // 3. Resultado final com renda líquida após imposto.
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
// Função que calcula o imposto de renda para Pessoa Jurídica.
export function calculadoraIRPJ(rendaMensal, profissao) {
    const renda = Number(rendaMensal);
    // Cálculo para Psicólogos e Arquitetos sob Simples Nacional.
    if(profissao === "psicologo" || profissao === "arquiteto"){
        // Simples Nacional com alíquota de 6%.
        const simples_nac = renda * 0.06;
        // Pró-labore calculado como 28%.
        const pro_labore = renda * 0.28;
        // INSS calculado sobre o pró-labore.
        const inss = pro_labore * 0.11;
        // Soma dos encargos para cálculo do imposto total.
        const imposto = simples_nac + inss;
        // Renda líquida após dedução dos impostos.
        const rendaLiquida = renda - imposto;
        return {
            rendaMensal: renda,
            simples_nac,
            pro_labore,
            inss,
            imposto,
            rendaLiquida
        };
    }
    // Cálculo específico para Advogados.
    else if(profissao === "advogado"){
        // Simples Nacional com alíquota de 4.5%.
        const simples_nac = renda * 0.045;
        // Pró-labore fixo para advogado.
        const pro_labore = 1621;
        // Valor de referência usado em outros cálculos.
        const perce28 = pro_labore;
        // INSS calculado sobre o pró-labore.
        const inss = pro_labore * 0.11;
        // INSS patronal calculado sobre o pró-labore.
        const inss_patronal = pro_labore * 0.20;
        // Soma dos encargos para cálculo do imposto total.
        const imposto = simples_nac + inss + inss_patronal;
        // Renda líquida após dedução dos impostos.
        const rendaLiquida = renda - imposto;
        return {
            rendaMensal: renda,
            simples_nac,
            pro_labore,
            perce28,
            inss,
            inss_patronal,
            imposto,
            rendaLiquida
        };
    }
}