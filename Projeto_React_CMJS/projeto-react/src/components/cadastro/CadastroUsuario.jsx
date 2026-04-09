import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastroUsuario = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        idade: '',
        senha: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validação do nome
        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (formData.nome.trim().length < 3) {
            newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
        }

        // Validação do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validação da idade
        if (!formData.idade) {
            newErrors.idade = 'Idade é obrigatória';
        } else if (formData.idade < 18) {
            newErrors.idade = 'Você deve ter pelo menos 18 anos';
        } else if (formData.idade > 120) {
            newErrors.idade = 'Idade inválida';
        }

        // Validação da senha
        if (!formData.senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (formData.senha.length < 6) {
            newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.nome,
                email: formData.email,
                password: formData.senha
            };
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors({ submit: errorData.message || "Erro ao realizar cadastro." });
                return;
            }

            const result = await response.json();

            // Ex: salvar token, usuário, ou simplesmente redirecionar
            // localStorage.setItem('token', result.token);

            navigate('/');
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            setErrors({ submit: 'Erro ao realizar cadastro. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 20px',
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#333',
                    fontSize: '28px',
                    fontWeight: '600'
                }}>
                    Cadastro de Usuário
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#555',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            placeholder="Digite seu nome completo"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.nome ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'border-color 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                if (!errors.nome) {
                                    e.target.style.borderColor = '#667eea';
                                }
                            }}
                            onBlur={(e) => {
                                if (!errors.nome) {
                                    e.target.style.borderColor = '#e0e0e0';
                                }
                            }}
                        />
                        {errors.nome && (
                            <span style={{
                                color: '#e74c3c',
                                fontSize: '12px',
                                marginTop: '5px',
                                display: 'block'
                            }}>
                                {errors.nome}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#555',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="seuemail@exemplo.com"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.email ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'border-color 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                if (!errors.email) {
                                    e.target.style.borderColor = '#667eea';
                                }
                            }}
                            onBlur={(e) => {
                                if (!errors.email) {
                                    e.target.style.borderColor = '#e0e0e0';
                                }
                            }}
                        />
                        {errors.email && (
                            <span style={{
                                color: '#e74c3c',
                                fontSize: '12px',
                                marginTop: '5px',
                                display: 'block'
                            }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#555',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            Senha *
                        </label>
                        <input
                            type="password"
                            name="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            placeholder="Digite sua senha"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.senha ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'border-color 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                if (!errors.senha) {
                                    e.target.style.borderColor = '#667eea';
                                }
                            }}
                            onBlur={(e) => {
                                if (!errors.senha) {
                                    e.target.style.borderColor = '#e0e0e0';
                                }
                            }}
                        />
                        {errors.senha && (
                            <span style={{
                                color: '#e74c3c',
                                fontSize: '12px',
                                marginTop: '5px',
                                display: 'block'
                            }}>
                            {errors.senha}
                        </span>)}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#555',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            Idade *
                        </label>
                        <input
                            type="number"
                            name="idade"
                            value={formData.idade}
                            onChange={handleChange}
                            placeholder="Digite sua idade"
                            min="18"
                            max="120"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.idade ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'border-color 0.3s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                if (!errors.idade) {
                                    e.target.style.borderColor = '#667eea';
                                }
                            }}
                            onBlur={(e) => {
                                if (!errors.idade) {
                                    e.target.style.borderColor = '#e0e0e0';
                                }
                            }}
                        />
                        {errors.idade && (
                            <span style={{
                                color: '#e74c3c',
                                fontSize: '12px',
                                marginTop: '5px',
                                // display: 'block'
                            }}>
                                {errors.idade}
                            </span>
                        )}
                    </div>

                    {errors.submit && (
                        <div style={{
                            // backgroundColor: '#fee',
                            color: '#e74c3c',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '30px'
                    }}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                flex: 1,
                                padding: '14px',
                                border: '2px solid #667eea',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                color: '#667eea',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: '14px',
                                border: 'none',
                                borderRadius: '8px',
                                background: isSubmitting
                                    ? '#ccc'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastroUsuario;