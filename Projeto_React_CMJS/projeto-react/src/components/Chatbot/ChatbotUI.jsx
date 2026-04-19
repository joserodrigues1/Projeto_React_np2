import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import IconeContinha from '../../assets/IconChatbootIA.png';

const FALLBACK_ICON = 'https://placehold.co/24x24/00ccff/ffffff?text=AI';
const ICON_SRC = IconeContinha;

// Captura a URL do webhook lá do .env ou usa o localhost se não tiver nada setado no env
const API_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/chatbot-unichristus";

// Geradorzinho bem mequetrefe de Hash String pra enviar Sessions pro endpoint saber separar quem é quem (session-a7b2k...)
const generateSessionId = () => "session-" + Math.random().toString(36).substring(2, 9);


// Componentezinho utilitário só pra printar avatares, caso quebre o SRC local tem tratante anti-erros.
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


// Botóes fakes "Dicas Inicias" na tela de welcome vazia do bot pra instigar user iniciar um assunto 
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
        // Pseudo-hover em React inline via JS.. da um trabalho mas evita muito arquivo CSS bagunçado.. 
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00ccff20'} 
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
        {text}
    </button>
);


// Renderizador dos balões do histórico do chat no body.
const Message = ({ message }) => (
    
    <div style={{ 
        display: 'flex', 
        // Se a mensagem partiu do proprio User q a gente ta logado, Empurra Flex-End (Direita do Whatspp), Senao Inicio esquerda padrao 
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
            
            // whitespace normal pra o markdown gerenciar os returns lá dps
            whiteSpace: message.role === 'user' ? 'pre-wrap' : 'normal',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '0.9em',
            lineHeight: '1.5',
            overflowX: 'auto' 
        }}>
            
            {/* Se quem spittou isso foi o IA, envelopa o string cru no ReactMarkdonw pra ele ficar com negrito, tabelas , links e estilos parseados por incrivel que paresa...   */}
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
    
    // States core da UI 
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // session ID lockado ate ele dar refresh na page
    const [sessionId, setSessionId] = useState(generateSessionId());
    
    // Controller de minimizar/mx widget size na area fixada direita. Toggle state 
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Ref Node mágico pra rolar forçado a página toda vida nova array de msg atualizar o component
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // O Dispatcher mor pro backend. Trata request pro N8N 
    const handleSendMessage = async (text) => {
        
        // Bloqueio de burrice do user que tentar enviar balao vazio ou espaço .
        if (!text.trim()) return;

        // Pampa na listagem state.
        const userMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        
        // Esvazia form 
        setInputText('');
        
        // Loader pro botão e pro balão "escrevendo..." aparecer. Da um feelin mais maneiro 
        setIsLoading(true);

        try {
            // Empacota padraozinho q montei lá no flow do N8N webhook
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
            
            // Isso aqui me salva na vida: independente se la no Flow no N8N a saida chamar Result, text , output bla... o js resolve fallback achando a chave certa 
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
            // Desengata marcha lente e libera UI .. 
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([]);
        setSessionId(generateSessionId());
        console.log('Conversa limpa com novo ID gerado! Olá, eu sou Christina :)'); 
    };

    /* ESTILOS DA CAIXA INLINE MAIS FEIOS POSSIVEIS...*/
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
    
    // Bind enter key pra não ter q sempre dar o miss click na setinha miniatura ne..  se ele nao der shift key o negocio avanca msm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputText);
        }
    };

    return (
        <div style={panelStyle}>
            {/* Headerzinho */}
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
                {/* Panel action buttons de topo */}
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

            {/* O miolo principal do historico de conversas */}
            <div style={{ flexGrow: 1, padding: '15px', overflowY: 'auto' }}>
                
                {/* Helper screen: Se tá limpo o chat mostra um onbording da Christina e dicas pre programadas de perguntas  */}
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

                {/* Loopingzinho do React pra descarregar component Message p cada row historico */}
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                
                {isLoading && (
                    <div style={loadingStyle}>
                        Christina está digitando...
                    </div>
                )}
                
                {/* Essa tag invisible serve só p ancorar a ref Node do motor automatico de rolagem q chamei lá em cma */}
                <div ref={messagesEndRef} /> 

                {/* Se tiver balao.. mostre lá no chaozinha do chat que da p resetar */}
                {messages.length > 0 && (
                    <p 
                        style={{ margin: '15px 0 0 0', color: '#00ccff', textAlign: 'right', fontSize: '0.8em', cursor: 'pointer' }}
                        onClick={handleClearChat}
                    >
                        Limpar conversa
                    </p>
                )}
            </div>

            {/* Area do Formulário input */}
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
                
                {/*  Botao bonitim redondo de Send.. Se ele ta loading ou sem char.. color dele é opaca sem chance dd interacao (notAlowed) */}
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