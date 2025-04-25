import React, { useState } from 'react';
import { Deck } from './models/Deck';
import { Card, GamePhase, GameResult, GameStats } from './models/types';
import { getBestHandValue, isBusted, isBlackjack, canSplit } from './utils/cardUtils';
import BettingControls from './components/BettingControls';
import GameControls from './components/GameControls';
import GameMessage from './components/GameMessage';
import ChipsDisplay from './components/ChipsDisplay';
import DealerArea from './components/DealerArea';
import PlayerArea from './components/PlayerArea';
import Statistics from './components/Statistics';
import GameOverModal from './components/GameOverModal';
import DeckCounter from './components/DeckCounter';
import Notification from './components/Notification';

const App: React.FC = () => {
  // Game state
  const [phase, setPhase] = useState<GamePhase>(GamePhase.BETTING);
  const [deck, setDeck] = useState<Deck>(new Deck());
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<{ cards: Card[], bet: number }[]>([{ cards: [], bet: 0 }]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [chips, setChips] = useState(100);
  const [message, setMessage] = useState('Place your bet to start the game');
  const [showStats, setShowStats] = useState(false);
  const [showBrokeModal, setShowBrokeModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  
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

  const handleResetGame = () => {
    // Reset the entire game
    setDeck(new Deck());
    setPlayerHands([{ cards: [], bet: 0 }]);
    setDealerCards([]);
    setActiveHandIndex(0);
    setChips(100);
    setPhase(GamePhase.BETTING);
    setMessage('Place your bet to start the game');
    setShowBrokeModal(false);
    
    // Optionally reset stats or keep them
    setStats({
      handsPlayed: 0,
      handsWon: 0,
      handsLost: 0,
      handsPushed: 0,
      blackjacks: 0,
      largestWin: 0,
      largestLoss: 0
    });
  };

  const handleGetLoan = () => {
    // Give the player more chips
    setChips(100);
    setShowBrokeModal(false);
    setMessage('Loan approved! Place your bet to continue.');
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  const handlePlaceBet = (betAmount: number) => {
  if (betAmount <= 0) return;
  
  // Create a new deck and shuffle it
  let newDeck: Deck;
  
  // Check if we need a new deck
  if (deck.count < 15) {
    newDeck = new Deck();
    showTemporaryNotification('Shuffling new deck...');
  } else {
    newDeck = new Deck();
    newDeck.cards = [...deck.cards];
  }
  
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

  // Handle double down action
  const handleDoubleDown = () => {
    if (phase !== GamePhase.PLAYER_TURN) return;
    
    const currentHand = playerHands[activeHandIndex];
    const currentBet = currentHand.bet;
    
    // Check if player can double down
    if (currentHand.cards.length !== 2 || chips < currentBet) {
      return;
    }
    
    // Double the bet
    const newPlayerHands = [...playerHands];
    newPlayerHands[activeHandIndex].bet = currentBet * 2;
    setPlayerHands(newPlayerHands);
    setChips(chips - currentBet);
    
    // Deal one more card
    const newDeck = new Deck();
    newDeck.cards = [...deck.cards];
    const newCard = newDeck.deal();
    
    if (!newCard) return;
    
    newPlayerHands[activeHandIndex].cards.push(newCard);
    setPlayerHands(newPlayerHands);
    setDeck(newDeck);
    
    // Automatically stand after double down
    if (isBusted(newPlayerHands[activeHandIndex].cards)) {
      if (activeHandIndex < playerHands.length - 1) {
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
          largestLoss: Math.max(prev.largestLoss, currentBet * 2)
        }));
      }
    } else if (activeHandIndex < playerHands.length - 1) {
      setActiveHandIndex(activeHandIndex + 1);
      setMessage(`Playing hand ${activeHandIndex + 2}...`);
    } else {
      handleDealerPlay(newDeck, newPlayerHands, dealerCards);
    }
  };
  
  // Handle split action
  const handleSplit = () => {
    if (phase !== GamePhase.PLAYER_TURN) return;
    
    const currentHand = playerHands[activeHandIndex];
    
    // Check if player can split
    if (!canSplit(currentHand.cards) || chips < currentHand.bet) {
      return;
    }
    
    // Create two new hands
    const newPlayerHands = [...playerHands];
    const hand1 = { 
      cards: [currentHand.cards[0]], 
      bet: currentHand.bet 
    };
    const hand2 = { 
      cards: [currentHand.cards[1]], 
      bet: currentHand.bet 
    };
    
    // Remove current hand and add the two new hands
    newPlayerHands.splice(activeHandIndex, 1, hand1, hand2);
    
    // Update chips
    setChips(chips - currentHand.bet);
    
    // Deal one more card to each hand
    const newDeck = new Deck();
    newDeck.cards = [...deck.cards];
    
    const card1 = newDeck.deal();
    const card2 = newDeck.deal();
    
    if (card1 && card2) {
      newPlayerHands[activeHandIndex].cards.push(card1);
      newPlayerHands[activeHandIndex + 1].cards.push(card2);
      
      setPlayerHands(newPlayerHands);
      setDeck(newDeck);
      
      // Check if splitting aces (special rule: only one card per ace)
      if (currentHand.cards[0].rank === 'A') {
        if (activeHandIndex < newPlayerHands.length - 1) {
          setActiveHandIndex(activeHandIndex + 1);
          setMessage(`Playing next hand...`);
        } else {
          handleDealerPlay(newDeck, newPlayerHands, dealerCards);
        }
      } else {
        setMessage('Cards split. Playing first hand...');
      }
    }
  };

  // Dealer's turn
  // Update the handleDealerPlay function in App.tsx

const handleDealerPlay = async (
  currentDeck: Deck, 
  currentPlayerHands: { cards: Card[], bet: number }[], 
  currentDealerCards: Card[]
) => {
  setPhase(GamePhase.DEALER_TURN);
  
  // Flip dealer's hidden card
  const newDealerCards = [...currentDealerCards];
  newDealerCards[0].faceUp = true;
  setDealerCards([...newDealerCards]);
  
  // Wait 1 second after flipping the card
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Dealer draws until 17 or higher
  let dealerValue = getBestHandValue(newDealerCards);
  
  const drawNextCard = async () => {
    if (dealerValue < 17) {
      const newCard = currentDeck.deal();
      if (!newCard) {
        evaluateResults(newDealerCards);
        return;
      }
      
      newDealerCards.push(newCard);
      setDealerCards([...newDealerCards]);
      
      dealerValue = getBestHandValue(newDealerCards);
      
      // Wait 1 second before drawing the next card
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recursively draw the next card if needed
      drawNextCard();
    } else {
      // Once dealer has 17 or more, evaluate results
      evaluateResults(newDealerCards);
    }
  };
  
  // Separate the evaluation logic for clarity
  const evaluateResults = (finalDealerCards: Card[]) => {
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
      const dealerValue = getBestHandValue(finalDealerCards);
      
      if (isBlackjack(hand.cards)) {
        if (isBlackjack(finalDealerCards)) {
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
      } else if (isBusted(finalDealerCards)) {
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
    
    // If multiple hands, provide a summary
    if (currentPlayerHands.length > 1) {
      const wins = newStats.handsWon - stats.handsWon;
      const pushes = newStats.handsPushed - stats.handsPushed;
      resultMessage = `Game over: ${wins} wins, ${pushes} pushes, ${currentPlayerHands.length - wins - pushes} losses`;
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
    
    // Check if player is broke
    if (newChips === 0) {
      setShowBrokeModal(true);
    }
  };
  
  // Start drawing cards
  drawNextCard();
};

  const showTemporaryNotification = (message: string) => {
  setNotificationMessage(message);
  setShowNotification(true);
  // The Notification component will automatically hide itself after the duration
};

  // Start new round
  const handleNewRound = () => {
  // Check if player is broke
  if (chips === 0) {
    setShowBrokeModal(true);
    return;
  }
  
  setPlayerHands([{ cards: [], bet: 0 }]);
  setDealerCards([]);
  setActiveHandIndex(0);
  setPhase(GamePhase.BETTING);
  setMessage('Place your bet to start the game');
  
  // Check if deck is running low
  if (deck.count < 15) {
    const newDeck = new Deck();
    setDeck(newDeck);
    showTemporaryNotification('Shuffling new deck...');
  }
};

  return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative'  // Add this to position the deck counter
  }}>
    <h1 style={{ color: 'gold', textAlign: 'center', margin: '20px 0' }}>Blackjack Game</h1>
    
    {/* Add the deck counter here */}
    <DeckCounter cardsRemaining={deck.count} />
    
    <div style={{ 
      flex: 1,
      backgroundColor: '#076324', 
      borderRadius: '8px',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.6)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <DealerArea cards={dealerCards} />
      
      <GameMessage message={message} />
      
      <PlayerArea 
        hands={playerHands} 
        activeHandIndex={activeHandIndex} 
        phase={phase} 
      />
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        {phase === GamePhase.BETTING ? (
          <BettingControls chips={chips} onPlaceBet={handlePlaceBet} />
        ) : (
          <GameControls 
            phase={phase}
            cards={playerHands[activeHandIndex]?.cards || []}
            chips={chips}
            currentBet={playerHands[activeHandIndex]?.bet || 0}
            onHit={handleHit} 
            onStand={handleStand}
            onDoubleDown={handleDoubleDown}
            onSplit={handleSplit}
            onNewRound={handleNewRound} 
          />
        )}
      </div>
      
      <ChipsDisplay chips={chips} />
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <button 
          onClick={toggleStats} 
          style={{ 
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          {showStats ? 'Hide Statistics' : 'Show Statistics'}
        </button>
      </div>
      
      <Statistics stats={stats} show={showStats} />
    </div>
    
    {showBrokeModal && <GameOverModal onReset={handleResetGame} onLoan={handleGetLoan} />}
    
    {/* Add the notification component */}
    {showNotification && (
      <Notification 
        message={notificationMessage} 
        onClose={() => setShowNotification(false)} 
      />
    )}
  </div>
);
};

export default App;