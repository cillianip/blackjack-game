# Blackjack Web Application: Technical Documentation

## Overview

This document provides a comprehensive explanation of the Blackjack web application implementation. The application is built using React with TypeScript and follows a component-based architecture that separates concerns for better maintainability and scalability.

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: React Hooks (useState)
- **Styling**: Inline CSS for simplicity
- **Build Tool**: Vite

## Project Structure

The application follows a modular structure with clear separation of concerns:

```
src/
├── components/       # UI components
├── models/           # Data models and types
├── utils/            # Helper functions
├── App.tsx           # Main application component
└── main.tsx          # Entry point
```

## Core Models

### Card Model

The Card model represents a playing card with suit, rank, and face-up status properties.

```typescript
// src/models/types.ts
export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠'
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  // ... other ranks
  KING = 'K'
}

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}
```

### Deck Model

The Deck class manages a collection of cards with methods for initialization, shuffling, and dealing.

```typescript
// src/models/Deck.ts
export class Deck {
  cards: Card[] = [];
  
  constructor(numDecks: number = 1) {
    this.initialize(numDecks);
  }
  
  initialize(numDecks: number = 1): void {
    // Creates a standard 52-card deck, multiplied by numDecks
  }
  
  shuffle(): void {
    // Fisher-Yates shuffle algorithm implementation
  }
  
  deal(faceUp: boolean = true): Card | undefined {
    // Deal a card from the deck
  }
  
  get count(): number {
    return this.cards.length;
  }
}
```

### Game State Models

The application tracks game state using TypeScript enums and interfaces:

```typescript
// src/models/types.ts
export enum GamePhase {
  BETTING = 'betting',
  PLAYER_TURN = 'playerTurn',
  DEALER_TURN = 'dealerTurn',
  GAME_OVER = 'gameOver'
}

export enum GameResult {
  NONE = 'none',
  WIN = 'win',
  LOSE = 'lose',
  PUSH = 'push',
  BLACKJACK = 'blackjack'
}

export interface GameStats {
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  blackjacks: number;
  largestWin: number;
  largestLoss: number;
}
```

## Key Components

### CardComponent

Renders a single playing card with appropriate styling based on suit and face-up status.

```typescript
// src/components/Card.tsx
const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  if (!card.faceUp) {
    return <div className="card face-down">...</div>;
  }

  return (
    <div className={`card ${getCardColor(card)}`}>
      // Card display logic
    </div>
  );
};
```

### HandComponent

Displays a collection of cards with their calculated value, detecting blackjack and busted states.

```typescript
// src/components/Hand.tsx
const Hand: React.FC<{ 
  cards: Card[], 
  isDealer?: boolean,
  hideValue?: boolean 
}> = ({ cards, isDealer, hideValue }) => {
  const handValue = getBestHandValue(cards);
  const busted = isBusted(cards);
  const blackjack = isBlackjack(cards);

  return (
    <div>
      <div className="cards-container">
        {cards.map((card, index) => (
          <CardComponent key={index} card={card} />
        ))}
      </div>
      
      {/* Hand value display logic */}
    </div>
  );
};
```

### Game Controls

The application provides context-specific controls based on the current game phase:

- **BettingControls**: Allows the player to place bets before a hand starts
- **GameControls**: Provides actions during play (Hit, Stand, Double Down, Split)
- **GameOverModal**: Appears when the player runs out of chips, offering reset or loan options

## Game Logic

### Card Evaluation

The utility functions handle the complex logic of evaluating blackjack hands:

```typescript
// src/utils/cardUtils.ts
export const calculateHandValue = (cards: Card[]): number[] => {
  // Calculate all possible hand values, accounting for Aces
};

export const getBestHandValue = (cards: Card[]): number => {
  // Get the highest non-busting value, or lowest value if all bust
};

export const isBusted = (cards: Card[]): boolean => {
  // Check if hand value exceeds 21
};

export const isBlackjack = (cards: Card[]): boolean => {
  // Check for blackjack (Ace + 10-value card as first two cards)
};
```

### Game Flow

The main App component orchestrates the game flow through state management:

1. **Betting Phase**:
   - Player selects a bet amount
   - App validates the bet and deducts from chips
   - Initial cards are dealt to player and dealer

2. **Player Turn Phase**:
   - Player can Hit, Stand, Double Down, or Split (when applicable)
   - Busts are checked after each hit
   - Multiple hands are handled sequentially after splits

3. **Dealer Turn Phase**:
   - Dealer's hole card is revealed
   - Dealer draws cards according to rules (hit on 16 or less, stand on 17+)

4. **Game Over Phase**:
   - Hand outcomes are determined (win, lose, push, blackjack)
   - Statistics are updated
   - Winnings are added to player's chips
   - Player can start a new round

### Advanced Rules

The game implements advanced blackjack rules:

1. **Blackjack Payout**: Pays 3:2 on a natural blackjack
2. **Double Down**: Double bet and receive exactly one more card
3. **Splitting Pairs**: Separate a pair into two hands, with an equal bet on each
4. **Splitting Aces**: Special rule - only one additional card per ace

## State Management

The App component manages game state using React's useState hooks:

```typescript
// Core game state
const [phase, setPhase] = useState<GamePhase>(GamePhase.BETTING);
const [deck, setDeck] = useState<Deck>(new Deck());
const [dealerCards, setDealerCards] = useState<Card[]>([]);
const [playerHands, setPlayerHands] = useState<{ cards: Card[], bet: number }[]>(
  [{ cards: [], bet: 0 }]
);
const [activeHandIndex, setActiveHandIndex] = useState(0);
const [chips, setChips] = useState(100);
```

### Handler Functions

The App component includes handler functions for all game actions:

- `handlePlaceBet`: Places a bet and deals initial cards
- `handleHit`: Draws an additional card for the current hand
- `handleStand`: Ends the player's turn for the current hand
- `handleDoubleDown`: Doubles the bet and deals one final card
- `handleSplit`: Splits a pair into two separate hands
- `handleDealerPlay`: Executes the dealer's turn according to rules
- `handleNewRound`: Prepares the game for a new hand

## Edge Cases and Special Features

### Handling Zero Chips

When a player runs out of chips, the application prevents a deadlock by:
1. Detecting the zero chip state
2. Showing a GameOverModal with options
3. Allowing the player to either reset the game or get a virtual loan

```typescript
// In handleDealerPlay and handleNewRound:
if (newChips === 0) {
  setShowBrokeModal(true);
}
```

### Multiple Hands from Splitting

The application supports playing multiple hands after splitting:
1. Tracks the active hand index
2. Maintains separate bets for each hand
3. Processes hands sequentially
4. Provides visual indication of the active hand

### Statistical Tracking

The application maintains statistics for the player:
- Hands played, won, lost, and pushed
- Number of blackjacks achieved
- Largest win and loss amounts
- Win percentage calculation

## Rendering and UI

The App's render method composes the UI from component pieces:

```jsx
return (
  <div className="blackjack-app">
    <h1>Blackjack Game</h1>
    
    <div className="game-table">
      <DealerArea cards={dealerCards} />
      
      <GameMessage message={message} />
      
      <PlayerArea 
        hands={playerHands} 
        activeHandIndex={activeHandIndex} 
        phase={phase} 
      />
      
      {/* Controls based on game phase */}
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
      
      <ChipsDisplay chips={chips} />
      
      {/* Statistics toggle and display */}
      
      {/* Game over modal when broke */}
      {showBrokeModal && <GameOverModal onReset={handleResetGame} onLoan={handleGetLoan} />}
    </div>
  </div>
);
```

## Conclusion

This Blackjack web application demonstrates a structured approach to building complex interactive applications with React and TypeScript. By breaking down the implementation into manageable components with clear responsibilities, the codebase remains maintainable while providing a comprehensive implementation of Blackjack game rules.

The application showcases:
- Component-based UI architecture
- Robust game state management
- Implementation of complex game rules
- Handling of edge cases

## Future Enhancements

Potential areas for enhancement include:
1. Adding persistent storage for game statistics
2. Implementing animations for card dealing and actions
3. Adding sound effects for game events
4. Supporting additional Blackjack rule variations
5. Implementing a tutorial mode for new players
