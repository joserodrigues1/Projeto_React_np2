
import React from 'react';
import LogoUnichristus from '../assets/logoUnichristus.webp' 

const Logo = () => {
    return (
        <div> 
            <img 
                src = {LogoUnichristus} 
                alt = 'Logo Unichritus'
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