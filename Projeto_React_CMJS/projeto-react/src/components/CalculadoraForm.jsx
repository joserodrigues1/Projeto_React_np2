import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const CalculadoraForm = ({ onDataSubmit, onOpenChat }) => {
    
    //Hook Form
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const enviarEmailCheck = watch('enviarEmail', false); 
    const [mensagemSucesso, setMensagemSucesso] = useState(null);

    // LÓGICA DE SUBMISSÃO
    const onSubmit = (dados) => {
        const rendaValida = dados.rendaMensal || 0;
        const custosValidos = dados.custosMensais || 0;
        const dadosParaProp = {
            tipoCalculo: dados.profissao === 'psicologo' ? 'PF' : 'PJ',
            renda: Number(rendaValida), 
            custos: Number(custosValidos),
            emailUsuario: dados.emailUsuario,
            enviarEmail: dados.enviarEmail
        };
        
        if (onDataSubmit) {
            onDataSubmit(dadosParaProp); // ⬅️ Comunicação para o componente pai (App.jsx)
            setMensagemSucesso("✅ Dados enviados para cálculo e comparação.");
            setTimeout(() => setMensagemSucesso(null), 5000);
        }
    };
    
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
        border: isError ? '1px solid #E53E3E' : '1px solid #CBD5E0',
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

    const checkboxGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    };

    const checkboxLabelStyle = {
        fontSize: '0.9em', 
        marginBottom: '0', 
        color: '#05142e',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
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
            <form onSubmit={handleSubmit(onSubmit)} className="calculadora-form">
                <h2 style={titleStyle}>Informe os Dados</h2>

                {mensagemSucesso && (
                    <div style={successMessageStyle}>{mensagemSucesso}</div>
                )}
                
                {/* Input Renda Mensal */}
                <div style={formGroupStyle}>
                    <label htmlFor="renda" style={labelStyle}>Renda Mensal (até R$ 15.000): </label>
                    <input
                        id="renda"
                        type="number"
                        style={inputStyle(errors.rendaMensal)}
                        {...register("rendaMensal", { 
                            required: "A Renda Mensal é obrigatória.",
                            min: { value: 1, message: "A renda deve ser maior que zero." },
                            max: { value: 15000, message: "A renda não pode exceder R$ 15.000." },
                            valueAsNumber: true,
                        })}
                        placeholder="R$ 0,00"
                    />
                    {errors.rendaMensal && <span style={errorMessageStyle}>{errors.rendaMensal.message}</span>}
                </div>

                {/* Input Custos Mensais */}
                <div style={formGroupStyle}>
                    <label htmlFor="custos" style={labelStyle}>Total de Custos Mensais: </label>
                    <input
                        id="custos"
                        type="number"
                        style={inputStyle(errors.custosMensais)}
                        {...register("custosMensais", { 
                            required: "Os Custos Mensais são obrigatórios.",
                            min: { value: 0, message: "Os custos não podem ser negativos." },
                            valueAsNumber: true,
                        })}
                        placeholder="R$ 0,00"
                    />
                    {errors.custosMensais && <span style={errorMessageStyle}>{errors.custosMensais.message}</span>}
                </div>

                {/* Select Profissão */}
                <div style={formGroupStyle}>
                    <label htmlFor="profissao" style={labelStyle}>Profissão:</label>
                    <select 
                        id="profissao" 
                        style={inputStyle(false)}
                        {...register("profissao", { required: true })} 
                        defaultValue="psicologo"
                    >
                        <option value="psicologo">Psicólogo(a)</option>
                    </select>
                </div>

                {/* Checkbox Enviar Email */}
                <div style={checkboxGroupStyle}>
                    <input
                        id="enviarEmailCheck"
                        type="checkbox"
                        style={{ marginRight: '10px' }}
                        {...register("enviarEmail")}
                    />
                    <label htmlFor="enviarEmailCheck" style={checkboxLabelStyle}>Deseja enviar os cálculos via e-mail?</label>
                </div>

                {/* Input E-mail, condicional */}
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

                <button type="submit" style={primaryButtonStyle}>Calcular e Enviar</button>
                
            </form>
        </div>
    );
};

export default CalculadoraForm;