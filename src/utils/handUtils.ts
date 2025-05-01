import { Card } from '../models/types';
import { getBestHandValue } from './cardUtils';

export const isSoft17 = (cards: Card[]): boolean => {
  // Check if it's exactly 17
  if (getBestHandValue(cards) !== 17) return false;
  
  // Check if it contains an ace that's counted as 11
  const values = calculateAllHandValues(cards);
  return values.some(v => v === 17 && hasAceAs11(cards, v));
};

// Helper function to check if a hand has an Ace counted as 11
const hasAceAs11 = (cards: Card[], targetSum: number): boolean => {
  // If we can subtract 10 and still get a valid sum, it means
  // we have an Ace that's being counted as 11
  const aces = cards.filter(card => card.faceUp && card.rank === 'A');
  
  // Only proceed if we have at least one ace
  if (aces.length === 0) return false;
  
  // If the sum minus 10 (converting one Ace from 11 to 1) is valid,
  // then we have a soft hand
  return targetSum - 10 >= cards.length; // At minimum we need 1 point per card
};

// Calculate all possible hand values, ignoring the 21 limit
const calculateAllHandValues = (cards: Card[]): number[] => {
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

// Helper function to get card value
const getCardValue = (card: Card): number[] => {
  switch (card.rank) {
    case 'A':
      return [1, 11];
    case '2':
      return [2];
    case '3':
      return [3];
    case '4':
      return [4];
    case '5':
      return [5];
    case '6':
      return [6];
    case '7':
      return [7];
    case '8':
      return [8];
    case '9':
      return [9];
    case '10':
    case 'J':
    case 'Q':
    case 'K':
      return [10];
    default:
      return [0];
  }
};