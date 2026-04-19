// Importa library padrao e requistos JSX.
import React from 'react';
// Puxa do local file folder assets uma imagem no formato wepb moderno ja tipado como a var LogoUni 
import LogoUnichristus from '../assets/logoUnichristus.webp' 

// Constante funcional Logo 
const Logo = () => {
    // Retorno do nó visual.
    return (
        // Container caixa
        <div> 
            {/*  Imagem tag base semantica */}
            <img 
                // linka Src dinamicamente a Var da imagem na memoria
                src = {LogoUnichristus} 
                // text auxilary acessibilidade leitor de CEgos.
                alt = 'Logo Unichritus'
                // prop css..
                style={{ 
                    // trava fixa  a altura do logo da faculdade sempre
                    height: '50px', 
                    // a Largura cresce proporcional p/ n distorcer
                    width: 'auto', 
                    // quebra linha
                    display: 'block', 
                    // separa respiro de cantos 
                    margin: '20px'
                }}
            />
        </div>
    );
};

// Exporta este componente pra a App/Header importa lo.
export default Logo;