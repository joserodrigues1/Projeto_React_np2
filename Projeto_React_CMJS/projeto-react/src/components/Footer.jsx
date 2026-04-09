import React from 'react';

const Footer = () => {
  return (
    <footer style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc', fontSize: '0.8em', width: '100%', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Todos os direitos reservados</p>
    </footer>
  );
};
export default Footer;