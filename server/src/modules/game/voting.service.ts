import { Injectable } from '@nestjs/common';
import { DeckType } from '@prisma/client';

export interface FibonacciResult {
  type: 'fibonacci';
  average: number;
  roundedAverage: number; // Rounded to nearest Fibonacci number
  votes: number[];
  distribution: Record<number, number>;
  isConsensus: boolean;
  consensusValue?: number;
  totalVotes: number;
  skippedVotes: number; // ? and coffee votes
}

export interface TShirtResult {
  type: 'tshirt';
  mode: string;
  modeCount: number;
  distribution: Record<string, number>;
  isConsensus: boolean;
  consensusValue?: string;
  totalVotes: number;
  skippedVotes: number;
}

export type VotingResult = FibonacciResult | TShirtResult;

// Standard Fibonacci sequence for Planning Poker
const FIBONACCI_SEQUENCE = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// T-Shirt size order for comparison
const TSHIRT_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

@Injectable()
export class VotingService {
  /**
   * Polymorphic result calculation based on deck type
   */
  calculateResults(deckType: DeckType, votes: string[]): VotingResult {
    if (deckType === DeckType.FIBONACCI) {
      return this.calculateFibonacciResults(votes);
    } else {
      return this.calculateTShirtResults(votes);
    }
  }

  /**
   * Calculate results for Fibonacci deck (numeric average)
   */
  private calculateFibonacciResults(votes: string[]): FibonacciResult {
    const numericVotes: number[] = [];
    const distribution: Record<number, number> = {};
    let skippedVotes = 0;

    for (const vote of votes) {
      // Skip "?" and coffee break votes
      if (vote === '?' || vote === '☕') {
        skippedVotes++;
        continue;
      }

      const numValue = parseInt(vote, 10);
      if (!isNaN(numValue)) {
        numericVotes.push(numValue);
        distribution[numValue] = (distribution[numValue] || 0) + 1;
      }
    }

    if (numericVotes.length === 0) {
      return {
        type: 'fibonacci',
        average: 0,
        roundedAverage: 0,
        votes: [],
        distribution: {},
        isConsensus: false,
        totalVotes: votes.length,
        skippedVotes,
      };
    }

    // Calculate arithmetic average
    const sum = numericVotes.reduce((acc, val) => acc + val, 0);
    const average = sum / numericVotes.length;

    // Round to nearest Fibonacci number
    const roundedAverage = this.roundToNearestFibonacci(average);

    // Check for consensus (all votes are the same)
    const uniqueVotes = [...new Set(numericVotes)];
    const isConsensus = uniqueVotes.length === 1;

    return {
      type: 'fibonacci',
      average: Math.round(average * 100) / 100, // Round to 2 decimal places
      roundedAverage,
      votes: numericVotes,
      distribution,
      isConsensus,
      consensusValue: isConsensus ? uniqueVotes[0] : undefined,
      totalVotes: votes.length,
      skippedVotes,
    };
  }

  /**
   * Calculate results for T-Shirt deck (mode/majority)
   */
  private calculateTShirtResults(votes: string[]): TShirtResult {
    const validVotes: string[] = [];
    const distribution: Record<string, number> = {};
    let skippedVotes = 0;

    for (const vote of votes) {
      // Skip "?" and coffee break votes
      if (vote === '?' || vote === '☕') {
        skippedVotes++;
        continue;
      }

      // Normalize to uppercase
      const normalizedVote = vote.toUpperCase();
      if (TSHIRT_ORDER.includes(normalizedVote)) {
        validVotes.push(normalizedVote);
        distribution[normalizedVote] = (distribution[normalizedVote] || 0) + 1;
      }
    }

    if (validVotes.length === 0) {
      return {
        type: 'tshirt',
        mode: 'N/A',
        modeCount: 0,
        distribution: {},
        isConsensus: false,
        totalVotes: votes.length,
        skippedVotes,
      };
    }

    // Find the mode (most frequent value)
    let mode = '';
    let modeCount = 0;

    for (const [size, count] of Object.entries(distribution)) {
      if (count > modeCount) {
        mode = size;
        modeCount = count;
      } else if (count === modeCount) {
        // If tied, prefer the larger size (conservative estimate)
        if (TSHIRT_ORDER.indexOf(size) > TSHIRT_ORDER.indexOf(mode)) {
          mode = size;
        }
      }
    }

    // Check for consensus
    const uniqueVotes = [...new Set(validVotes)];
    const isConsensus = uniqueVotes.length === 1;

    return {
      type: 'tshirt',
      mode,
      modeCount,
      distribution,
      isConsensus,
      consensusValue: isConsensus ? uniqueVotes[0] : undefined,
      totalVotes: votes.length,
      skippedVotes,
    };
  }

  /**
   * Round a number to the nearest Fibonacci sequence value
   */
  private roundToNearestFibonacci(value: number): number {
    let closest = FIBONACCI_SEQUENCE[0];
    let minDiff = Math.abs(value - closest);

    for (const fib of FIBONACCI_SEQUENCE) {
      const diff = Math.abs(value - fib);
      if (diff < minDiff) {
        minDiff = diff;
        closest = fib;
      }
    }

    return closest;
  }

  /**
   * Get the deck values based on deck type
   */
  getDeckValues(deckType: DeckType): (string | number)[] {
    if (deckType === DeckType.FIBONACCI) {
      return [...FIBONACCI_SEQUENCE, '?', '☕'];
    } else {
      return [...TSHIRT_ORDER, '?', '☕'];
    }
  }

  /**
   * Validate if a vote value is valid for the given deck type
   */
  isValidVote(deckType: DeckType, value: string): boolean {
    if (value === '?' || value === '☕') {
      return true;
    }

    if (deckType === DeckType.FIBONACCI) {
      const numValue = parseInt(value, 10);
      return !isNaN(numValue) && FIBONACCI_SEQUENCE.includes(numValue);
    } else {
      return TSHIRT_ORDER.includes(value.toUpperCase());
    }
  }
}
