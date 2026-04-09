// src/App.jsx

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import CalculadoraForm from './components/CalculadoraForm.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatbotUI from './components/Chatbot/ChatbotUI.jsx';
import ChatbotToggle from './components/Chatbot/ChatbotToggle.jsx';
import ResultadoComparacao from './components/ResultadoComparacao.jsx';
import './App.css';
import './index.css';
import CadastroUsuario from "./components/cadastro/CadastroUsuario.jsx";
import AjudaPage from './components/AjudaPage/AjudaPage.jsx';
import ContatoForm from './components/ContatoForm/ContatoForm.jsx';
import LoginUsuario from "./components/cadastro/LoginUsuario.jsx";

const getBackendBaseUrl = () => {
    if (typeof window === 'undefined' || !window.location.href) {
        return 'http://localhost:3000';
    }

    const currentUrl = window.location.href;
    const codespacePattern = /-\d+\.app\.github\.dev/;
    const hostMatch = currentUrl.match(/https:\/\/[^\/]+/);
    const currentHost = hostMatch ? hostMatch[0] : '';
    
    if (codespacePattern.test(currentHost)) {
        const updatedHost = currentHost.replace(/-\d+\.app\.github\.dev/, '-3000.app.github.dev');
        return updatedHost;
    }

    return 'http://localhost:3000';
};

const API_BASE_URL = getBackendBaseUrl();
const API_CALCULO_ENDPOINT = `${API_BASE_URL}/calculo/simular`; 
const API_EMAIL_ENDPOINT = `${API_BASE_URL}/email/resultado`;
const API_CONTATO_ENDPOINT = `${API_BASE_URL}/email/contato`;


function App() {
    
    const [dadosFormulario, setDadosFormulario] = useState(null); 
    const [resultadoPF, setResultadoPF] = useState(null); 
    const [resultadoPJ, setResultadoPJ] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    
    const handleCalculo = async (dadosParaBackend) => {
        console.log("Chamando API de Cálculo em:", API_CALCULO_ENDPOINT);

        try {
            // 1. CHAMADA AO BACKEND (CÁLCULO)
            const response = await axios.post(API_CALCULO_ENDPOINT, {
                renda: dadosParaBackend.renda,
                custos: dadosParaBackend.custos,
                tipoCalculo: dadosParaBackend.tipoCalculo
            });
            
            // 2. ATUALIZAÇÃO DOS ESTADOS COM OS DADOS RETORNADOS DO BACKEND
            const { dados: { dadosEntrada, resultadoPF, resultadoPJ } } = response.data; 

            setDadosFormulario(dadosEntrada);
            setResultadoPF(resultadoPF);
            setResultadoPJ(resultadoPJ);
            
            console.log("Sucesso na Validação e Cálculo do Backend. Resultados prontos para exibição.");
            
            // 3. ROLAR PARA O RESULTADO
            setTimeout(() => {
                const el = document.getElementById('resultado-comparacao');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 150);

            // 4. CHAMADA AO BACKEND (ENVIO DE E-MAIL)
            if (dadosParaBackend.enviarEmail && dadosParaBackend.emailUsuario) {
                console.log("Iniciando envio de e-mail para:", dadosParaBackend.emailUsuario);
                
                // Monta o objeto com os dados necessários para o EmailService
                const dadosParaEmail = {
                    destinatario: dadosParaBackend.emailUsuario,
                    renda: dadosParaBackend.renda,
                    custos: dadosParaBackend.custos,
                    tipoCalculo: dadosParaBackend.tipoCalculo
                };

                await axios.post(API_EMAIL_ENDPOINT, dadosParaEmail);

                console.log("✅ E-mail enviado com sucesso para o Mailtrap.");
            }

        } catch (error) {
            console.error("❌ Erro ao processar a requisição:", error);
            
            let errorMessage = "Erro ao calcular. Verifique se o backend está ativo.";

            if (error.config && error.config.url === API_EMAIL_ENDPOINT) {
                errorMessage = "Cálculo efetuado, mas houve uma falha ao enviar o e-mail. Verifique o console para detalhes.";
                console.error("Falha no envio do e-mail:", error.response?.data || error.message);
            } else {
                // Limpa os estados em caso de erro no cálculo para forçar o re-cálculo
                setDadosFormulario(null);
                setResultadoPF(null);
                setResultadoPJ(null);

                // Trata erros de rede/CORS
                if (error.code === 'ERR_NETWORK') {
                    errorMessage = `Falha de rede (CORS/Bloqueio). O Back-end está ativo em ${API_BASE_URL}?`;
                } else if (error.response?.status === 404) {
                    errorMessage = `Erro 404: Rota não encontrada no Back-end. URL: ${API_CALCULO_ENDPOINT}`;
                } else if (error.response?.data?.message) {
                    errorMessage = `Erro do servidor: ${error.response.data.message}`;
                }

                console.error("Falha no cálculo:", error.response?.data || error.message);
            }

            alert(errorMessage);
        }
    };
    
    // =========================================================================
    // FUNÇÃO DE ENVIO DE CONTATO CENTRALIZADA
    // =========================================================================
    const handleSendContato = async (formData) => {
        console.log("Chamando API de Contato em:", API_CONTATO_ENDPOINT);
        
        try {
            const response = await axios.post(
                API_CONTATO_ENDPOINT, 
                formData
            );
            console.log("Contato enviado com sucesso:", response.data);
            return { success: true }; // ⬅️ Retorna sucesso para o ContatoForm
            
        } catch (error) {
            console.error('Erro ao enviar contato (via App.jsx):', error);
            
            let errorMessage = 'Falha ao conectar-se ao servidor (Network/CORS).';
            if (error.code === 'ERR_NETWORK') {
                errorMessage = `Falha de conexão com o Back-end (${API_BASE_URL}).`;
            } else if (error.response?.status === 404) {
                errorMessage = `Erro 404: Rota de contato não encontrada (${API_CONTATO_ENDPOINT}).`;
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
            }
            return { success: false, error: errorMessage }; // ⬅️ Retorna o erro para o ContatoForm
        }
    };
    // =========================================================================


    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    };

    return (
        <div className='App' style={{ padding: '0', width: '100%', margin: '0' }}>

            <Header />

            <main>
                <Routes>
                    <Route
                        path='/'
                        element={
                            <div className="container-principal">
                                
                                <CalculadoraForm
                                    onDataSubmit={handleCalculo}
                                    onOpenChat={toggleChat}
                                />
                            
                                {/* Renderiza o resultado SOMENTE quando todos os dados estiverem no estado */}
                                {dadosFormulario && resultadoPF && resultadoPJ && (
                                    <ResultadoComparacao
                                        dadosEntrada={dadosFormulario}
                                        resultadoPF={resultadoPF}
                                        resultadoPJ={resultadoPJ}
                                    />
                                )}
                            </div>
                        }
                    />

                    <Route path="*" element={<h2>Página não encontrada.</h2>} />

                    <Route path='/cadastro' element={<CadastroUsuario />} />
                    <Route path='/login' element={<LoginUsuario />} />
                    <Route path='/ajuda' element={<AjudaPage />} />
                    
                    {/* Rota do ContatoForm (Passando a função de envio) */}
                    <Route 
                        path='/contato' 
                        element={<ContatoForm onSubmitContato={handleSendContato} />} 
                    /> 

                </Routes>

                {isChatOpen && <ChatbotUI onClose={toggleChat} />}
                {!isChatOpen && <ChatbotToggle isOpen={isChatOpen} onClick={toggleChat} />}

            </main>

            <Footer />

        </div>
    );
}

export default App;