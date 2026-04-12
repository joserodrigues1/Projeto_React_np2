import React, { useState } from 'react';
import IconChatbot from './IconChatbot'; 
import chatIcon from '../../assets/IconChatbootIA.png'; 

const ChatbotToggle = ({ isOpen, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {isHovered && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          backgroundColor: '#ffffff',
          color: '#0a1930',
          padding: '8px 12px',
          borderRadius: '50px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          fontSize: '14px',
          zIndex: 1000
        }}>
          Chris está pronta para te ajudar 💡
        </div>
      )}

      <button 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '20px', 
          right: '20px',  
          zIndex: 1000,   
          
          backgroundColor: '#0a1930',
          color: '#0a1930',           
          border: 'none',
          borderRadius: '50%',       
          width: '60px',             
          height: '60px',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)', 
          
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s, transform 0.1s'
        }}
        aria-expanded={isOpen}
        aria-label="Abrir Assistente de Dúvidas"
      >
        <IconChatbot src={chatIcon} alt="Ícone do Chatbot" size="50px" isRounded={true} />
      </button>
    </>
  );
};

export default ChatbotToggle;
