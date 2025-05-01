// src/components/DeckCounter.tsx
import React from 'react';

interface DeckCounterProps {
  cardsRemaining: number;
  totalCards: number;
}

const DeckCounter: React.FC<DeckCounterProps> = ({ cardsRemaining, totalCards }) => {
  // Calculate percentage of cards remaining
  const percentage = totalCards > 0 ? (cardsRemaining / totalCards) * 100 : 0;
  
  // Determine color based on percentage
  let color = 'white';
  if (percentage < 25) {
    color = '#ff4d4d'; // Red when below 25%
  } else if (percentage < 50) {
    color = '#ffb84d'; // Orange when below 50%
  }
  
  return (
    <div style={{ 
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color,
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div>
        Cards: {cardsRemaining}/{totalCards}
      </div>
      <div style={{
        width: '50px',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '4px'
        }} />
      </div>
    </div>
  );
};

export default DeckCounter;