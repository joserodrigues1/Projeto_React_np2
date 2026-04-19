// src/App.jsx

// Importa o React e o hook de estado.
import React, { useState } from 'react';
// Importa rotas do React Router.
import { Routes, Route } from 'react-router-dom';
// Importa o Axios para chamadas HTTP.
import axios from 'axios';
// Importa o formulário da calculadora.
import CalculadoraForm from './components/CalculadoraForm.jsx';
// Importa o cabeçalho da página.
import Header from './components/Header';
// Importa o rodapé da página.
import Footer from './components/Footer';
// Importa a UI do chatbot.
import ChatbotUI from './components/Chatbot/ChatbotUI.jsx';
// Importa o botão de abrir/fechar do chatbot.
import ChatbotToggle from './components/Chatbot/ChatbotToggle.jsx';
// Importa o componente que exibe o resultado comparativo.
import ResultadoComparacao from './components/ResultadoComparacao.jsx';
// Importa as funções de cálculo de imposto.
import { calculadoraIRPF, calculadoraIRPJ } from './components/CalculadoraIR.jsx';
// Importa estilos globais.
import './App.css';
import './index.css';
// Importa as páginas extras.
import CadastroUsuario from "./components/cadastro/CadastroUsuario.jsx";
import AjudaPage from './components/AjudaPage/AjudaPage.jsx';
import ContatoForm from './components/ContatoForm/ContatoForm.jsx';
import LoginUsuario from "./components/cadastro/LoginUsuario.jsx";

// Retorna a URL base do backend conforme o ambiente atual.
const getBackendBaseUrl = () => {
    if (typeof window === 'undefined' || !window.location.href) {
        // Em ambiente server-side / teste, usa localhost.
        return 'http://localhost:3000';
    }

    // Captura a URL atual do navegador.
    const currentUrl = window.location.href;
    const codespacePattern = /-\d+\.app\.github\.dev/;
    const hostMatch = currentUrl.match(/https:\/\/[^\/]+/);
    const currentHost = hostMatch ? hostMatch[0] : '';

    // Ajusta a URL quando estiver rodando em GitHub Codespaces.
    if (codespacePattern.test(currentHost)) {
        const updatedHost = currentHost.replace(/-\d+\.app\.github\.dev/, '-3000.app.github.dev');
        return updatedHost;
    }

    // Caso padrão, usa localhost.
    return 'http://localhost:3000';
};

// Constantes de endpoint para as APIs do backend.
const API_BASE_URL = getBackendBaseUrl();
const API_EMAIL_ENDPOINT = `${API_BASE_URL}/email/resultado`;
const API_CONTATO_ENDPOINT = `${API_BASE_URL}/email/contato`;

function App() {
    // Armazena os dados enviados pelo formulário.
    const [dadosFormulario, setDadosFormulario] = useState(null);
    // Guarda o resultado do cálculo de Pessoa Física.
    const [resultadoPF, setResultadoPF] = useState(null);
    // Guarda o resultado do cálculo de Pessoa Jurídica.
    const [resultadoPJ, setResultadoPJ] = useState(null);
    // Controla se o chatbot está aberto ou não.
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Manipula o envio do formulário e executa o cálculo local.
    const handleCalculo = async (dadosParaCalculo) => {
        console.log("Calculando localmente com CalculadoraIR.");

        try {
            // Normaliza os dados de entrada em um objeto único.
            const dadosEntrada = {
                rendaMensal: dadosParaCalculo.renda,
                custosMensais: dadosParaCalculo.custos,
                tipoCalculo: dadosParaCalculo.tipoCalculo,
                profissao: dadosParaCalculo.profissao
            };

            // Calcula o resultado para Pessoa Física.
            const resultadoPFLocal = calculadoraIRPF(dadosEntrada.rendaMensal, dadosEntrada.custosMensais);
            // Calcula o resultado para Pessoa Jurídica.
            const resultadoPJLocal = calculadoraIRPJ(dadosEntrada.rendaMensal, dadosEntrada.profissao);

            // Atualiza o estado para exibição dos resultados.
            setDadosFormulario(dadosEntrada);
            setResultadoPF(resultadoPFLocal);
            setResultadoPJ(resultadoPJLocal);

            console.log("Sucesso no cálculo local. Resultados prontos para exibição.");

            // Desliza para o componente de resultado após calcular.
            setTimeout(() => {
                const el = document.getElementById('resultado-comparacao');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 150);

            if (dadosParaCalculo.enviarEmail && dadosParaCalculo.emailUsuario) {
                console.log("Iniciando envio de e-mail para:", dadosParaCalculo.emailUsuario);

                // Prepara dados para enviar por e-mail ao backend.
                const dadosParaEmail = {
                    destinatario: dadosParaCalculo.emailUsuario,
                    renda: dadosParaCalculo.renda,
                    custos: dadosParaCalculo.custos,
                    tipoCalculo: dadosParaCalculo.tipoCalculo
                };

                await axios.post(API_EMAIL_ENDPOINT, dadosParaEmail);
                console.log("✅ E-mail enviado com sucesso para o Mailtrap.");
            }

        } catch (error) {
            console.error("❌ Erro no cálculo local ou no envio de email:", error);

            let errorMessage = "Erro ao calcular localmente.";
            if (error.config && error.config.url === API_EMAIL_ENDPOINT) {
                // Erro específico do envio de e-mail.
                errorMessage = "Cálculo efetuado, mas houve uma falha ao enviar o e-mail. Verifique o console para detalhes.";
                console.error("Falha no envio do e-mail:", error.response?.data || error.message);
            } else {
                // Limpa estado em caso de erro no cálculo local.
                setDadosFormulario(null);
                setResultadoPF(null);
                setResultadoPJ(null);
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
            // Envia os dados do formulário de contato para o backend.
            const response = await axios.post(
                API_CONTATO_ENDPOINT,
                formData
            );
            console.log("Contato enviado com sucesso:", response.data);
            return { success: true }; // Retorna ao componente de contato um status positivo.

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
            return { success: false, error: errorMessage }; // Retorna o erro para o componente que chamou.
        }
    };
    // =========================================================================


    // Alterna o estado do chatbot.
    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    };

    return (
        <div className='App' style={{ padding: '0', width: '100%', margin: '0' }}>

            {/* Cabeçalho fixo do site. */}
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

                                {/* Mostra o resultado apenas quando ambos os cálculos estiverem prontos. */}
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

                    {/* Rotas adicionais da aplicação. */}
                    <Route path='/cadastro' element={<CadastroUsuario />} />
                    <Route path='/login' element={<LoginUsuario />} />
                    <Route path='/ajuda' element={<AjudaPage />} />

                    {/* Rota do formulário de contato com envio gerenciado pelo App. */}
                    <Route
                        path='/contato'
                        element={<ContatoForm onSubmitContato={handleSendContato} />}
                    />

                </Routes>

                {/* Exibe o chatbot quando aberto, ou o botão de toggle quando fechado. */}
                {isChatOpen && <ChatbotUI onClose={toggleChat} />}
                {!isChatOpen && <ChatbotToggle isOpen={isChatOpen} onClick={toggleChat} />}

            </main>

            {/* Rodapé padrão. */}
            <Footer />

        </div>
    );
}

export default App;