import { Deck } from '../../models/Deck';
import { Card, Suit, Rank } from '../../models/Card';

describe('Deck', () => {
  test('should initialize with correct number of cards', () => {
    const singleDeck = new Deck();
    expect(singleDeck.count).toBe(52);
    
    const doubleDeck = new Deck(2);
    expect(doubleDeck.count).toBe(104);
  });
  
  test('should deal cards correctly', () => {
    const deck = new Deck();
    const initialCount = deck.count;
    
    const card1 = deck.deal();
    expect(card1).toBeDefined();
    expect(deck.count).toBe(initialCount - 1);
    
    const card2 = deck.deal(false);
    expect(card2).toBeDefined();
    expect(card2?.faceUp).toBe(false);
    expect(deck.count).toBe(initialCount - 2);
  });
  
  test('should shuffle cards', () => {
    const deck1 = new Deck();
    const deck2 = new Deck();
    
    // Both decks should be in the same initial order
    const initialCards1 = deck1.cards.map(card => card.toString());
    const initialCards2 = deck2.cards.map(card => card.toString());
    expect(initialCards1).toEqual(initialCards2);
    
    // Shuffle one deck
    deck1.shuffle();
    
    // Cards should now be in different order
    const shuffledCards1 = deck1.cards.map(card => card.toString());
    const stillInitialCards2 = deck2.cards.map(card => card.toString());
    
    // There's a tiny chance this could fail randomly, but it's very unlikely
    expect(shuffledCards1).not.toEqual(stillInitialCards2);
    
    // Both should still have the same number of cards
    expect(deck1.count).toBe(deck2.count);
  });
  
  test('should add cards back to the deck', () => {
    const deck = new Deck();
    const initialCount = deck.count;
    
    const card = deck.deal()!;
    expect(deck.count).toBe(initialCount - 1);
    
    deck.addCard(card);
    expect(deck.count).toBe(initialCount);
  });
});
