// src/components/Statistics.tsx
import React from 'react';
import { GameStats } from '../models/types';

interface StatisticsProps {
  stats: GameStats;
  show: boolean;
}

const Statistics: React.FC<StatisticsProps> = ({ stats, show }) => {
  if (!show || stats.handsPlayed === 0) {
    return null;
  }

  const winPercentage = stats.handsPlayed > 0 
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100) 
    : 0;

  return (
    <div style={{
      margin: '15px 0',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '5px',
      color: 'white'
    }}>
      <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>Game Statistics</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Hands Played</div>
          <div>{stats.handsPlayed}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Win Rate</div>
          <div>{winPercentage}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Hands Won</div>
          <div>{stats.handsWon}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Hands Lost</div>
          <div>{stats.handsLost}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Pushes</div>
          <div>{stats.handsPushed}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Blackjacks</div>
          <div>{stats.blackjacks}</div>
        </div>
        {stats.largestWin > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>Largest Win</div>
            <div>${stats.largestWin}</div>
          </div>
        )}
        {stats.largestLoss > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>Largest Loss</div>
            <div>${stats.largestLoss}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;