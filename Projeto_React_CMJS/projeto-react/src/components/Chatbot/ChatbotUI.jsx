import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import IconeContinha from '../../assets/IconChatbootIA.png';

/**
 * Variáveis de ambiente e configuração de sistema
 */
const FALLBACK_ICON = 'https://placehold.co/24x24/00ccff/ffffff?text=AI';
const ICON_SRC = IconeContinha;

// Define o endpoint local ou web de integração com os automadores do N8N
const API_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/chatbot-unichristus";

/**
 * Função utilitária para gerar IDs randômicos de sessões exclusivas.
 */
const generateSessionId = () => "session-" + Math.random().toString(36).substring(2, 9);

/**
 * Componente funcional para renderizar de forma fluida os ícones avatares.
 */
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


/**
 * Módulo de Interface para Botões Sugestivos Opcionais.
 * Injeta ações contextuais na árvore inicial para encorajar as primeiras interações do usuário.
 */
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
        // Efeito visual via React Sintético para prevenir instâncias complexas ou vazamentos de escopo de CSS.
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00ccff20'} 
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
        {text}
    </button>
);


/**
 * Container principal do histórico interno de mensagens, lidando nativamente
 * com alinhamento dinâmico dependendo da role originária do node de mensagem.
 */
const Message = ({ message }) => (
    
    <div style={{ 
        display: 'flex', 
        // Alinhamento das bolhas: modelo "user" flutua à direita, "model" ou "IA" flutuam à esquerda
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', 
        marginBottom: '10px' 
    }}>
        <div style={{
            maxWidth: '90%',
            padding: '10px 15px',
            borderRadius: '18px',
            
            // Dinâmica visual (Dark background para respostas do bot e destaque saturado ao usuário)
            backgroundColor: message.role === 'user' ? '#00ccff' : '#152540',
            color: message.role === 'user' ? '#05142e' : '#e0e0e0',
            wordWrap: 'break-word',
            
            // Tratamento formativo de wrap mantendo os quebras de linha Markdown consistentes
            whiteSpace: message.role === 'user' ? 'pre-wrap' : 'normal',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '0.9em',
            lineHeight: '1.5',
            overflowX: 'auto' 
        }}>
            
            {/* Parser de Markdown para renderizar as saídas enriquecidas (ex: Links, Tabelas ou Bullets) via LLM. */}
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
    
    // Variáveis de controle comportamental da interface de chat 
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Hash único local da sessão atual do chat do usuário, preservado até desmontagem completa do container
    const [sessionId, setSessionId] = useState(generateSessionId());
    
    // Gerência de redimensionamento espacial do Widget da interface.
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Referência do DOM para forçar smooth scrolling perfeitamente contínuo
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    /**
     * Controlador central para processamento e envio assíncrono das requisições, conectando ao endpoint configurado no .env da build.
     * @param {string} text - Contéudo da mensagem transcrita.
     */
    const handleSendMessage = async (text) => {
        
        // Bloqueia tentativas de envio com strings totalmente vazias
        if (!text.trim()) return;

        // Anexa input atual na stack em memória
        const userMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        
        // Refresh na barra de digitação visual
        setInputText('');
        
        // Assina feedback visual "typing"
        setIsLoading(true);

        try {
            // Empacotamento do payload alinhado às chaves mapeadas pela Webhook N8N
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
            
            // Processamento agnóstico da resposta, aceitando múltiplas predefinições de variáveis do corpo JSON 
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
            // Encerra state Loading libertando o UI lock
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([]);
        setSessionId(generateSessionId());
        console.log('Conversa limpa com novo ID gerado! Olá, eu sou Christina :)'); 
    };

    /*  
        =======================================
        CONSTANTES DE ESTILIZAÇÃO DO COMPONENTE
        ======================================= 
    */
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
    
    // Handler de eventos chave focando interceptação de inputs e dispatch no enter principal
    const handleKeyDown = (e) => {
        // Evita Trigger de envio em caso da flag Shift (para saltos de quebra de linha em formulários)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputText);
        }
    };

    return (
        <div style={panelStyle}>
            {/* Secção Header */}
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
                {/* Grupo interativo de Menu */}
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

            {/* Ponto principal da listagem sequencial de mensagens */}
            <div style={{ flexGrow: 1, padding: '15px', overflowY: 'auto' }}>
                
                {/* Helper screen dinâmico: Exibido primariamente caso o estado local esteja despovoado */}
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

                {/* Varredura hierárquica baseada na array Stateful de mensagens */}
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                
                {isLoading && (
                    <div style={loadingStyle}>
                        Christina está digitando...
                    </div>
                )}
                
                {/* Div Âncora técnica referenciada para o fluxo de auto-scroll */}
                <div ref={messagesEndRef} /> 

                {/* Exibição condicional da funcionalidade de Hard Reset de Fluxo UI */}
                {messages.length > 0 && (
                    <p 
                        style={{ margin: '15px 0 0 0', color: '#00ccff', textAlign: 'right', fontSize: '0.8em', cursor: 'pointer' }}
                        onClick={handleClearChat}
                    >
                        Limpar conversa
                    </p>
                )}
            </div>

            {/* Interface Inferior (Formulário/Captura Textual) */}
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
                
                {/* Interatividade do envio visual: Focado em usabilidade bloqueada com states */}
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