// src/components/DealerArea.tsx
import React from 'react';
import Hand from './Hand';
import { Card } from '../models/types';

interface DealerAreaProps {
  cards: Card[];
}

const DealerArea: React.FC<DealerAreaProps> = ({ cards }) => {
  const showValue = cards.length > 0 && cards[0].faceUp;
  
  return (
    <div style={{ 
      marginBottom: '20px',
      position: 'relative'
    }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>Dealer</h2>
      <div style={{ width: 'fit-content' }}>
        <Hand 
          cards={cards} 
          isDealer={true} 
          hideValue={!showValue} 
        />
      </div>
    </div>
  );
};

export default DealerArea;