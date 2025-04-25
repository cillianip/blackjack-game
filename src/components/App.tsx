import React, { useState } from 'react';
import Hand from './components/Hand';
import { Deck } from './models/Deck';
import { Card, GamePhase, GameResult, GameStats } from './models/types';
import { getBestHandValue, isBusted, isBlackjack } from './utils/cardUtils';

const App: React.FC = () => {
  // Game state
  const [phase, setPhase] = useState<GamePhase>(GamePhase.BETTING);
  const [deck, setDeck] = useState<Deck>(new Deck());
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<{ cards: Card[], bet: number }[]>([{ cards: [], bet: 0 }]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [chips, setChips] = useState(100);
  const [betAmount, setBetAmount] = useState(0);
  const [message, setMessage] = useState('Place your bet to start the game');
  
  // Statistics
  const [stats, setStats] = useState<GameStats>({
    handsPlayed: 0,
    handsWon: 0,
    handsLost: 0,
    handsPushed: 0,
    blackjacks: 0,
    largestWin: 0,
    largestLoss: 0
  });

  // Handle betting
  const handleChipClick = (amount: number) => {
    if (phase !== GamePhase.BETTING) return;
    if (amount > chips - betAmount) return;
    
    setBetAmount(betAmount + amount);
  };
  
  const handleClearBet = () => {
    setBetAmount(0);
  };
  
  const handlePlaceBet = () => {
    if (betAmount <= 0) return;
    
    // Create a new deck and shuffle it
    const newDeck = new Deck();
    
    // Deal initial cards
    const newPlayerCards = [newDeck.deal()!, newDeck.deal()!];
    const newDealerCards = [
      { ...newDeck.deal()!, faceUp: false },
      newDeck.deal()!
    ];
    
    setDeck(newDeck);
    setPlayerHands([{ cards: newPlayerCards, bet: betAmount }]);
    setDealerCards(newDealerCards);
    setChips(chips - betAmount);
    setBetAmount(0);
    setPhase(GamePhase.PLAYER_TURN);
    
    if (isBlackjack(newPlayerCards)) {
      // If player has blackjack, move to dealer's turn
      handleDealerPlay(newDeck, [{ cards: newPlayerCards, bet: betAmount }], newDealerCards);
    } else {
      setMessage('Your turn. Hit or Stand?');
    }
  };

  // Handle hit action
  const handleHit = () => {
    if (phase !== GamePhase.PLAYER_TURN) return;
    
    const newDeck = new Deck();
    newDeck.cards = [...deck.cards];
    
    const newCard = newDeck.deal();
    if (!newCard) return;
    
    const newPlayerHands = [...playerHands];
    newPlayerHands[activeHandIndex].cards.push(newCard);
    
    setPlayerHands(newPlayerHands);
    setDeck(newDeck);
    
    if (isBusted(newPlayerHands[activeHandIndex].cards)) {
      if (activeHandIndex < playerHands.length - 1) {
        // If there are more hands to play
        setActiveHandIndex(activeHandIndex + 1);
        setMessage(`Playing hand ${activeHandIndex + 2}...`);
      } else {
        setMessage('Bust! You lose.');
        setPhase(GamePhase.GAME_OVER);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          handsPlayed: prev.handsPlayed + 1,
          handsLost: prev.handsLost + 1,
          largestLoss: Math.max(prev.largestLoss, newPlayerHands[activeHandIndex].bet)
        }));
      }
    }
  };

  // Handle stand action
  const handleStand = () => {
    if (phase !== GamePhase.PLAYER_TURN) return;
    
    if (activeHandIndex < playerHands.length - 1) {
      // Move to next hand if there are more
      setActiveHandIndex(activeHandIndex + 1);
      setMessage(`Playing hand ${activeHandIndex + 2}...`);
    } else {
      handleDealerPlay(deck, playerHands, dealerCards);
    }
  };

  // Dealer's turn
  const handleDealerPlay = (
    currentDeck: Deck, 
    currentPlayerHands: { cards: Card[], bet: number }[], 
    currentDealerCards: Card[]
  ) => {
    setPhase(GamePhase.DEALER_TURN);
    
    // Flip dealer's hidden card
    const newDealerCards = [...currentDealerCards];
    newDealerCards[0].faceUp = true;
    
    // Dealer draws until 17 or higher
    let dealerValue = getBestHandValue(newDealerCards);
    
    while (dealerValue < 17) {
      const newCard = currentDeck.deal();
      if (!newCard) break;
      
      newDealerCards.push(newCard);
      dealerValue = getBestHandValue(newDealerCards);
    }
    
    setDealerCards(newDealerCards);
    
    // Evaluate results for all hands
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let newStats = { ...stats };
    let resultMessage = '';
    let newChips = chips;
    
    for (const hand of currentPlayerHands) {
      newStats.handsPlayed++;
      
      if (isBusted(hand.cards)) {
        newStats.handsLost++;
        totalLossAmount += hand.bet;
        continue;
      }
      
      const playerValue = getBestHandValue(hand.cards);
      const dealerValue = getBestHandValue(newDealerCards);
      
      if (isBlackjack(hand.cards)) {
        if (isBlackjack(newDealerCards)) {
          // Both have blackjack - push
          newStats.handsPushed++;
          newChips += hand.bet; // Return bet
          resultMessage = 'Both have Blackjack! Push.';
        } else {
          // Player has blackjack - win 3:2
          newStats.handsWon++;
          newStats.blackjacks++;
          const winAmount = Math.floor(hand.bet * 1.5);
          totalWinAmount += winAmount;
          newChips += hand.bet + winAmount;
          resultMessage = 'Blackjack! You win 3:2!';
        }
      } else if (isBusted(newDealerCards)) {
        // Dealer busts - player wins
        newStats.handsWon++;
        totalWinAmount += hand.bet;
        newChips += hand.bet * 2; // Original bet + winnings
        resultMessage = 'Dealer busts! You win!';
      } else if (playerValue > dealerValue) {
        // Player has higher value - win
        newStats.handsWon++;
        totalWinAmount += hand.bet;
        newChips += hand.bet * 2; // Original bet + winnings
        resultMessage = 'You win!';
      } else if (playerValue < dealerValue) {
        // Dealer has higher value - lose
        newStats.handsLost++;
        totalLossAmount += hand.bet;
        resultMessage = 'Dealer wins!';
      } else {
        // Same value - push
        newStats.handsPushed++;
        newChips += hand.bet; // Return bet
        resultMessage = 'Push!';
      }
    }
    
    // Update largest win/loss stats
    if (totalWinAmount > newStats.largestWin) {
      newStats.largestWin = totalWinAmount;
    }
    
    if (totalLossAmount > newStats.largestLoss) {
      newStats.largestLoss = totalLossAmount;
    }
    
    setChips(newChips);
    setStats(newStats);
    setMessage(resultMessage);
    setPhase(GamePhase.GAME_OVER);
  };

  // Start new round
  const handleNewRound = () => {
    setPlayerHands([{ cards: [], bet: 0 }]);
    setDealerCards([]);
    setActiveHandIndex(0);
    setPhase(GamePhase.BETTING);
    setMessage('Place your bet to start the game');
    
    // Check if deck is running low
    if (deck.count < 15) {
      setDeck(new Deck());
    }
  };

  // Render betting controls
  const renderBettingControls = () => {
    const chipValues = [5, 10, 25, 50].filter(value => value <= chips);
    
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

  // Render game controls
  const renderGameControls = () => {
    const buttonStyle = { 
      backgroundColor: '#d4af37', 
      color: '#222', 
      border: 'none', 
      padding: '10px 20px',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer'
    };
    
    if (phase === GamePhase.PLAYER_TURN) {
      return (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleHit} style={buttonStyle}>Hit</button>
          <button onClick={handleStand} style={buttonStyle}>Stand</button>
        </div>
      );
    }
    
    if (phase === GamePhase.GAME_OVER) {
      return (
        <button onClick={handleNewRound} style={buttonStyle}>New Hand</button>
      );
    }
    
    return null;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1 style={{ color: 'gold', textAlign: 'center', margin: '20px 0' }}>Blackjack Game</h1>
      
      <div style={{ 
        flex: 1,
        backgroundColor: '#076324', 
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.6)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Dealer area */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Dealer</h2>
          <Hand 
            cards={dealerCards} 
            isDealer={true} 
            hideValue={dealerCards.length > 0 && !dealerCards[0].faceUp} 
          />
        </div>
        
        {/* Game message */}
        <div style={{ 
          margin: '20px 0', 
          textAlign: 'center', 
          backgroundColor: 'rgba(0,0,0,0.3)', 
          padding: '10px', 
          borderRadius: '4px', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
        
        {/* Player area */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Player</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            {playerHands.map((hand, index) => (
              <div key={index} style={{ 
                position: 'relative',
                border: index === activeHandIndex && phase === GamePhase.PLAYER_TURN 
                  ? '2px solid gold' 
                  : 'none',
                padding: '5px',
                borderRadius: '5px'
              }}>
                <Hand cards={hand.cards} />
                {playerHands.length > 1 && (
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
        
        {/* Game controls */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          {phase === GamePhase.BETTING ? renderBettingControls() : renderGameControls()}
        </div>
        
        {/* Chips display */}
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
      </div>
    </div>
  );
};

export default App;