import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * CalculadoraForm
 * ---------------------------------------------------------
 * Componente principal de UI para entrada de dados tributários.
 * Ele engloba campos para renda, custo, profissão e opção
 * de envios de e-mail.
 * 
 * Utilizamos a blibioteca `react-hook-form` para gerir o estado 
 * complexo (erros vitais, validação dinâmica de regex para blocos
 * monetários, e watch de campos).
 */
const CalculadoraForm = ({ onDataSubmit, onOpenChat }) => {

    // Inicia os hooks do react-hook-form para checar a digitação em tempo real
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    
    // Fica vigiando para ver se o usuário liga ou desliga o botãozinho de enviar email
    const enviarEmailCheck = watch('enviarEmail', false);
    
    // Guarda momentaneamente a mensagem verde informando que "Deu Certo"
    const [mensagemSucesso, setMensagemSucesso] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    /**
     * onSubmit
     * ---------------------------------------------------------
     * Pipeline disparado pela UI.
     * Ele ativa um estado de loading virtual (800ms) para UX ('isCalculating'),
     * converte vírgulas monetárias amigáveis do pt-BR para floats aceitos pelo JS, 
     * empacota as propriedades e aciona a callback pai `onDataSubmit` 
     * passando o json "limpo".
     */
    const onSubmit = (dados) => {
        setIsCalculating(true);
        // Dá um tempinho de 800ms simulando carregamento, para o usuário ver o estado mudando da tela
        setTimeout(() => {
        // Função auxiliar pra converter os valores: se tiver vírgula brasileira, troca por ponto para o JavaScript conseguir somar
        const converterParaNumero = (valor) => {
            if (typeof valor === 'string') {
                return Number(valor.replace(',', '.')); // troca , por ponto e converte bruto
            }
            return Number(valor) || 0;
        };

        const rendaValida = converterParaNumero(dados.rendaMensal);
        const custosValidos = converterParaNumero(dados.custosMensais);

        // Empacota todos os formulários num formato bonitinho para enviar pra página principal
        const dadosParaProp = {
            tipoCalculo: dados.profissao === 'psicologo' ? 'PF' : 'PJ',
            renda: rendaValida,
            custos: custosValidos,
            emailUsuario: dados.emailUsuario,
            enviarEmail: dados.enviarEmail,
            profissao: dados.profissao,
        };

        // Envia as informações empacotadas lá pro componente pai (App.jsx)
        if (onDataSubmit) {
            onDataSubmit(dadosParaProp);
            setMensagemSucesso("✅ Dados enviados para cálculo e comparação.");
            setIsCalculating(false);
            setTimeout(() => setMensagemSucesso(null), 5000); // Apaga a mensagem verde depois de 5 segundos
        }
        }, 800); // Tempo do carregamento falso para gerar melhor percepção ao calcular
    };

    /** Objetos de Estilização em JS (CSS-in-JS) **/

    const formWrapperStyle = {
        maxWidth: '600px',
        margin: '10px auto 80px auto',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        color: '#05142e',
    };

    const titleStyle = {
        color: '#764ba2',
        marginBottom: '20px',
        textAlign: 'center',
    };

    const formGroupStyle = {
        marginBottom: '20px',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#333',
    };

    const inputStyle = (isError) => ({
        width: '100%',
        padding: '12px',
        border: isError ? '1px solid #E53E3E' : '1px solid #CBD5E0', // Pinta a borda de vermelho se alguém não preencheu certo
        borderRadius: '6px',
        fontSize: '1em',
        boxSizing: 'border-box',
        backgroundColor: '#F7FAFC',
        color: '#05142e',
    });

    const errorMessageStyle = {
        color: '#E53E3E',
        marginTop: '5px',
        fontSize: '0.85em',
    };

    const primaryButtonStyle = {
        width: '100%',
        padding: '15px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.1em',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Gradiente roxo principal do layout
        transition: 'opacity 0.3s',
    };

    const successMessageStyle = {
        padding: '10px',
        backgroundColor: '#D6FFD6',
        color: '#006400',
        borderRadius: '6px',
        marginBottom: '15px',
        textAlign: 'center',
    };

    return (
        <div style={formWrapperStyle}>
            {/* O handleSubmit envelopa tudo, então só prossegue se as regras escritas no input baterem certinho */}
            <form onSubmit={handleSubmit(onSubmit)} className="calculadora-form">
                <h2 style={titleStyle}>Informe os Dados</h2>

                {mensagemSucesso && (
                    <div style={successMessageStyle} className="animate-fade-in-scale">{mensagemSucesso}</div>
                )}
                
                {/* --- BLOCO: RECEITA MENSAL --- */}
                <div style={formGroupStyle}>
                    <label htmlFor="renda" style={labelStyle}>Renda Mensal (até R$ 15.000): </label>
                    <input
                        id="renda"
                        type="text"
                        style={inputStyle(errors.rendaMensal)}
                        // Validações que travam o usuário se algo der errado
                        {...register("rendaMensal", { 
                            required: "A Renda Mensal é obrigatória.",
                            pattern: {
                                value: /^[\d,.]+$/, // Permite estritamente os numerais do teclado e as vírgulas/pontos
                                message: "Digite um valor válido (use vírgula ou ponto como separador decimal)."
                            },
                            validate: (value) => {
                                const num = Number(value.replace(',', '.'));
                                if (isNaN(num)) return "Valor inválido.";
                                if (num <= 0) return "A renda deve ser maior que zero.";
                                if (num > 15000) return "A renda não pode exceder R$ 15.000."; // Trava estipulada de renda pelo projeto
                                return true;
                            }
                        })}
                        placeholder="Ex: 5.000 ou 5,000"
                    />
                    {/* Feedback vermelho de erro renderizando aqui embaixo caso a pessoa erre digitando */}
                    {errors.rendaMensal && <span style={errorMessageStyle}>{errors.rendaMensal.message}</span>}
                </div>

                {/* --- BLOCO: CUSTOS MENSAIS --- */}
                <div style={formGroupStyle}>
                    <label htmlFor="custos" style={labelStyle}>Total de Custos Mensais: </label>
                    <input
                        id="custos"
                        type="text"
                        style={inputStyle(errors.custosMensais)}
                        {...register("custosMensais", { 
                            required: "Os Custos Mensais são obrigatórios.",
                            pattern: {
                                value: /^[\d,.]+$/,
                                message: "Digite um valor válido (use vírgula ou ponto como separador decimal)."
                            },
                            validate: (value) => {
                                const num = Number(value.replace(',', '.'));
                                if (isNaN(num)) return "Valor inválido.";
                                if (num < 0) return "Os custos não podem ser negativos.";
                                return true;
                            }
                        })}
                        placeholder="Ex: 1.000 ou 1,000"
                    />
                    {errors.custosMensais && <span style={errorMessageStyle}>{errors.custosMensais.message}</span>}
                </div>

                {/* --- BLOCO: SELETOR DE PROFISSÃO --- */}
                <div style={formGroupStyle}>
                    <label htmlFor="profissao" style={labelStyle}>Profissão:</label>
                    <select 
                        id="profissao" 
                        style={inputStyle(false)}
                        {...register("profissao", { required: true })} 
                        defaultValue="psicologo"
                    >
                        <option value="psicologo">Psicólogo(a)</option>
                        <option value="advogado">Advogado(a)</option>
                        <option value="arquiteto">Arquiteto(a)</option>
                    </select>
                </div>

                <div style={{ ...formGroupStyle, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', marginTop: '10px' }}>
                    <label className="toggle-switch" htmlFor="enviarEmailCheck">
                        <input id="enviarEmailCheck" type="checkbox" {...register("enviarEmail")} />
                        <span className="toggle-slider"></span>
                    </label>
                    <span 
                        style={{ fontWeight: '600', color: '#4a5568', cursor: 'pointer', fontSize: '15px' }} 
                        onClick={() => document.getElementById('enviarEmailCheck').click()}
                    >
                        Deseja enviar o resultado via e-mail?
                    </span>
                </div>
                
                {/* --- BLOCO CONDICIONAL: E-MAIL REQUISITADO --- */}
                {enviarEmailCheck && (
                    <div style={formGroupStyle}>
                        <label htmlFor="emailUsuario" style={labelStyle}>Seu E-mail:</label>
                        <input
                            id="emailUsuario"
                            type="email"
                            style={inputStyle(errors.emailUsuario)}
                            {...register("emailUsuario", {
                                required: "O campo de e-mail é obrigatório para o envio.",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Máscara checando o padrão de e-mail (nome@exemplo.com)
                                    message: "E-mail inválido."
                                }
                            })}
                            placeholder="seuemail@exemplo.com"
                        />
                        {errors.emailUsuario && <span style={errorMessageStyle}>{errors.emailUsuario.message}</span>}
                    </div>
                )}
                
                <button type="submit" style={primaryButtonStyle} disabled={isCalculating}>
                    {isCalculating ? "Calculando..." : (enviarEmailCheck ? "Calcular e Enviar" : "Calcular")}
                </button>

            </form>
        </div>
    );
};

export default CalculadoraForm;