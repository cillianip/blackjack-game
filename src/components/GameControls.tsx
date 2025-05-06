// src/components/GameControls.tsx
import React from 'react';
import { Card, GamePhase } from '../models/types';
import { canDoubleDown, canSplit, isBlackjack } from '../utils/cardUtils';

interface GameControlsProps {
  phase: GamePhase;
  cards: Card[];
  chips: number;
  currentBet: number;
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onSplit: () => void;
  onNewRound: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  phase, 
  cards,
  chips,
  currentBet,
  onHit, 
  onStand,
  onDoubleDown,
  onSplit,
  onNewRound 
}) => {
  const buttonStyle = { 
    backgroundColor: '#d4af37', 
    color: '#222', 
    border: 'none', 
    padding: '10px 20px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };
  
  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#888',
    cursor: 'not-allowed'
  };
  
  if (phase === GamePhase.PLAYER_TURN) {
    const canDouble = canDoubleDown(cards) && chips >= currentBet;
    const canPlayerSplit = canSplit(cards) && chips >= currentBet;
    const hasBlackjack = isBlackjack(cards);
    
    // If the player has blackjack in this hand, they should only be able to stand
    if (hasBlackjack) {
      return (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onStand} style={buttonStyle}>Stand</button>
          <span style={{ 
            color: 'white', 
            background: 'rgba(0,0,0,0.5)', 
            padding: '10px', 
            borderRadius: '4px',
            fontWeight: 'bold' 
          }}>
            Blackjack!
          </span>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onHit} style={buttonStyle}>Hit</button>
        <button onClick={onStand} style={buttonStyle}>Stand</button>
        
        {cards.length === 2 && (
          <>
            <button 
              onClick={onDoubleDown} 
              disabled={!canDouble}
              style={canDouble ? buttonStyle : disabledButtonStyle}
            >
              Double Down
            </button>
            
            <button 
              onClick={onSplit} 
              disabled={!canPlayerSplit}
              style={canPlayerSplit ? buttonStyle : disabledButtonStyle}
            >
              Split
            </button>
          </>
        )}
      </div>
    );
  }
  
  if (phase === GamePhase.GAME_OVER) {
    return (
      <button onClick={onNewRound} style={buttonStyle}>New Hand</button>
    );
  }
  
  return null;
};

export default GameControls;