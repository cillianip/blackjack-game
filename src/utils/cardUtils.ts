import { Card, Rank, Suit } from '../models/types';

export const getCardValue = (card: Card): number[] => {
  switch (card.rank) {
    case Rank.ACE:
      return [1, 11];
    case Rank.TWO:
      return [2];
    case Rank.THREE:
      return [3];
    case Rank.FOUR:
      return [4];
    case Rank.FIVE:
      return [5];
    case Rank.SIX:
      return [6];
    case Rank.SEVEN:
      return [7];
    case Rank.EIGHT:
      return [8];
    case Rank.NINE:
      return [9];
    case Rank.TEN:
    case Rank.JACK:
    case Rank.QUEEN:
    case Rank.KING:
      return [10];
    default:
      return [0];
  }
};

export const getCardColor = (card: Card): string => {
  return (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) ? 'red' : 'black';
};

export const calculateHandValue = (cards: Card[]): number[] => {
  if (cards.length === 0) {
    return [0];
  }
  
  // Start with [0] as our only sum
  let sums: number[] = [0];
  
  // For each card, compute all possible new sums
  for (const card of cards) {
    if (!card.faceUp) {
      continue; // Skip face down cards
    }
    
    const cardValues = getCardValue(card);
    const newSums: number[] = [];
    
    // For each existing sum, add each possible card value
    for (const sum of sums) {
      for (const value of cardValues) {
        newSums.push(sum + value);
      }
    }
    
    sums = newSums;
  }
  
  return sums;
};

export const getBestHandValue = (cards: Card[]): number => {
  const values = calculateHandValue(cards);
  
  // Filter values that are <= 21
  const validValues = values.filter(v => v <= 21);
  
  if (validValues.length === 0) {
    // All values bust, return the lowest value
    return Math.min(...values);
  }
  
  // Return the highest valid value
  return Math.max(...validValues);
};

export const isBusted = (cards: Card[]): boolean => {
  return getBestHandValue(cards) > 21;
};

export const isBlackjack = (cards: Card[]): boolean => {
  return (
    cards.length === 2 &&
    getBestHandValue(cards) === 21
  );
};

export const canSplit = (cards: Card[]): boolean => {
  if (cards.length !== 2) return false;
  
  const value1 = getCardValue(cards[0])[0];
  const value2 = getCardValue(cards[1])[0];
  
  return value1 === value2;
};

export const canDoubleDown = (cards: Card[]): boolean => {
  return cards.length === 2;
};