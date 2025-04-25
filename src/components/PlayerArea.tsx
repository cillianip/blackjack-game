import React from 'react';
import Hand from './Hand';
import { Card } from '../models/types';

interface PlayerAreaProps {
  hands: { cards: Card[], bet: number }[];
  activeHandIndex: number;
  phase: string;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ hands, activeHandIndex, phase }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>Player</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        {hands.map((hand, index) => (
          <div key={index} style={{ 
            position: 'relative',
            border: index === activeHandIndex && phase === 'playerTurn'
              ? '2px solid gold' 
              : 'none',
            padding: '5px',
            borderRadius: '5px'
          }}>
            <Hand cards={hand.cards} />
            {hands.length > 1 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '5px', 
                color: 'white',
                fontSize: '0.9rem'
              }}>
                Bet: ${hand.bet}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerArea;