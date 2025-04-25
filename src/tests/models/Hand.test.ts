import { Hand } from '../../models/Hand';
import { Card, Suit, Rank } from '../../models/Card';

describe('Hand', () => {
  test('should calculate correct hand values', () => {
    const hand = new Hand();
    
    // Empty hand
    expect(hand.getValues()).toEqual([0]);
    expect(hand.getBestValue()).toBe(0);
    
    // Add a card
    hand.addCard(new Card(Suit.HEARTS, Rank.SEVEN));
    expect(hand.getValues()).toEqual([7]);
    expect(hand.getBestValue()).toBe(7);
    
    // Add another card
    hand.addCard(new Card(Suit.CLUBS, Rank.KING));
    expect(hand.getValues()).toEqual([17]);
    expect(hand.getBestValue()).toBe(17);
    
    // Test with Ace
    const aceHand = new Hand();
    aceHand.addCard(new Card(Suit.SPADES, Rank.ACE));
    expect(aceHand.getValues()).toEqual([1, 11]);
    expect(aceHand.getBestValue()).toBe(11);
    
    // Add a 10 to make blackjack
    aceHand.addCard(new Card(Suit.HEARTS, Rank.TEN));
    expect(aceHand.getValues()).toEqual([11, 21]);
    expect(aceHand.getBestValue()).toBe(21);
    expect(aceHand.isBlackjack()).toBe(true);
    
    // Test busting
    const bustHand = new Hand();
    bustHand.addCard(new Card(Suit.HEARTS, Rank.TEN));
    bustHand.addCard(new Card(Suit.DIAMONDS, Rank.KING));
    bustHand.addCard(new Card(Suit.CLUBS, Rank.FIVE));
    
    expect(bustHand.getValues()).toEqual([25]);
    expect(bustHand.getBestValue()).toBe(25);
    expect(bustHand.isBusted()).toBe(true);
  });
  
  test('should detect blackjack correctly', () => {
    const blackjackHand = new Hand();
    blackjackHand.addCard(new Card(Suit.HEARTS, Rank.ACE));
    blackjackHand.addCard(new Card(Suit.SPADES, Rank.KING));
    
    expect(blackjackHand.isBlackjack()).toBe(true);
    
    const notBlackjackHand = new Hand();
    notBlackjackHand.addCard(new Card(Suit.HEARTS, Rank.FIVE));
    notBlackjackHand.addCard(new Card(Suit.SPADES, Rank.SIX));
    notBlackjackHand.addCard(new Card(Suit.CLUBS, Rank.TEN));
    
    expect(notBlackjackHand.getBestValue()).toBe(21);
    expect(notBlackjackHand.isBlackjack()).toBe(false);
  });
  
  test('should handle soft hands correctly', () => {
    const softHand = new Hand();
    softHand.addCard(new Card(Suit.DIAMONDS, Rank.ACE));
    softHand.addCard(new Card(Suit.CLUBS, Rank.FOUR));
    
    expect(softHand.getValues()).toEqual([5, 15]);
    expect(softHand.getBestValue()).toBe(15);
    expect(softHand.isSoft()).toBe(true);
    
    // Add another card to make it no longer soft
    softHand.addCard(new Card(Suit.HEARTS, Rank.SEVEN));
    expect(softHand.getValues()).toEqual([12, 22]);
    expect(softHand.getBestValue()).toBe(12);
    expect(softHand.isSoft()).toBe(true); // Still has an Ace, but now counted as 1
    
    const hardHand = new Hand();
    hardHand.addCard(new Card(Suit.CLUBS, Rank.TEN));
    hardHand.addCard(new Card(Suit.SPADES, Rank.SEVEN));
    
    expect(hardHand.getValues()).toEqual([17]);
    expect(hardHand.getBestValue()).toBe(17);
    expect(hardHand.isSoft()).toBe(false);
  });
  
  test('should determine if hand can split', () => {
    const pairOfTens = new Hand();
    pairOfTens.addCard(new Card(Suit.HEARTS, Rank.TEN));
    pairOfTens.addCard(new Card(Suit.SPADES, Rank.TEN));
    
    expect(pairOfTens.canSplit()).toBe(true);
    
    const pairOfFaceCards = new Hand();
    pairOfFaceCards.addCard(new Card(Suit.HEARTS, Rank.KING));
    pairOfFaceCards.addCard(new Card(Suit.SPADES, Rank.QUEEN));
    
    expect(pairOfFaceCards.canSplit()).toBe(true); // Both are 10 value
    
    const mixedHand = new Hand();
    mixedHand.addCard(new Card(Suit.HEARTS, Rank.NINE));
    mixedHand.addCard(new Card(Suit.SPADES, Rank.TEN));
    
    expect(mixedHand.canSplit()).toBe(false);
  });
});
