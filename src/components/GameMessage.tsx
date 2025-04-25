import React from 'react';

interface GameMessageProps {
  message: string;
}

const GameMessage: React.FC<GameMessageProps> = ({ message }) => {
  return (
    <div style={{ 
      margin: '20px 0', 
      textAlign: 'center', 
      backgroundColor: 'rgba(0,0,0,0.3)', 
      padding: '10px', 
      borderRadius: '4px', 
      color: 'white',
      fontWeight: 'bold'
    }}>
      {message}
    </div>
  );
};

export default GameMessage;