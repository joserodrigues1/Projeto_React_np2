/**
 * Arquivo Principal da Aplicação (Entry Point)
 * ---------------------------------------------------------
 * Responsável por orquestrar o roteamento (React Router), 
 * instanciar as lógicas de cálculo tributário e gerenciar 
 * o envio assíncrono de e-mails/contato junto a uma API.
 * Aqui também encapsulamos os componentes globais (Header, Footer, Chatbot).
 */
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


// Resolução dinâmica de URLs para o ambiente de desenvolvimento (GitHub Codespaces)
// Garante que as requisições API apontem para a porta :3000 do gateway local
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

// Links das rotas da nossa API principal
const API_BASE_URL = getBackendBaseUrl();
const API_EMAIL_ENDPOINT = `${API_BASE_URL}/email/resultado`;
const API_CONTATO_ENDPOINT = `${API_BASE_URL}/email/contato`;


function App() {
    
    /** 
     * ==========================================
     *  STATE MANAGEMENT
     * ==========================================
     */
    // Estados que guardam as respostas do formulário e o resultado das contas
    const [dadosFormulario, setDadosFormulario] = useState(null);
    const [resultadoPF, setResultadoPF] = useState(null);
    const [resultadoPJ, setResultadoPJ] = useState(null);
    
    // Controla se a janelinha do chatbot está aberta ou fechada
    const [isChatOpen, setIsChatOpen] = useState(false);

    /**
     * handleCalculo
     * ---------------------------------------------------------
     * O controller principal do sistema. É engatilhado quando 
     * o usuário dá 'submit' dentro do <CalculadoraForm/>.
     * Fluxo:
     * 1. Puxa os dados capturados e higienizados.
     * 2. Evoca os algoritmos locais de cálculo (calculadoraIRPF e calculadoraIRPJ).
     * 3. Atualiza os estados globais para forçar o re-render 
     *    da tela de resultados (<ResultadoComparacao />).
     * 4. Lida opcionalmente com o disparo da API de E-mail via Axios.
     */
    const handleCalculo = async (dadosParaCalculo) => {
        console.log("Iniciando bateria de cálculo PJePF.");

        try {
            // Pega os dados bagunçados do formulário e junta tudo num pacotinho organizado
            const dadosEntrada = {
                rendaMensal: dadosParaCalculo.renda,
                custosMensais: dadosParaCalculo.custos,
                tipoCalculo: dadosParaCalculo.tipoCalculo,
                profissao: dadosParaCalculo.profissao
            };

            // Roda a matemática pra ver o imposto da pessoa física e jurídica
            const resultadoPFLocal = calculadoraIRPF(dadosEntrada.rendaMensal, dadosEntrada.custosMensais);
            const resultadoPJLocal = calculadoraIRPJ(dadosEntrada.rendaMensal, dadosEntrada.profissao);

            // Salva o resultado no estado local pro React atualizar a tela com os cards
            setDadosFormulario(dadosEntrada);
            setResultadoPF(resultadoPFLocal);
            setResultadoPJ(resultadoPJLocal);

            // Faz a tela deslizar para baixo maciamente para exibir o resultado
            setTimeout(() => {
                const el = document.getElementById('resultado-comparacao');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);

            // Se a pessoa marcou o checkbox de email, a gente dispara a requisição por baixo dos panos
            if (dadosParaCalculo.enviarEmail && dadosParaCalculo.emailUsuario) {
                console.log("Enviando requisição de email pra caixa de: ", dadosParaCalculo.emailUsuario);

                const dadosParaEmail = {
                    destinatario: dadosParaCalculo.emailUsuario,
                    renda: dadosParaCalculo.renda,
                    custos: dadosParaCalculo.custos,
                    tipoCalculo: dadosParaCalculo.tipoCalculo
                };

                await axios.post(API_EMAIL_ENDPOINT, dadosParaEmail);
            }

        } catch (error) {
            console.error("Erro feio ao tentar calcular a rotina principal:", error);

            let errorMessage = "Erro ao calcular localmente.";
            
            // Tratando o caso super específico onde o calculo na tela foi um sucesso, mas a API de email caiu
            if (error.config && error.config.url === API_EMAIL_ENDPOINT) {
                errorMessage = "Calculou certinho, mas o servidor de e-mail falhou em enviar o preview.";
            } else {
                // Limpa os estados pra remover possíveis componentes sujos/quebrados presos na tela
                setDadosFormulario(null);
                setResultadoPF(null);
                setResultadoPJ(null);
            }

            alert(errorMessage);
        }
    };
    
    // Função separada pra lidar só com o envio da aba de contato e logar possíveis falhas de conexão
    const handleSendContato = async (formData) => {
        try {
            const response = await axios.post(API_CONTATO_ENDPOINT, formData);
            return { success: true }; 
        } catch (error) {
            console.error('Contato catch error:', error);
            let errorMessage = 'A API parece que caiu ou a URL está errada.';
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage = `Xii, API Backend provavel offline: ${API_BASE_URL}`;
            } else if (error.response?.status === 404) {
                errorMessage = `Endpoit sumiu (404) do ${API_CONTATO_ENDPOINT}.`;
            } else if (error.response?.data?.message) {
                errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
            }
            // Devolve o erro textualmente pro formulário laurear a caixa problemática de vermelho
            return { success: false, error: errorMessage }; 
        }
    };

    const toggleChat = () => setIsChatOpen(prev => !prev);

    return (
        <div className='App' style={{ padding: '0', width: '100%', margin: '0' }}>
            {/* Cabeçalho fixo da aplicação */}
            <Header />

            {/* Main Wrapper com o Roteador das Páginas */}
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

                                {/* Prevenção: Só vai renderizar o bloco de resultados na tela se a gente tiver os valores do form carregados */}
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

                {/* Troca entre renderizar o botão bolinha de ajuda ou renderizar o chat completão */}
                {isChatOpen && <ChatbotUI onClose={toggleChat} />}
                {!isChatOpen && <ChatbotToggle isOpen={isChatOpen} onClick={toggleChat} />}
            </main>

            <Footer />
        </div>
    );
}

export default App;