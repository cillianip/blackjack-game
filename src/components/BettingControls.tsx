import React, { useState } from 'react';

interface BettingControlsProps {
  chips: number;
  onPlaceBet: (amount: number) => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({ chips, onPlaceBet }) => {
  const [betAmount, setBetAmount] = useState(0);
  
  const chipValues = [5, 10, 25, 50].filter(value => value <= chips);
  
  const handleChipClick = (value: number) => {
    if (value <= chips - betAmount) {
      setBetAmount(prev => prev + value);
    }
  };
  
  const handleClearBet = () => {
    setBetAmount(0);
  };
  
  const handlePlaceBet = () => {
    if (betAmount > 0) {
      onPlaceBet(betAmount);
      setBetAmount(0);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ color: 'white', fontWeight: 'bold' }}>Bet: ${betAmount}</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {chipValues.map((amount) => (
          <button 
            key={amount}
            onClick={() => handleChipClick(amount)}
            disabled={amount > chips - betAmount}
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              backgroundColor: amount > chips - betAmount ? '#888' : '#d4af37',
              border: '2px dashed white',
              color: 'black',
              fontWeight: 'bold',
              cursor: amount > chips - betAmount ? 'not-allowed' : 'pointer'
            }}
          >
            ${amount}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleClearBet}
          disabled={betAmount === 0}
          style={{ 
            backgroundColor: betAmount === 0 ? '#888' : '#d4af37', 
            color: '#222', 
            border: 'none', 
            padding: '10px 20px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: betAmount === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Clear
        </button>
        <button 
          onClick={handlePlaceBet}
          disabled={betAmount === 0}
          style={{ 
            backgroundColor: betAmount === 0 ? '#888' : '#d4af37', 
            color: '#222', 
            border: 'none', 
            padding: '10px 20px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: betAmount === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Deal
        </button>
      </div>
    </div>
  );
};

export default BettingControls;