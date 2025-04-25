// src/components/GameOverModal.tsx
import React from 'react';

interface GameOverModalProps {
  onReset: () => void;
  onLoan: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ onReset, onLoan }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#222',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'gold', marginBottom: '15px' }}>Out of Chips!</h2>
        <p style={{ color: 'white', marginBottom: '20px' }}>
          You've run out of chips. Would you like to:
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button
            onClick={onReset}
            style={{
              backgroundColor: '#d4af37',
              color: '#222',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Start New Game
          </button>
          <button
            onClick={onLoan}
            style={{
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Get $100 Loan
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;