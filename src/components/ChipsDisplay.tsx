import React from 'react';

interface ChipsDisplayProps {
  chips: number;
}

const ChipsDisplay: React.FC<ChipsDisplayProps> = ({ chips }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        padding: '8px 15px', 
        borderRadius: '20px',
        fontWeight: 'bold',
        color: 'white'
      }}>
        Chips: ${chips}
      </div>
    </div>
  );
};

export default ChipsDisplay;