import React from 'react';
import Hand from './Hand';
import { Card } from '../models/types';

interface DealerAreaProps {
  cards: Card[];
}

const DealerArea: React.FC<DealerAreaProps> = ({ cards }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>Dealer</h2>
      <Hand 
        cards={cards} 
        isDealer={true} 
        hideValue={cards.length > 0 && !cards[0].faceUp} 
      />
    </div>
  );
};

export default DealerArea;