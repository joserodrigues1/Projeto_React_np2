import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginUsuario = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
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

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        }

        if (!formData.senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.senha
            };

            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors({ submit: errorData.message || "Credenciais inválidas." });
                return;
            }

            const result = await response.json();

            // Exemplo de salvar token
            localStorage.setItem("token", result.token);

            navigate('/');
        } catch (error) {
            console.error("Erro no login:", error);
            setErrors({ submit: "Erro ao realizar login. Tente novamente." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/cadastro');
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
                maxWidth: '450px',
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
                    Login
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
                                outline: 'none'
                            }}
                        />
                        {errors.email && (
                            <span style={{ color: '#e74c3c', fontSize: '12px' }}>
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
                                outline: 'none'
                            }}
                        />
                        {errors.senha && (
                            <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                                {errors.senha}
                            </span>
                        )}
                    </div>

                    {errors.submit && (
                        <div style={{
                            color: '#e74c3c',
                            padding: '12px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
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
                            marginBottom: '15px'
                        }}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>

                    <button
                        type="button"
                        onClick={handleRegisterRedirect}
                        style={{
                            width: '100%',
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
                    >
                        Criar Conta
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginUsuario;
