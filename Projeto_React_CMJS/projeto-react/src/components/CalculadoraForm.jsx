import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const CalculadoraForm = ({ onDataSubmit, onOpenChat }) => {

    // Extraindo hooks de config do react-hook-form pra desburocratizar a gerência de forms React 
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    
    // O Watch ta observando realtime a prop do checbox de email (mesmoq eu ele esteja desativado agora)
    const enviarEmailCheck = watch('enviarEmail', false);
    
    // Estado volátil só p exibir balãozinho de "Deu Certo " verde.
    const [mensagemSucesso, setMensagemSucesso] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Método que interage com o hook onSubmit. Recebe "DADOS", que é o payload json higienizado.
    const onSubmit = (dados) => {
        setIsCalculating(true);
        setTimeout(() => {
        // Snippetzinho maroto pra resolver nosso problema das virgulas brasileiras zoando o Math 
        const converterParaNumero = (valor) => {
            if (typeof valor === 'string') {
                return Number(valor.replace(',', '.')); // troca , e converte bruto
            }
            return Number(valor) || 0;
        };

        const rendaValida = converterParaNumero(dados.rendaMensal);
        const custosValidos = converterParaNumero(dados.custosMensais);

        // Agrupa as props limpídas
        const dadosParaProp = {
            tipoCalculo: dados.profissao === 'psicologo' ? 'PF' : 'PJ',
            renda: rendaValida,
            custos: custosValidos,
            emailUsuario: dados.emailUsuario,
            enviarEmail: dados.enviarEmail,
            profissao: dados.profissao,
        };

        // Escoa info de volta subindo pro Pai (App.jsx)
        if (onDataSubmit) {
            onDataSubmit(dadosParaProp);
            setMensagemSucesso("✅ Dados enviados para cálculo e comparação.");
            setIsCalculating(false);
            setTimeout(() => setMensagemSucesso(null), 5000); // Tira o alerta em 5 segs da tela 
        }
        }, 800); // 800ms animation delay giving a senior processing feel
    };

    /** CSS inline massivo pros styles **/

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
        border: isError ? '1px solid #E53E3E' : '1px solid #CBD5E0', // feedback borda vermelha 
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // gradiente Unichristus
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
            {/* O handleSubmit envelopa nosso OnSubmit pegando do hook context as trvas de form nativo  */}
            <form onSubmit={handleSubmit(onSubmit)} className="calculadora-form">
                <h2 style={titleStyle}>Informe os Dados</h2>

                {mensagemSucesso && (
                    <div style={successMessageStyle} className="animate-fade-in-scale">{mensagemSucesso}</div>
                )}
                
                {/*  ------- INiCIO BLCOO RENDA  ------- */}
                <div style={formGroupStyle}>
                    <label htmlFor="renda" style={labelStyle}>Renda Mensal (até R$ 15.000): </label>
                    <input
                        id="renda"
                        type="text"
                        style={inputStyle(errors.rendaMensal)}
                        // Desestruturando regras de bloqueio do Form control 
                        {...register("rendaMensal", { 
                            required: "A Renda Mensal é obrigatória.",
                            pattern: {
                                value: /^[\d,.]+$/, // Aceita só number e vírgulas/ponto. Se tentar 'a' chora 
                                message: "Digite um valor válido (use vírgula ou ponto como separador decimal)."
                            },
                            validate: (value) => {
                                const num = Number(value.replace(',', '.'));
                                if (isNaN(num)) return "Valor inválido.";
                                if (num <= 0) return "A renda deve ser maior que zero.";
                                if (num > 15000) return "A renda não pode exceder R$ 15.000."; // Trava de negocio limite
                                return true;
                            }
                        })}
                        placeholder="Ex: 5.000 ou 5,000"
                    />
                    {/* feedback de error renderizando aqui */}
                    {errors.rendaMensal && <span style={errorMessageStyle}>{errors.rendaMensal.message}</span>}
                </div>

                {/*  ------- BLCOO CUSTOS ------- */}
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

                {/* ------- DROPDOWN PROFISSOES ------- */}
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

                {/* Feature de envio de email. Comentada por enquanto caso precise no futuro... 
                <div style={checkboxGroupStyle}>
                    <input id="enviarEmailCheck" type="checkbox" {...register("enviarEmail")} />
                    <label htmlFor="enviarEmailCheck" style={checkboxLabelStyle}>Deseja enviar via e-mail?</label>
                </div> */}
                
                {/* Bloco Dinâmico: só renderiza emailUsuario se a checkbox Email tiver ticada  */}
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
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // regex clássica de email
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