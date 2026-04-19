import React from 'react';
import Logo from './Logo.jsx';
import {Link} from "react-router-dom";

// Componente Header padrão da aplicação
const Header = () => {

    // Configurando um objeto de estilo pros links do menu pra não ficar tacando CSS inline no JSX todo
    const linkStyle = {
        color: '#ccc',
        textDecoration: 'none', // arranca aquele underline horrível das âncoras html 
        fontSize: '1.1em',
        fontWeight: '500',
        padding: '8px 20px',
        borderRadius: '6px',
        transition: 'all 0.3s ease',
        position: 'relative'
    };

    // Eventos de hover em JS pra dar feedback visual nas abas do navbar
    const handleMouseEnter = (e) => {
        e.target.style.color = '#007284';
        e.target.style.backgroundColor = 'rgba(0, 114, 132, 0.1)';
    };

    const handleMouseLeave = (e) => {
        e.target.style.color = '#ccc';
        e.target.style.backgroundColor = 'transparent';
    };

  return (
    <header
      style={{
        padding: '15px 0',
        borderBottom: '4px solid #007284',
        width: '100%',
        backgroundColor: '#05142eff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '20px',
        }}
      >
        <Logo />

        {/* Titulo Global da aplicação alinhado da direita do menu principal */}
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '1.9em', color: 'white' }}>
            Calculadora de Tributação
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '1.0em', color: '#ccc' }}>
            Pessoa Física e Jurídica
          </p>
        </div>

      </div>

        {/* Envolvendo a navegação do SPA com o Nav */}
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            padding: '15px 0 10px 0',
            marginTop: '10px',
            borderTop: '1px solid rgba(0, 114, 132, 0.3)'
        }}>
            {/* O Link do react-router domula de trocar paginas sem re-renderizar todo o app */}
            <Link
                to="/"
                style={linkStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                Home
            </Link>

            <Link
                to="/ajuda"
                style={linkStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                Perguntas Frequentes
            </Link>
            
            {/* 
            Essas abas estão escondidas temporariamente do projeto principal pois não fecharam escopo 
            
            <Link to="/contato" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}> Contato </Link>
            <Link to="/cadastro" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}> Cadastrar </Link>
            <Link to="/login" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}> Login </Link> 
            */}

        </nav>
    </header>
  );
};

export default Header;