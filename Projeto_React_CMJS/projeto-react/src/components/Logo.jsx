import React from 'react';
import LogoUnichristus from '../assets/logoUnichristus.webp';

/**
 * Componente funcional Logo.
 * Renderiza a logomarca vetorial da instituição com restrições dinâmicas de proporção.
 */
const Logo = () => {
    return (
        <div> 
            <img 
                src={LogoUnichristus} 
                alt='Logo Unichristus'
                style={{ 
                    height: '50px', 
                    width: 'auto', 
                    display: 'block', 
                    margin: '20px'
                }}
            />
        </div>
    );
};

export default Logo;