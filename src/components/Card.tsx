import React from 'react';
import { Card } from '../models/types';
import { getCardColor } from '../utils/cardUtils';

interface CardProps {
  card: Card;
}

const CardComponent: React.FC<CardProps> = ({ card }) => {
  if (!card.faceUp) {
    return (
      <div style={{
        width: '80px',
        height: '120px',
        borderRadius: '5px',
        backgroundColor: '#234',
        backgroundImage: 'repeating-linear-gradient(45deg, #345 0px, #345 5px, #234 5px, #234 10px)',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
      }}></div>
    );
  }

  const color = getCardColor(card);

  return (
    <div style={{
      width: '80px',
      height: '120px',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      color,
      padding: '5px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
        {card.rank}
        <div>{card.suit}</div>
      </div>
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        fontSize: '30px' 
      }}>
        {card.suit}
      </div>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'bold',
        alignSelf: 'flex-end',
        transform: 'rotate(180deg)'
      }}>
        {card.rank}
        <div>{card.suit}</div>
      </div>
    </div>
  );
};

export default CardComponent;