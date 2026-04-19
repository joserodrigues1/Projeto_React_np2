/**
 * Lógicas de Cálculos Tributários (PF e PJ)
 * ---------------------------------------------------------
 * Algoritmos extraídos e encapsulados para viabilizar simulações
 * do IRPF (Tabela Progressiva) e Simples Nacional (Anexos III e IV).
 */
export function calculadoraIRPF(rendaMensal, custosMensais) {
    // Sanitização e conversão de tipos de entrada para cálculo matemático
    const renda = Number(rendaMensal);
    const custos = Number(custosMensais);
    
    // Definição da base de cálculo descontando custos operacionais/deduções
    const basePF = renda - custos;
    let imposto = 0;
    let deducao = 0;

    // Aplicação das faixas baseadas na Tabela Progressiva Anual (Mensalizada) do IRPF
    if (basePF <= 2428.8) {
        imposto = 0;
        deducao = 0; // Faixa de isenção
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
        // Teto limite: Alíquota máxima fixada em 27,5%
        deducao = 908.73;
        imposto = (basePF * 0.275) - deducao;
    }

    // Tabela 2: Fator de amortização progressiva beneficiando as faixas primárias
    let valorReducao = 0;

    if (renda <= 5000) {
        valorReducao = 312.89; // Redução majorada para faixas inferiores à R$ 5.000
    } else if (renda <= 7350) {
        valorReducao = 978.62 - (0.133145 * renda); // Cálculo atuarial de amortização escalonada
    } else {
        valorReducao = 0; // Faixas superiores cessam benefício de redução
    }

    // Cálculo do tributo abatendo a redução e impedindo valores nominais negativos
    imposto = Math.max(0, imposto - Math.max(0, valorReducao));

    // Definição do Rendimento Líquido final pós-tributos
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


/**
 * Algoritmo contábil da modalidade Pessoa Jurídica (Simples Nacional)
 * Parametrizado com base em anexos específicos da profissão.
 */
export function calculadoraIRPJ(rendaMensal, profissao) {
    const renda = Number(rendaMensal);

    // Condicionais de Anexos Fiscais de acordo com CNAE e regimento específico da profissão
    if(profissao === "psicologo" || profissao === "arquiteto"){
        
        // Simples Nacional: Alíquota referencial do Anexo III
        const simples_nac = renda * 0.06;
        
        // Aplicação da regra do Fator R: Pro-labore estipulado em 28% visando isenção/estabilização de alíquota
        const pro_labore = renda * 0.28;
        
        // Incidência de INSS Patronal aplicada exclusivamente sobre o Pró-labore
        const inss = pro_labore * 0.11;
        
        const imposto = simples_nac + inss;
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
    else if(profissao === "advogado"){
        
        // Simples Nacional: Alíquota referencial do Anexo IV focado (Alíquota nominal básica: 4.5%)
        const simples_nac = renda * 0.045;
        
        // Retirada Fixa de Pró-labore adotada internamente pelo escritório/aplicação
        const pro_labore = 1621;
        const perce28 = pro_labore;
        
        // Rateio de Contribuição Previdenciária englobando Cota Patronal majorada
        const inss = pro_labore * 0.11;
        const inss_patronal = pro_labore * 0.20;
        
        const imposto = simples_nac + inss + inss_patronal;
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