export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠'
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K'
}

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

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

export interface Hand {
  cards: Card[];
  bet: number;
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