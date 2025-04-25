// src/components/Hand.tsx
import React from 'react';
import CardComponent from './Card';
import { Card } from '../models/types';
import { getBestHandValue, isBusted, isBlackjack } from '../utils/cardUtils';

interface HandProps {
  cards: Card[];
  isDealer?: boolean;
  hideValue?: boolean;
}

const Hand: React.FC<HandProps> = ({ 
  cards, 
  isDealer = false,
  hideValue = false
}) => {
  const handValue = getBestHandValue(cards);
  const busted = isBusted(cards);
  const blackjack = isBlackjack(cards);

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        {cards.map((card, index) => (
          <CardComponent key={index} card={card} />
        ))}
      </div>
      
      {!hideValue && cards.length > 0 && (
        <div style={{
          position: 'absolute',
          right: '0',
          top: '-25px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '0.9rem',
          zIndex: 10
        }}>
          {busted ? 'Bust!' : (blackjack ? 'Blackjack!' : handValue)}
        </div>
      )}
    </div>
  );
};

export default Hand;