// src/components/DeckCounter.tsx
import React from 'react';

interface DeckCounterProps {
  cardsRemaining: number;
}

const DeckCounter: React.FC<DeckCounterProps> = ({ cardsRemaining }) => {
  return (
    <div style={{ 
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '0.9rem',
      fontWeight: 'bold'
    }}>
      Cards Remaining: {cardsRemaining}
    </div>
  );
};

export default DeckCounter;