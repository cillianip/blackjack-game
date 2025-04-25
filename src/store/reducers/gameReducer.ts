import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deck } from '../../models/Deck';
import { Hand } from '../../models/Hand';
import { Card, Suit, Rank } from '../../models/Card';

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

interface GameState {
  phase: GamePhase;
  deck: Deck;
  playerHands: Hand[];
  dealerHand: Hand;
  activeHandIndex: number;
  chips: number;
  currentBet: number;
  insuranceBet: number;
  hasInsurance: boolean;
  result: GameResult;
  message: string;
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  blackjacks: number;
  largestWin: number;
  largestLoss: number;
}

const initialState: GameState = {
  phase: GamePhase.BETTING,
  deck: new Deck(),
  playerHands: [new Hand()],
  dealerHand: new Hand(),
  activeHandIndex: 0,
  chips: 100,
  currentBet: 0,
  insuranceBet: 0,
  hasInsurance: false,
  result: GameResult.NONE,
  message: 'Place your bet to start the game',
  handsPlayed: 0,
  handsWon: 0,
  handsLost: 0,
  handsPushed: 0,
  blackjacks: 0,
  largestWin: 0,
  largestLoss: 0
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame(state) {
      state.deck = new Deck();
      state.deck.shuffle();
      state.playerHands = [new Hand()];
      state.dealerHand = new Hand();
      state.phase = GamePhase.BETTING;
      state.chips = 100;
      state.result = GameResult.NONE;
      state.message = 'Place your bet to start the game';
    },
    placeBet(state, action: PayloadAction<number>) {
      const bet = action.payload;
      if (state.phase === GamePhase.BETTING && bet <= state.chips) {
        state.currentBet = bet;
        state.chips -= bet;
        state.playerHands[0].bet = bet;
        state.message = 'Dealing cards...';
      }
    },
    dealCards(state) {
      if (state.phase !== GamePhase.BETTING || state.currentBet <= 0) {
        return;
      }
      
      // Deal initial cards
      state.playerHands[0].addCard(state.deck.deal(true)!);
      state.dealerHand.addCard(state.deck.deal(false)!);
      state.playerHands[0].addCard(state.deck.deal(true)!);
      state.dealerHand.addCard(state.deck.deal(true)!);
      
      state.phase = GamePhase.PLAYER_TURN;
      
      // Check for blackjack
      if (state.playerHands[0].isBlackjack()) {
        if (state.dealerHand.cards[1].rank === Rank.ACE || 
            state.dealerHand.cards[1].value[0] === 10) {
          // Check if dealer has blackjack too
          state.dealerHand.cards[0].faceUp = true;
          if (state.dealerHand.isBlackjack()) {
            state.result = GameResult.PUSH;
            state.chips += state.currentBet;
            state.message = 'Both have Blackjack! Push.';
            state.handsPushed++;
          } else {
            state.result = GameResult.BLACKJACK;
            state.chips += state.currentBet * 2.5;
            state.message = 'Blackjack! You win 3:2!';
            state.handsWon++;
            state.blackjacks++;
            
            const winAmount = state.currentBet * 1.5;
            if (winAmount > state.largestWin) {
              state.largestWin = winAmount;
            }
          }
          state.phase = GamePhase.GAME_OVER;
        } else {
          state.message = 'You have Blackjack! Dealer is checking...';
        }
      } else if (state.dealerHand.cards[1].rank === Rank.ACE) {
        state.message = 'Dealer shows an Ace. Insurance?';
        // Insurance logic would go here
      } else {
        state.message = 'Your turn. Hit or Stand?';
      }
    },
    hit(state) {
      if (state.phase !== GamePhase.PLAYER_TURN) {
        return;
      }
      
      const activeHand = state.playerHands[state.activeHandIndex];
      const card = state.deck.deal(true);
      
      if (card) {
        activeHand.addCard(card);
        
        if (activeHand.isBusted()) {
          state.message = 'Bust! You lose.';
          state.result = GameResult.LOSE;
          state.handsLost++;
          
          if (state.currentBet > state.largestLoss) {
            state.largestLoss = state.currentBet;
          }
          
          if (state.activeHandIndex < state.playerHands.length - 1) {
            // Move to next split hand if available
            state.activeHandIndex++;
            state.message = 'Playing next hand...';
          } else {
            state.phase = GamePhase.GAME_OVER;
          }
        } else {
          state.message = 'Hit or Stand?';
        }
      }
    },
    stand(state) {
      if (state.phase !== GamePhase.PLAYER_TURN) {
        return;
      }
      
      if (state.activeHandIndex < state.playerHands.length - 1) {
        // Move to next split hand if available
        state.activeHandIndex++;
        state.message = 'Playing next hand...';
      } else {
        state.phase = GamePhase.DEALER_TURN;
        state.message = 'Dealer\'s turn...';
        
        // Reveal dealer's hidden card
        state.dealerHand.cards[0].faceUp = true;
        
        // Dealer plays until reaching 17 or higher
        while (state.dealerHand.getBestValue() < 17) {
          const card = state.deck.deal(true);
          if (card) {
            state.dealerHand.addCard(card);
          }
        }
        
        // Evaluate results
        for (let i = 0; i < state.playerHands.length; i++) {
          const playerHand = state.playerHands[i];
          
          if (playerHand.isBusted()) {
            continue; // Already handled
          }
          
          state.handsPlayed++;
          
          if (state.dealerHand.isBusted()) {
            state.result = GameResult.WIN;
            state.chips += playerHand.bet * 2;
            state.message = 'Dealer busts! You win!';
            state.handsWon++;
            
            if (playerHand.bet > state.largestWin) {
              state.largestWin = playerHand.bet;
            }
          } else {
            const playerValue = playerHand.getBestValue();
            const dealerValue = state.dealerHand.getBestValue();
            
            if (playerValue > dealerValue) {
              state.result = GameResult.WIN;
              state.chips += playerHand.bet * 2;
              state.message = 'You win!';
              state.handsWon++;
              
              if (playerHand.bet > state.largestWin) {
                state.largestWin = playerHand.bet;
              }
            } else if (playerValue < dealerValue) {
              state.result = GameResult.LOSE;
              state.message = 'Dealer wins!';
              state.handsLost++;
              
              if (playerHand.bet > state.largestLoss) {
                state.largestLoss = playerHand.bet;
              }
            } else {
              state.result = GameResult.PUSH;
              state.chips += playerHand.bet;
              state.message = 'Push!';
              state.handsPushed++;
            }
          }
        }
        
        state.phase = GamePhase.GAME_OVER;
      }
    },
    doubleDown(state) {
      if (state.phase !== GamePhase.PLAYER_TURN) {
        return;
      }
      
      const activeHand = state.playerHands[state.activeHandIndex];
      
      if (!activeHand.canDoubleDown() || state.chips < activeHand.bet) {
        return;
      }
      
      // Double the bet
      state.chips -= activeHand.bet;
      state.currentBet += activeHand.bet;
      activeHand.bet *= 2;
      
      // Deal one more card
      const card = state.deck.deal(true);
      if (card) {
        activeHand.addCard(card);
      }
      
      if (activeHand.isBusted()) {
        state.message = 'Bust! You lose.';
        state.result = GameResult.LOSE;
        state.handsLost++;
        
        if (activeHand.bet > state.largestLoss) {
          state.largestLoss = activeHand.bet;
        }
      }
      
      // Move to next hand or dealer turn
      if (state.activeHandIndex < state.playerHands.length - 1) {
        state.activeHandIndex++;
        state.message = 'Playing next hand...';
      } else {
        // Trigger stand logic to move to dealer turn
        state.phase = GamePhase.DEALER_TURN;
        state.message = 'Dealer\'s turn...';
        
        // Reveal dealer's hidden card
        state.dealerHand.cards[0].faceUp = true;
        
        // Dealer plays until reaching 17 or higher
        while (state.dealerHand.getBestValue() < 17) {
          const card = state.deck.deal(true);
          if (card) {
            state.dealerHand.addCard(card);
          }
        }
        
        // Evaluate results (same logic as in stand)
        // ...evaluation logic same as stand...
        for (let i = 0; i < state.playerHands.length; i++) {
          const playerHand = state.playerHands[i];
          
          if (playerHand.isBusted()) {
            continue; // Already handled
          }
          
          state.handsPlayed++;
          
          if (state.dealerHand.isBusted()) {
            state.result = GameResult.WIN;
            state.chips += playerHand.bet * 2;
            state.message = 'Dealer busts! You win!';
            state.handsWon++;
            
            if (playerHand.bet > state.largestWin) {
              state.largestWin = playerHand.bet;
            }
          } else {
            const playerValue = playerHand.getBestValue();
            const dealerValue = state.dealerHand.getBestValue();
            
            if (playerValue > dealerValue) {
              state.result = GameResult.WIN;
              state.chips += playerHand.bet * 2;
              state.message = 'You win!';
              state.handsWon++;
              
              if (playerHand.bet > state.largestWin) {
                state.largestWin = playerHand.bet;
              }
            } else if (playerValue < dealerValue) {
              state.result = GameResult.LOSE;
              state.message = 'Dealer wins!';
              state.handsLost++;
              
              if (playerHand.bet > state.largestLoss) {
                state.largestLoss = playerHand.bet;
              }
            } else {
              state.result = GameResult.PUSH;
              state.chips += playerHand.bet;
              state.message = 'Push!';
              state.handsPushed++;
            }
          }
        }
        
        state.phase = GamePhase.GAME_OVER;
      }
    },
    split(state) {
      if (state.phase !== GamePhase.PLAYER_TURN) {
        return;
      }
      
      const activeHand = state.playerHands[state.activeHandIndex];
      
      if (!activeHand.canSplit() || state.chips < activeHand.bet) {
        return;
      }
      
      // Create new hand with the second card
      const newHand = new Hand(activeHand.bet);
      newHand.addCard(activeHand.cards[1]);
      
      // Remove second card from current hand
      activeHand.cards.pop();
      
      // Add new hand to player hands
      state.playerHands.splice(state.activeHandIndex + 1, 0, newHand);
      
      // Deduct chips for the new bet
      state.chips -= activeHand.bet;
      state.currentBet += activeHand.bet;
      
      // Deal a card to each hand
      const card1 = state.deck.deal(true);
      const card2 = state.deck.deal(true);
      
      if (card1) {
        activeHand.addCard(card1);
      }
      
      if (card2) {
        newHand.addCard(card2);
      }
      
      state.message = 'Cards split. Playing first hand...';
      
      // Special rule for split aces
      if (activeHand.cards[0].rank === Rank.ACE) {
        // Only one card per ace
        if (state.activeHandIndex < state.playerHands.length - 1) {
          state.activeHandIndex++;
          state.message = 'Playing next hand...';
        } else {
          // Trigger stand logic
          state.phase = GamePhase.DEALER_TURN;
          // ... rest of dealer logic ...
        }
      }
    },
    newRound(state) {
      if (state.phase !== GamePhase.GAME_OVER) {
        return;
      }
      
      // Reset for new round
      state.playerHands = [new Hand()];
      state.dealerHand = new Hand();
      state.activeHandIndex = 0;
      state.currentBet = 0;
      state.insuranceBet = 0;
      state.hasInsurance = false;
      state.result = GameResult.NONE;
      state.phase = GamePhase.BETTING;
      state.message = 'Place your bet to start the game';
      
      // If deck is running low, create and shuffle a new one
      if (state.deck.count < 15) {
        state.deck = new Deck();
        state.deck.shuffle();
      }
    }
  }
});

export const { 
  startGame, 
  placeBet, 
  dealCards, 
  hit, 
  stand, 
  doubleDown, 
  split, 
  newRound 
} = gameSlice.actions;
export default gameSlice.reducer;
