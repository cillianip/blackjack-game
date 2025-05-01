import { Card, Suit, Rank } from './types';

export class Deck {
  cards: Card[] = [];
  private _initialCardCount: number = 0;
  
  constructor(numDecks: number = 1) {
    this.initialize(numDecks);
  }
  
  initialize(numDecks: number = 1): void {
    this.cards = [];
    
    for (let d = 0; d < numDecks; d++) {
      for (const suit of Object.values(Suit)) {
        for (const rank of Object.values(Rank)) {
          this.cards.push({
            suit: suit as Suit,
            rank: rank as Rank,
            faceUp: true
          });
        }
      }
    }
    
    // Store the initial count for calculating when to shuffle
    this._initialCardCount = this.cards.length;
    
    this.shuffle();
  }
  
  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  
  deal(faceUp: boolean = true): Card | undefined {
    if (this.cards.length === 0) {
      return undefined;
    }
    
    const card = this.cards.pop()!;
    card.faceUp = faceUp;
    return card;
  }
  
  get count(): number {
    return this.cards.length;
  }
  
  get totalCardCount(): number {
    return this._initialCardCount;
  }
  
  get percentRemaining(): number {
    return (this.cards.length / this._initialCardCount) * 100;
  }
  
  shouldReshuffle(): boolean {
    // Reshuffle when fewer than 25% of cards remain
    return this.percentRemaining < 25;
  }
  
  addCard(card: Card): void {
    this.cards.push(card);
  }
}