import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import IconeContinha from '../../assets/IconChatbootIA.png';

const FALLBACK_ICON = 'https://placehold.co/24x24/00ccff/ffffff?text=AI';
const ICON_SRC = IconeContinha;

// Endpoints de Integração: Utiliza variável de ambiente com fallback prioritário para desenvolvimento.
const API_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/chatbot-unichristus";

// Utilitário de Sessão: Gera identificador único dinâmico para persistência condicional e monitoramento back-end.
const generateSessionId = () => "session-" + Math.random().toString(36).substring(2, 9);


// Renderizador UI de Avatar: Encapsula falhas catastróficas de resource injetando mock-up visuais de resgate.
const IconContinha = ({ src, alt, size, isRounded, style }) => (
    <img 
        src={src || FALLBACK_ICON} 
        alt={alt} 
        style={{ 
            width: size, 
            height: size, 
            borderRadius: isRounded ? '50%' : '0', 
            objectFit: 'cover',
            ...style 
        }}
        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
    />
);


// Submódulo de Contexto Falso: Renderiza atalhos simulando entrada do usuário com base nas features do projeto.
const ChatOptionButton = ({ text, onClick }) => (
    <button
        onClick={onClick}
        style={{
            backgroundColor: 'transparent',
            color: '#00ccff',
            border: '2px solid #00ccff', 
            borderRadius: '5px',
            padding: '10px 15px',
            marginTop: '10px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
        }}
        // Tratamento inline de Hover effects 
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00ccff20'} 
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
        {text}
    </button>
);


// Componente de Visualização (Message Engine): Pinta as bolhas recursivas e ajusta margem por origin Role.
const Message = ({ message }) => (
    
    <div style={{ 
        display: 'flex', 
        // Alinhamento condicional baseados no arquétipo 'user' ou 'model' estilo WhatsApp
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', 
        marginBottom: '10px' 
    }}>
        <div style={{
            maxWidth: '90%',
            padding: '10px 15px',
            borderRadius: '18px',
            
            // UI Color theme - User = azul claro, Bot = escuro
            backgroundColor: message.role === 'user' ? '#00ccff' : '#152540',
            color: message.role === 'user' ? '#05142e' : '#e0e0e0',
            wordWrap: 'break-word',
            
            // Fix de quebra de página: Permite ao renderizador dinâmico de MD estilizar o nó 
            whiteSpace: message.role === 'user' ? 'pre-wrap' : 'normal',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '0.9em',
            lineHeight: '1.5',
            overflowX: 'auto' 
        }}>
            
            {/* Middleware de Visualização: Envelopa markdown retornado pela IA aplicando os plugins CSS estativos*/}
            {message.role === 'model' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                </ReactMarkdown>
            ) : (
                message.text
            )}
            
        </div>
    </div>
);


const ChatbotUI = ({ onClose }) => {
    
    // Core States (Memória e DOM) 
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Ciclo de Vida Sessão: Locked a menos de Refresh manual disparado 
    const [sessionId, setSessionId] = useState(generateSessionId());
    
    // Toggle UI Controller
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Auto-Scroll Behavior: Ancora finalizando no target node.
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // Controller de Emissão de Ação: Constrói a pilha, exibe loaders e despacha Fetch 
    const handleSendMessage = async (text) => {
        
        // Bloqueia transações nulas/strings de whitespace acidentais
        if (!text.trim()) return;

        // Pusha para a DOM View React nativamente antes da requisição bater 
        const userMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        
        // Libera Buffer 
        setInputText('');
        
        // Emissão do Fallback Screen 'IA Escrevendo...'
        setIsLoading(true);

        try {
            // Data Transfer Object
            const payload = {
                mensagem: text,
                sessionId: sessionId
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            // Normaliza a extração da string em multi-padrão (Variado por Node Final Externo)
            const responseText = result.resposta || result.output || result.text || result.response;

            const modelMessage = {
                role: 'model',
                text: responseText?.trim() || 'Sem resposta do servidor n8n ou formato inesperado.'
            };

            setMessages(prev => [...prev, modelMessage]);
            
        } catch (error) {
            console.error(error);
            setMessages(prev => [
                ...prev,
                { role: 'model', text: 'Ocorreu um erro ao tentar responder. Tente novamente mais tarde.' }
            ]);
        } finally {
            // Garante reativação da Tree de inputs
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([]);
        setSessionId(generateSessionId());
        console.log('Conversa limpa com novo ID gerado! Olá, eu sou Christina :)'); 
    };

    /* Design CSS In-Line Padrões Absolutos */
    const panelStyle = {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: isExpanded ? '450px' : '350px',
        height: isExpanded ? '650px' : '500px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        transition: 'width 0.3s ease, height 0.3s ease',
        backgroundColor: '#05142eff',
        color: 'white',
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        borderBottom: '1px solid #1e3c72',
        backgroundColor: '#05142eff',
        borderRadius: '10px 10px 0 0',
        position: 'sticky',
        top: 0
    };
    
    const inputAreaStyle = {
        display: 'flex',
        borderTop: '1px solid #1e3c72',
        padding: '10px 15px',
        backgroundColor: '#0a1930',
        alignItems: 'center',
    };
    
    const loadingStyle = {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '10px 15px',
        fontSize: '0.8em',
        color: '#00ccff',
    };
    
    // Intercepta e normaliza teclas de atalho garantindo eficiência ao User
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputText);
        }
    };

    return (
        <div style={panelStyle}>
            {/* View do Header Estático */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconContinha 
                        src={ICON_SRC} 
                        alt="Ícone da Continha" 
                        size="24px" 
                        isRounded={true} 
                        style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>Christina</span>
                </div>
                {/* Componentes Controles Custom da Janela PAI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={handleClearChat} title="Nova Conversa" style={{ 
                        background: 'none', border: 'none', color: '#00ccff', fontSize: '1.1em', cursor: 'pointer' 
                    }}>🔄</button>
                    
                    <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Reduzir" : "Expandir"} style={{ 
                        background: 'none', border: 'none', color: '#00ccff', fontSize: '1.1em', cursor: 'pointer' 
                    }}>{isExpanded ? '🗗' : '🗖'}</button>
                    
                    <button onClick={onClose} style={{ 
                        background: 'none', border: 'none', color: '#00ccff', fontSize: '1.2em', cursor: 'pointer' 
                    }}>X</button>
                </div>
            </div>

            {/* Sessão Central (Scroll View de Conteúdo Principal) */}
            <div style={{ flexGrow: 1, padding: '15px', overflowY: 'auto' }}>
                
                {/* Modal View Inicial Base Padrão */}
                {messages.length === 0 && (
                    <>
                        <p style={{ margin: '0 0 15px 0', color: '#ccc', fontSize: '0.9em' }}>
                            Oi, eu sou Christina :) Estou aqui para te ajudar caso tenha alguma dúvida sobre Tributação, Cálculos PF/PJ e Finanças.
                        </p>
                        
                        <ChatOptionButton 
                            text="Como posso verificar meu imposto de renda?" 
                            onClick={() => handleSendMessage("Como posso verificar meu imposto de renda?")} 
                        />
                        <ChatOptionButton 
                            text="Qual a diferença entre PF e PJ?" 
                            onClick={() => handleSendMessage("Qual a diferença entre PF e PJ?")} 
                        />
                    </>
                )}

                {/* Inject dinâmico de Rows no Node */}
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                
                {isLoading && (
                    <div style={loadingStyle}>
                        Christina está digitando...
                    </div>
                )}
                
                {/* Div Âncora Invisível (Recebe Focus de Tracking) */}
                <div ref={messagesEndRef} /> 

                {/* Botão Utilitário Inferior de Flush (Somente se popilado) */}
                {messages.length > 0 && (
                    <p 
                        style={{ margin: '15px 0 0 0', color: '#00ccff', textAlign: 'right', fontSize: '0.8em', cursor: 'pointer' }}
                        onClick={handleClearChat}
                    >
                        Limpar conversa
                    </p>
                )}
            </div>

            {/* Sessão Input Block */}
            <div style={inputAreaStyle}>
                <input
                    type="text"
                    placeholder={isLoading ? "Aguarde a resposta..." : "Escreva sua mensagem..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    style={{
                        flexGrow: 1,
                        padding: '10px',
                        border: '1px solid #1e3c72',
                        backgroundColor: '#152540',
                        color: 'white',
                        borderRadius: '20px',
                        marginRight: '10px',
                        outline: 'none',
                        fontFamily: 'Montserrat, sans-serif',
                    }}
                />
                
                {/* Validaçao Lógica Bloqueadora de Submit Null/Aguardando */}
                <button 
                    style={{ 
                        backgroundColor: (isLoading || !inputText.trim()) ? '#555' : '#00ccff', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '35px', 
                        height: '35px', 
                        color: 'white',
                        cursor: (isLoading || !inputText.trim()) ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s'
                    }}
                    onClick={() => handleSendMessage(inputText)}
                    disabled={isLoading || !inputText.trim()}
                >
                    {isLoading ? '...' : '➤'}
                </button>
            </div>
        </div>
    );
};

export default ChatbotUI;