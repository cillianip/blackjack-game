import React, { useState, useEffect } from 'react';
import { Deck } from './models/Deck';
import { Card, GamePhase, GameStats } from './models/types';
import { getBestHandValue, isBusted, isBlackjack, canSplit } from './utils/cardUtils';
import { isSoft17 } from './utils/handUtils';
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
import SettingsIcon from './components/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import useSoundEffects from './hooks/useSoundEffects';
import { SoundEffect } from './utils/soundManager';

const App: React.FC = () => {
  // Game state
  const [phase, setPhase] = useState<GamePhase>(GamePhase.BETTING);
  const [deckCount, setDeckCount] = useState<number>(1);
  const [deck, setDeck] = useState<Deck>(new Deck(deckCount));
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<{ cards: Card[], bet: number }[]>([{ cards: [], bet: 0 }]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [chips, setChips] = useState(100);
  const [message, setMessage] = useState('Place your bet to start the game');
  const [showStats, setShowStats] = useState(false);
  const [showBrokeModal, setShowBrokeModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [dealerHitSoft17, setDealerHitSoft17] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  // Initialize sound effects
  const { playSound } = useSoundEffects(soundEnabled);
  
  // Unlock audio on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      console.log("User interaction detected - unlocking audio");
      
      // Create and play a silent audio clip to unlock audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const silentBuffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      // Add a specific debug sound to test audio
      const testSound = new Audio('/blackjack-game/sounds/click.mp3');
      testSound.volume = 0.1;
      testSound.play()
        .then(() => console.log("Test sound played successfully!"))
        .catch(err => {
          console.error("Test sound failed:", err);
          // Try alternate path if first attempt failed
          const altTestSound = new Audio('./sounds/click.mp3');
          altTestSound.volume = 0.1;
          altTestSound.play()
            .then(() => console.log("Alt test sound played successfully!"))
            .catch(altErr => console.error("Alt test sound also failed:", altErr));
        });
      
      // Mark audio as unlocked
      setAudioUnlocked(true);
      
      // Remove event listeners after unlock
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    
    // Add event listeners to unlock audio on user interaction
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    
    // Clean up listeners on component unmount
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  
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
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const handleToggleDealerHitSoft17 = () => {
    setDealerHitSoft17(!dealerHitSoft17);
    playSound(SoundEffect.BUTTON_CLICK);
  };
  
  const handleDeckCountChange = (count: number) => {
    setDeckCount(count);
    // Don't immediately create a new deck - wait until the next deal
    // to avoid disrupting the current game
    showTemporaryNotification(`Deck count set to ${count}. Will take effect on next shuffle.`);
    playSound(SoundEffect.BUTTON_CLICK);
  };
  
  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handlePlaceBet = (betAmount: number) => {
  if (betAmount <= 0) return;
  
  // Create a new deck and shuffle it
  let newDeck: Deck;
  
  // Check if we need a new deck
  if (deck.shouldReshuffle()) {
    // Create fresh deck with the current deck count setting
    newDeck = new Deck(deckCount);
    showTemporaryNotification(`Shuffling new ${deckCount}-deck shoe...`);
    playSound(SoundEffect.CARD_SHUFFLE);
  } else {
    // Continue with existing deck
    newDeck = new Deck(deckCount);
    newDeck.cards = [...deck.cards];
  }
  
  // Deal initial cards
  playSound(SoundEffect.CARD_DEAL);
  const newPlayerCards = [newDeck.deal()!, newDeck.deal()!];
  const newDealerCards = [
    { ...newDeck.deal()!, faceUp: false },
    newDeck.deal()!
  ];
  
  // Play card deal sounds with slight delay
  setTimeout(() => playSound(SoundEffect.CARD_DEAL), 200);
  
  setDeck(newDeck);
  setPlayerHands([{ cards: newPlayerCards, bet: betAmount }]);
  setDealerCards(newDealerCards);
  setChips(chips - betAmount);
  setPhase(GamePhase.PLAYER_TURN);
  
  const playerHasBlackjack = isBlackjack(newPlayerCards);
  
  const dealerCards = [...newDealerCards];
  dealerCards[0].faceUp = true;
  const dealerHasBlackjack = isBlackjack(dealerCards);
  
  newDealerCards[0].faceUp = false;
  
  if (playerHasBlackjack || dealerHasBlackjack) {
    if (playerHasBlackjack && dealerHasBlackjack) {
      // Both have blackjack - it's a push
      setMessage('Both have Blackjack! Push.');
      playSound(SoundEffect.PUSH);
      setChips(chips + betAmount); // Return the bet
    } else if (playerHasBlackjack) {
      setMessage('Blackjack! You win 3:2!');
      playSound(SoundEffect.BLACKJACK);
      const winAmount = Math.floor(betAmount * 1.5);
      setChips(chips + betAmount + winAmount); // Return bet + winnings
    } else {
      setMessage('Dealer has Blackjack! You lose.');
      playSound(SoundEffect.LOSE);
    }
    
    // Flip dealer's card to show blackjack
    newDealerCards[0].faceUp = true;
    setDealerCards([...newDealerCards]);
    
    setPhase(GamePhase.GAME_OVER);
    
    // Update stats
    setStats(prev => {
      const newStats = { ...prev, handsPlayed: prev.handsPlayed + 1 };
      
      if (playerHasBlackjack && dealerHasBlackjack) {
        newStats.handsPushed = prev.handsPushed + 1;
      } else if (playerHasBlackjack) {
        // Player wins with blackjack
        newStats.handsWon = prev.handsWon + 1;
        newStats.blackjacks = prev.blackjacks + 1;
        newStats.largestWin = Math.max(prev.largestWin, Math.floor(betAmount * 1.5));
      } else {
        // Dealer wins with blackjack
        newStats.handsLost = prev.handsLost + 1;
        newStats.largestLoss = Math.max(prev.largestLoss, betAmount);
      }
      
      return newStats;
    });
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
    
    // Play card dealing sound
    playSound(SoundEffect.CARD_DEAL);
    
    const newPlayerHands = [...playerHands];
    newPlayerHands[activeHandIndex].cards.push(newCard);
    
    setPlayerHands(newPlayerHands);
    setDeck(newDeck);
    
    if (isBusted(newPlayerHands[activeHandIndex].cards)) {
      // Play bust sound
      playSound(SoundEffect.LOSE);
      
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
    
    // Play button click sound
    playSound(SoundEffect.BUTTON_CLICK);
    
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
  
  // Play card flip sound
  playSound(SoundEffect.CARD_FLIP);
  
  // Wait 1 second after flipping the card
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Dealer draws until 17 or higher (or soft 17 if that option is enabled)
  let dealerValue = getBestHandValue(newDealerCards);
  
  const drawNextCard = async () => {
    if (dealerValue < 17 || (dealerHitSoft17 && dealerValue === 17 && isSoft17(newDealerCards))) {
      const newCard = currentDeck.deal();
      if (!newCard) {
        evaluateResults(newDealerCards);
        return;
      }
      
      // Play card dealing sound
      playSound(SoundEffect.CARD_DEAL);
      
      newDealerCards.push(newCard);
      setDealerCards([...newDealerCards]);
      
      dealerValue = getBestHandValue(newDealerCards);
      
      // Wait 1 second before drawing the next card
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recursively draw the next card if needed
      drawNextCard();
    } else {
      // Once dealer has appropriate value, evaluate results
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
          playSound(SoundEffect.PUSH);
        } else {
          // Player has blackjack - win 3:2
          newStats.handsWon++;
          newStats.blackjacks++;
          const winAmount = Math.floor(hand.bet * 1.5);
          totalWinAmount += winAmount;
          newChips += hand.bet + winAmount;
          resultMessage = 'Blackjack! You win 3:2!';
          playSound(SoundEffect.BLACKJACK);
        }
      } else if (isBusted(finalDealerCards)) {
        // Dealer busts - player wins
        newStats.handsWon++;
        totalWinAmount += hand.bet;
        newChips += hand.bet * 2; // Original bet + winnings
        resultMessage = 'Dealer busts! You win!';
        playSound(SoundEffect.WIN);
      } else if (playerValue > dealerValue) {
        // Player has higher value - win
        newStats.handsWon++;
        totalWinAmount += hand.bet;
        newChips += hand.bet * 2; // Original bet + winnings
        resultMessage = 'You win!';
        playSound(SoundEffect.WIN);
      } else if (playerValue < dealerValue) {
        // Dealer has higher value - lose
        newStats.handsLost++;
        totalLossAmount += hand.bet;
        resultMessage = 'Dealer wins!';
        playSound(SoundEffect.LOSE);
      } else {
        // Same value - push
        newStats.handsPushed++;
        newChips += hand.bet; // Return bet
        resultMessage = 'Push!';
        playSound(SoundEffect.PUSH);
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
    
    // Check if player is broke or has less than minimum bet
    if (newChips < 5) {
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
  // Check if player is broke or has less than minimum bet
  if (chips < 5) {
    setShowBrokeModal(true);
    return;
  }
  
  setPlayerHands([{ cards: [], bet: 0 }]);
  setDealerCards([]);
  setActiveHandIndex(0);
  setPhase(GamePhase.BETTING);
  setMessage('Place your bet to start the game');
  
  // Check if deck is running low
  if (deck.shouldReshuffle()) {
    const newDeck = new Deck(deckCount);
    setDeck(newDeck);
    showTemporaryNotification(`Shuffling new ${deckCount}-deck shoe...`);
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      margin: '20px 0'
    }}>
      <div style={{ width: '40px' }} /> {/* Spacer for alignment */}
      <h1 style={{ color: 'gold', textAlign: 'center', margin: 0 }}>Blackjack Game</h1>
      <div 
        style={{ 
          width: '40px', 
          height: '40px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: 'pointer',
          color: 'white' 
        }}
      >
        <SettingsIcon onClick={toggleSettings} />
      </div>
    </div>
    
    {/* Add the deck counter here */}
    <DeckCounter cardsRemaining={deck.count} totalCards={deck.totalCardCount} />
    
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
    
    {/* Add the settings modal */}
    <SettingsModal 
      isOpen={showSettings} 
      onClose={toggleSettings} 
      dealerHitSoft17={dealerHitSoft17}
      onToggleDealerHitSoft17={handleToggleDealerHitSoft17}
      deckCount={deckCount}
      onDeckCountChange={handleDeckCountChange}
      soundEnabled={soundEnabled}
      onToggleSound={handleToggleSound}
    />
    
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
