// src/components/ContatoForm/ContatoForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // ⬅️ IMPORTADO

/**
 * Componente do Formulário de Contato para interação com suporte.
 * Reúne estados de controle assíncronos e verificação em tempo real (via Form Hooks).
 * O componente recebe a prop controladora `onSubmitContato`.
 */
const ContatoForm = ({ onSubmitContato }) => {
    const navigate = useNavigate();
    
    // Injeção de hooks validadores de estados
    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    /**
     * Intercepta o evento interno submetido por useForm e encaminha ao dispatch global
     */
    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        setSubmissionSuccess(false);
        setSubmitError(null); 

        try {
            // Chama a função de envio centralizada no App.jsx
            const result = await onSubmitContato(formData); 
            
            if (result.success) {
                console.log("Mensagem de contato enviada com sucesso.");
                setSubmissionSuccess(true);
                
                // Transação bem-sucedida, oculta a notificação após expirar timeout
                setTimeout(() => setSubmissionSuccess(false), 5000);
            } else {
                // Exibe o erro retornado pelo App.jsx (Backend)
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Erro ao enviar contato:', error);
            // Captura e exibe a mensagem de erro da API
            setSubmitError(error.message || 'Erro ao enviar sua mensagem. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };
    
    // =================================================================
    // DECLARAÇÃO DE ESTILOS CSS IN JS (SCOPE DO COMPONENTE)
    // =================================================================

    const formWrapperStyle = {
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
    };

    const formContentStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px', 
        width: '100%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    };
    
    const titleStyle = {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#c24a4aff',
        fontSize: '24px',
    };

    const formGroupStyle = {
        marginBottom: '20px',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: '#555',
    };
    
    const inputStyle = (isError) => ({
        width: '100%',
        padding: '10px 15px',
        border: isError ? '1px solid #E53E3E' : '1px solid #CBD5E0',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '1em',
        backgroundColor: '#F7FAFC',
        color: '#052e15ff',
    });

    const errorTextStyle = {
        color: '#E53E3E',
        fontSize: '12px',
        marginTop: '5px',
    };

    const buttonStyle = {
        flex: 1,
        padding: '12px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    
    const submitButtonStyle = {
        ...buttonStyle,
        background: isSubmitting
            ? '#ccc' // Fallback de desativação
            : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Aplica estética da paleta principal
        color: 'white',
        pointerEvents: isSubmitting ? 'none' : 'auto', 
    };
    
    const cancelButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#f8f9fa',
        color: '#6c757d',
        border: '1px solid #ccc',
    };
    
    const successMessageStyle = {
        backgroundColor: '#D6FFD6',
        color: '#006400',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        textAlign: 'center'
    };
    
    const apiErrorStyle = {
        backgroundColor: '#FFD6D6',
        color: 'red',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        textAlign: 'center'
    };


    return (
        <div style={formWrapperStyle}>
            <div style={formContentStyle}>
                
                <h2 style={titleStyle}>Enviar Email p/ NAF</h2>

                <form onSubmit={handleSubmit(onSubmit)}> 
                    
                    {submissionSuccess && (
                        <div style={successMessageStyle}>
                            ✅ Sua mensagem foi enviada com sucesso!
                        </div>
                    )}

                    {/* Exibir erro geral de submissão da API */}
                    {submitError && (
                        <div style={apiErrorStyle}>
                            ❌ {submitError}
                        </div>
                    )}

                    {/* CAMPO NOME */}
                    <div style={formGroupStyle}>
                        <label htmlFor="nome" style={labelStyle}>Nome Completo *</label>
                        <input
                            type="text"
                            id="nome"
                            style={inputStyle(errors.nome)}
                            placeholder="Seu nome completo"
                            {...register("nome", { 
                                required: "Nome é obrigatório.",
                                minLength: { value: 3, message: "Nome deve ter pelo menos 3 caracteres." }
                            })}
                        />
                        {errors.nome && <p style={errorTextStyle}>{errors.nome.message}</p>}
                    </div>

                    {/* CAMPO EMAIL */}
                    <div style={formGroupStyle}>
                        <label htmlFor="email" style={labelStyle}>Email *</label>
                        <input
                            type="email"
                            id="email"
                            style={inputStyle(errors.email)}
                            placeholder="seu.email@exemplo.com"
                            {...register("email", { 
                                required: "E-mail é obrigatório.",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "E-mail inválido."
                                }
                            })}
                        />
                        {errors.email && <p style={errorTextStyle}>{errors.email.message}</p>}
                    </div>

                    {/* CAMPO DÚVIDA/MENSAGEM */}
                    <div style={formGroupStyle}>
                        <label htmlFor="duvida" style={labelStyle}>Sugestões/Dúvidas *</label>
                        <textarea
                            id="duvida"
                            style={{ ...inputStyle(errors.duvida), minHeight: '100px', resize: 'vertical' }}
                            placeholder="Descreva sua dúvida ou mensagem"
                            {...register("duvida", { 
                                required: "A dúvida é obrigatória.",
                                minLength: { value: 10, message: "A dúvida deve ter pelo menos 10 caracteres." }
                            })}
                        ></textarea>
                        {errors.duvida && <p style={errorTextStyle}>{errors.duvida.message}</p>}
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '30px'
                    }}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={cancelButtonStyle}
                            disabled={isSubmitting} // Desabilita para evitar navegação durante o envio
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={submitButtonStyle}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContatoForm;