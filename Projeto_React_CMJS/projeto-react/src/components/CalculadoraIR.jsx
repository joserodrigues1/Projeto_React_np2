/**
 * Realiza o cálculo do Imposto de Renda Pessoa Física (IRPF).
 * 
 * @param {number|string} rendaMensal - O valor da receita bruta mensal.
 * @param {number|string} custosMensais - As despesas dedutíveis associadas à profissão.
 * @returns {object} Objeto detalhado contendo a base de cálculo, deduções e imposto devido.
 */
export function calculadoraIRPF(rendaMensal, custosMensais) {
    // Conversão de segurança para numérico
    const renda = Number(rendaMensal);
    const custos = Number(custosMensais);
    
    // Calcula a base de incidência subtraindo as despesas da receita bruta
    const basePF = renda - custos;
    let imposto = 0;
    let deducao = 0;

    // Define faixas e parcelas a deduzir conforme a Tabela Progressiva Anual do IRPF
    if (basePF <= 2428.8) {
        imposto = 0;
        deducao = 0; // Faixa isenta de tributação
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
        // Alíquota máxima do IRPF (27,5% sobre a base excedente)
        deducao = 908.73;
        imposto = (basePF * 0.275) - deducao;
    }

    // Tabela 2: Fator de redução progressiva para faixas de renda inferiores
    let valorReducao = 0;

    if (renda <= 5000) {
        valorReducao = 312.89; // Isenção aplicável para retornos de baixa renda
    } else if (renda <= 7350) {
        valorReducao = 978.62 - (0.133145 * renda); // Cálculo de amortização gradual
    } else {
        valorReducao = 0; // Sem teto de amortização aplicável
    }

    // Garante a não-negatividade do tributo calculado
    imposto = Math.max(0, imposto - Math.max(0, valorReducao));

    // Determinação final do montante líquido pós impostos
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
 * Realiza o cálculo do Imposto de Renda Pessoa Jurídica (IRPJ),
 * aplicando regras específicas por ramo de atividade e Simples Nacional.
 * 
 * @param {number|string} rendaMensal - Receita bruta estimada.
 * @param {string} profissao - Atividade econômica vinculada.
 * @returns {object} Retorna estrutura com detalhamento de INSS, Pró-labore e Simples.
 */
export function calculadoraIRPJ(rendaMensal, profissao) {
    const renda = Number(rendaMensal);

    // Diferenciação de cálculo baseada na classificação de atividades do regime
    if(profissao === "psicologo" || profissao === "arquiteto"){
        
        // Aplicação do Anexo III do Simples Nacional (Referência Base: 6%)
        const simples_nac = renda * 0.06;
        
        // Fator R: Proporção mínima de 28% da folha de pagamento obrigatória 
        // para adequação de faixa de Serviços Intelectuais
        const pro_labore = renda * 0.28;
        
        // Recolhimento Previdenciário (INSS) sobre pro-labore estipulado (11%)
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
        
        // Subsequente aplicável ao Anexo IV do Simples Nacional p/ serviços jurídicos (4.5% efetivos)
        const simples_nac = renda * 0.045;
        
        // Valor referencial fixo de retirada base
        const pro_labore = 1621;
        const perce28 = pro_labore;
        
        // Precatório de retenção em cota de empregado (11%) e Encargos de CPP Patronal (20%)
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