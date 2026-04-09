import React from 'react';

const IconChatbot = ({ src, alt, size = '24px', isRounded = false, style = {} }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      style={{
        height: size,
        width: size,
        display: 'block',
        borderRadius:'50%', 
        ...style
      }} 
    />
  );
};

export default IconChatbot;