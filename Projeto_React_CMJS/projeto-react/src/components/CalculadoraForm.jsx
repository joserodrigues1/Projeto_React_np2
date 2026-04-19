import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const CalculadoraForm = ({ onDataSubmit, onOpenChat }) => {

    // Inicializa o react-hook-form para controle de formulário.
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    // Observa se o usuário marcou a opção de envio por e-mail.
    const enviarEmailCheck = watch('enviarEmail', false);
    // Mensagem de sucesso exibida temporariamente ao enviar.
    const [mensagemSucesso, setMensagemSucesso] = useState(null);

    // Função executada quando o usuário submete o formulário.
    const onSubmit = (dados) => {
        // Converte valores com vírgula para número de ponto flutuante.
        const converterParaNumero = (valor) => {
            if (typeof valor === 'string') {
                return Number(valor.replace(',', '.'));
            }
            return Number(valor) || 0;
        };

        const rendaValida = converterParaNumero(dados.rendaMensal);
        const custosValidos = converterParaNumero(dados.custosMensais);

        const dadosParaProp = {
            tipoCalculo: dados.profissao === 'psicologo' ? 'PF' : 'PJ',
            renda: rendaValida,
            custos: custosValidos,
            emailUsuario: dados.emailUsuario,
            enviarEmail: dados.enviarEmail,
            profissao: dados.profissao,
        };

        if (onDataSubmit) {
            // Envia os dados normalizados para o componente pai (App.jsx).
            onDataSubmit(dadosParaProp);
            setMensagemSucesso("✅ Dados enviados para cálculo e comparação.");
            setTimeout(() => setMensagemSucesso(null), 5000);
        }
    };

    // Estilo do wrapper do formulário.
    // Estilo do wrapper do formulário.
    const formWrapperStyle = {
        maxWidth: '600px',
        margin: '10px auto 80px auto',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        color: '#05142e',
    };

    // Estilo do título do formulário.
    const titleStyle = {
        color: '#764ba2',
        marginBottom: '20px',
        textAlign: 'center',
    };

    // Estilo padrão para cada grupo de campo.
    const formGroupStyle = {
        marginBottom: '20px',
    };

    // Estilo dos rótulos (labels).
    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#333',
    };

    // Estilo dos campos de entrada.
    const inputStyle = (isError) => ({
        width: '100%',
        padding: '12px',
        border: isError ? '1px solid #E53E3E' : '1px solid #CBD5E0',
        borderRadius: '6px',
        fontSize: '1em',
        boxSizing: 'border-box',
        backgroundColor: '#F7FAFC',
        color: '#05142e',
    });

    // Estilo das mensagens de erro exibidas abaixo dos campos.
    const errorMessageStyle = {
        color: '#E53E3E',
        marginTop: '5px',
        fontSize: '0.85em',
    };

    // Estilo para grupos de checkbox (atualmente comentado).
    const checkboxGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    };

    // Estilo do texto associado ao checkbox.
    const checkboxLabelStyle = {
        fontSize: '0.9em',
        marginBottom: '0',
        color: '#05142e',
    };

    // Estilo do botão principal de envio.
    const primaryButtonStyle = {
        width: '100%',
        padding: '15px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.1em',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        transition: 'opacity 0.3s',
    };

    // Estilo da mensagem de sucesso exibida após o envio.
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
            <form onSubmit={handleSubmit(onSubmit)} className="calculadora-form">
                <h2 style={titleStyle}>Informe os Dados</h2>

                {mensagemSucesso && (
                    <div style={successMessageStyle}>{mensagemSucesso}</div>
                )}
                
                {/* Campo de entrada de renda mensal. */}
                <div style={formGroupStyle}>
                    <label htmlFor="renda" style={labelStyle}>Renda Mensal (até R$ 15.000): </label>
                    <input
                        id="renda"
                        type="text"
                        style={inputStyle(errors.rendaMensal)}
                        {...register("rendaMensal", { 
                            required: "A Renda Mensal é obrigatória.",
                            pattern: {
                                value: /^[\d,.]+$/,
                                message: "Digite um valor válido (use vírgula ou ponto como separador decimal)."
                            },
                            validate: (value) => {
                                const num = Number(value.replace(',', '.'));
                                if (isNaN(num)) return "Valor inválido.";
                                if (num <= 0) return "A renda deve ser maior que zero.";
                                if (num > 15000) return "A renda não pode exceder R$ 15.000.";
                                return true;
                            }
                        })}
                        placeholder="Ex: 5.000 ou 5,000"
                    />
                    {errors.rendaMensal && <span style={errorMessageStyle}>{errors.rendaMensal.message}</span>}
                </div>

                {/* Campo de entrada de custos mensais. */}
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

                {/* Campo de seleção de profissão. */}
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

                {/* Checkbox Enviar Email
                <div style={checkboxGroupStyle}>
                    <input
                        id="enviarEmailCheck"
                        type="checkbox"
                        style={{ marginRight: '10px' }}
                        {...register("enviarEmail")}
                    />
                    <label htmlFor="enviarEmailCheck" style={checkboxLabelStyle}>Deseja enviar os cálculos via e-mail?</label>
                </div> */}
                
                {/* Campo de e-mail exibido apenas quando o usuário marca o envio por e-mail. */}
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
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                    message: "E-mail inválido."
                                }
                            })}
                            placeholder="seuemail@exemplo.com"
                        />
                        {errors.emailUsuario && <span style={errorMessageStyle}>{errors.emailUsuario.message}</span>}
                    </div>
                )}
                
                <button type="submit" style={primaryButtonStyle}>
                    {enviarEmailCheck ? "Calcular e Enviar" : "Calcular"}
                </button>

            </form>
        </div>
    );
};

export default CalculadoraForm;