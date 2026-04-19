export function calculadoraIRPF(rendaMensal, custosMensais) {
    // Garante que os valores venham como número pra evitar bugs de string nas contas
    const renda = Number(rendaMensal);
    const custos = Number(custosMensais);
    
    // Base de cálculo é o que sobrou da renda abatendo os custos da profissão
    const basePF = renda - custos;
    let imposto = 0;
    let deducao = 0;

    // Lógica da tabela progressiva de IRPF (faixas e parcelas a deduzir padrão)
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
        // Teto do imposto de renda (27,5% em cima de tudo)
        deducao = 908.73;
        imposto = (basePF * 0.275) - deducao;
    }

    // Regra da Tabela 2: desconto progressivo que beneficia as faixas menores
    let valorReducao = 0;

    if (renda <= 5000) {
        valorReducao = 312.89; // Redução cheia pra quem ganha até 5k
    } else if (renda <= 7350) {
        valorReducao = 978.62 - (0.133145 * renda); // Fórmula de amortização
    } else {
        valorReducao = 0; // Ganha quem ganha muito? Chora pro Leão
    }

    // Aplica a redução garantindo que o imposto não fique negativo usando o Math.max
    imposto = Math.max(0, imposto - Math.max(0, valorReducao));

    // Valor líquido final pro bolso
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


// Mesma pegada de função, mas agora focado no cálculo como empresa
export function calculadoraIRPJ(rendaMensal, profissao) {
    const renda = Number(rendaMensal);

    // Tratamento dividido pq advogados tem regras chatas com OAB e tabela do Simples
    if(profissao === "psicologo" || profissao === "arquiteto"){
        
        // Simples Nacional Anexo III (Aprox. 6%)
        const simples_nac = renda * 0.06;
        
        // Pro-labore (Fator R) exigido de 28% pra fugir de alíquotas maiores
        const pro_labore = renda * 0.28;
        
        // Contribuição do INSS sobre o Pró-labore
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
        
        // Simples Nacional Anexo IV focado (Advocacia entra com 4.5% limpo)
        const simples_nac = renda * 0.045;
        
        // Pro-labore fixado pra advocacia pro projeto (referência)
        const pro_labore = 1621;
        const perce28 = pro_labore;
        
        // INSS e encargos chatos da cota patronal
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