import { Card, Suit, Rank } from '../../models/Card';

describe('Card', () => {
  test('should create a card with correct properties', () => {
    const card = new Card(Suit.HEARTS, Rank.ACE);
    
    expect(card.suit).toBe(Suit.HEARTS);
    expect(card.rank).toBe(Rank.ACE);
    expect(card.faceUp).toBe(true);
    expect(card.color).toBe('red');
  });
  
  test('should return correct values for different ranks', () => {
    const aceCard = new Card(Suit.HEARTS, Rank.ACE);
    const twoCard = new Card(Suit.SPADES, Rank.TWO);
    const kingCard = new Card(Suit.CLUBS, Rank.KING);
    
    expect(aceCard.value).toEqual([1, 11]);
    expect(twoCard.value).toEqual([2]);
    expect(kingCard.value).toEqual([10]);
  });
  
  test('should flip card correctly', () => {
    const card = new Card(Suit.DIAMONDS, Rank.SEVEN, false);
    
    expect(card.faceUp).toBe(false);
    
    card.flip();
    expect(card.faceUp).toBe(true);
    
    card.flip();
    expect(card.faceUp).toBe(false);
  });
  
  test('should convert to string correctly', () => {
    const card = new Card(Suit.CLUBS, Rank.QUEEN);
    
    expect(card.toString()).toBe('Q of clubs');
  });
});
