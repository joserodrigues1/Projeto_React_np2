// Importa lib React base.
import React from 'react';

// Declara o Componente funcional Footer que renderiza o rodapé do aplicativo.
const Footer = () => {
    // Retorna a Tag semântica basica do HTML. 
    return (
        // Estiliza tag rodapé afastanto do topo com margens, dando linha 1px sólida encima como limite divisorio etc...
        <footer style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc', fontSize: '0.8em', width: '100%', textAlign: 'center' }}>
            {/* Imprime string estática usando codigo especial copyritgh (&copy) + data dinamica javascript Date Year atual para n ficar preso. */}
            <p>&copy; {new Date().getFullYear()} Todos os direitos reservados</p>
        </footer>
    );
};

// Export base.
export default Footer;