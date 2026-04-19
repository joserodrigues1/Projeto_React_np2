import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Componentes da UI
import CalculadoraForm from './components/CalculadoraForm.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatbotUI from './components/Chatbot/ChatbotUI.jsx';
import ChatbotToggle from './components/Chatbot/ChatbotToggle.jsx';
import ResultadoComparacao from './components/ResultadoComparacao.jsx';

// Funções de lógica de tributação
import { calculadoraIRPF, calculadoraIRPJ } from './components/CalculadoraIR.jsx';

// Estilos
import './App.css';
import './index.css';

// Páginas secundárias
import CadastroUsuario from "./components/cadastro/CadastroUsuario.jsx";
import AjudaPage from './components/AjudaPage/AjudaPage.jsx';
import ContatoForm from './components/ContatoForm/ContatoForm.jsx';
import LoginUsuario from "./components/cadastro/LoginUsuario.jsx";


// Hack pra contornar o ambiente de desenvolvimento do Codespaces
// O github usa portas dinâmicas, essa fução força a rotaetar pro 3000 independente de onde tá rodando 
const getBackendBaseUrl = () => {
    if (typeof window === 'undefined' || !window.location.href) {
        return 'http://localhost:3000';
    }

    const currentUrl = window.location.href;
    const codespacePattern = /-\d+\.app\.github\.dev/;
    const hostMatch = currentUrl.match(/https:\/\/[^\/]+/);
    const currentHost = hostMatch ? hostMatch[0] : '';

    if (codespacePattern.test(currentHost)) {
        return currentHost.replace(/-\d+\.app\.github\.dev/, '-3000.app.github.dev');
    }

    return 'http://localhost:3000';
};

// Endpoints usados pelo axios 
const API_BASE_URL = getBackendBaseUrl();
const API_EMAIL_ENDPOINT = `${API_BASE_URL}/email/resultado`;
const API_CONTATO_ENDPOINT = `${API_BASE_URL}/email/contato`;


function App() {
    
    // States pro armazenamento dos dados após submissão dos cálculos
    const [dadosFormulario, setDadosFormulario] = useState(null);
    const [resultadoPF, setResultadoPF] = useState(null);
    const [resultadoPJ, setResultadoPJ] = useState(null);
    
    // Controlar toggle do componente ChatBot (IA Módulo)
    const [isChatOpen, setIsChatOpen] = useState(false);

    // O controller master: engatilha tudo do cálculo após o 'submit' lá do componente child CalculadoraForm 
    const handleCalculo = async (dadosParaCalculo) => {
        console.log("Iniciando bateria de cálculo PJePF.");

        try {
            // Unificando a sujeira vinda do form em um state objeto só.
            const dadosEntrada = {
                rendaMensal: dadosParaCalculo.renda,
                custosMensais: dadosParaCalculo.custos,
                tipoCalculo: dadosParaCalculo.tipoCalculo,
                profissao: dadosParaCalculo.profissao
            };

            // Roda a lógica nativa em JS pra gerar o preview real time 
            const resultadoPFLocal = calculadoraIRPF(dadosEntrada.rendaMensal, dadosEntrada.custosMensais);
            const resultadoPJLocal = calculadoraIRPJ(dadosEntrada.rendaMensal, dadosEntrada.profissao);

            // Popula os states engatilhando o re-render pros blocos em tela 
            setDadosFormulario(dadosEntrada);
            setResultadoPF(resultadoPFLocal);
            setResultadoPJ(resultadoPJLocal);

            // Animação UX: O usuário clica, e logo que calcular rola a tela maciamente ate a caixa de resultado
            setTimeout(() => {
                const el = document.getElementById('resultado-comparacao');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);

            // Rotina secundária condicional se pediu relatorio de email...
            if (dadosParaCalculo.enviarEmail && dadosParaCalculo.emailUsuario) {
                console.log("Disparando req de email -> ", dadosParaCalculo.emailUsuario);

                const dadosParaEmail = {
                    destinatario: dadosParaCalculo.emailUsuario,
                    renda: dadosParaCalculo.renda,
                    custos: dadosParaCalculo.custos,
                    tipoCalculo: dadosParaCalculo.tipoCalculo
                };

                await axios.post(API_EMAIL_ENDPOINT, dadosParaEmail);
            }

        } catch (error) {
            console.error("Crashou no handleCalculo:", error);

            let errorMessage = "Erro ao calcular localmente.";
            
            // Lidando graciosamente caso a conta deu certo mas só o email pipocou.
            if (error.config && error.config.url === API_EMAIL_ENDPOINT) {
                errorMessage = "Calculou certinho, mas o servidor de e-mail falhou em enviar o preview.";
            } else {
                // Zerando o cache de states pra matar cards lixados q ficaram em tela
                setDadosFormulario(null);
                setResultadoPF(null);
                setResultadoPJ(null);
            }

            alert(errorMessage);
        }
    };
    
    // Função Wrapper separada do form de Contato pra gente centralizar tratamento HTTP error log.
    const handleSendContato = async (formData) => {
        try {
            const response = await axios.post(API_CONTATO_ENDPOINT, formData);
            return { success: true }; 
        } catch (error) {
            console.error('Contato catch error:', error);
            let errorMessage = 'Não rolou conectar na API.';
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage = `Xii, API Backend provavel offline: ${API_BASE_URL}`;
            } else if (error.response?.status === 404) {
                errorMessage = `Endpoit sumiu (404) do ${API_CONTATO_ENDPOINT}.`;
            } else if (error.response?.data?.message) {
                errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
            }
            // Devolve e terceiriza pro ReactForm pintar em border-red.
            return { success: false, error: errorMessage }; 
        }
    };

    const toggleChat = () => setIsChatOpen(prev => !prev);

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

                                {/* Lógica Curta Circuito: Só exibe componente Resultado se os 3 requisitos state passarem Null-check */}
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

                    {/* Rota Fallback */}
                    <Route path="*" element={<h2>Página não encontrada.</h2>} />

                    <Route path='/cadastro' element={<CadastroUsuario />} />
                    <Route path='/login' element={<LoginUsuario />} />
                    <Route path='/ajuda' element={<AjudaPage />} />

                    <Route
                        path='/contato'
                        element={<ContatoForm onSubmitContato={handleSendContato} />}
                    />
                </Routes>

                {/* Render Condicional do Modal UI de Chatbot da Christina ou só da Bolinha dele */}
                {isChatOpen && <ChatbotUI onClose={toggleChat} />}
                {!isChatOpen && <ChatbotToggle isOpen={isChatOpen} onClick={toggleChat} />}
            </main>

            <Footer />
        </div>
    );
}

export default App;