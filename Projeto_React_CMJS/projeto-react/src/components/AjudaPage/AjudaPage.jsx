import React from 'react';
import { Link } from 'react-router-dom';

const AjudaPage = () => {
    const containerStyle = {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '40px',
        backgroundColor: '#FFFFFF', 
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', 
        color: '#05142e', 
    };

    const titleStyle = {
        marginBottom: '30px',
        color: '#007284',
        textAlign: 'center',
    };

    const infoBoxStyle = {
        backgroundColor: '#F7FAFC',
        padding: '20px',
        marginBottom: '25px',
        borderRadius: '8px',
        borderLeft: '5px solid #667eea',
    };

    const infoBoxTitleStyle = {
        color: '#764ba2',
        marginTop: '0',
        marginBottom: '10px',
        fontSize: '1.3em',
    };

    const linkStyle = {
        textDecoration: 'none', 
        display: 'inline-block', 
        width: 'auto', 
        padding: '12px 25px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        fontWeight: 'bold',
        transition: 'opacity 0.3s',
    };
    
    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}> Informações Detalhadas de Ajuda</h2>
            
            <div style={infoBoxStyle}>
                <h3 style={infoBoxTitleStyle}>1. Renda Mensal:</h3>
                <p>
                    "É o valor total de recursos financeiros que uma pessoa ou família recebe regularmente dentro de um mês, englobando salários, aposentadorias, pensões, aluguéis, rendimentos de investimentos, benefícios sociais e qualquer outra fonte de entrada recorrente; ela representa a soma disponível para custear despesas fixas e variáveis, planejar consumo, poupança ou investimentos, sendo um indicador fundamental da capacidade econômica e do padrão de vida, além de servir como base para cálculos de crédito, impostos e políticas sociais."
                </p>
            </div>
            
            <div style={infoBoxStyle}>
                <h3 style={infoBoxTitleStyle}>2. Custos Mensais:</h3>
                <p>
                    "São o conjunto de todas as despesas que uma pessoa ou família precisa arcar dentro de um mês, incluindo gastos fixos como aluguel, financiamento, contas de água, luz, internet e seguros, além de variáveis como alimentação, transporte, lazer, saúde e imprevistos; representam a soma dos compromissos financeiros necessários para manter o padrão de vida e garantir o funcionamento da rotina, sendo fundamentais para o planejamento orçamentário, controle de dívidas e definição da capacidade de poupança ou investimento."
                </p>
            </div>
            
             <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Link to="/" style={linkStyle}>
                    Voltar para a Calculadora
                </Link>
            </div>
        </div>
    );
};

export default AjudaPage;