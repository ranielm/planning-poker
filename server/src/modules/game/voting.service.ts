import { Injectable } from '@nestjs/common';

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
  average: number;
  roundedAverage: number; // Rounded to nearest T-Shirt SP value
  roundedSize: string; // T-Shirt size (S, M, L, XL)
  votes: number[];
  sizeVotes: string[]; // Original size votes
  distribution: Record<string, number>; // Distribution by size
  isConsensus: boolean;
  consensusValue?: string; // Consensus size
  totalVotes: number;
  skippedVotes: number;
}

export type VotingResult = FibonacciResult | TShirtResult;

// Standard Fibonacci sequence for Planning Poker
const FIBONACCI_SEQUENCE = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// T-Shirt sizes and their story point values
const TSHIRT_SIZES = ['S', 'M', 'L', 'XL'];
const TSHIRT_TO_SP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
};
const SP_TO_TSHIRT: Record<number, string> = {
  13: 'S',
  26: 'M',
  52: 'L',
  104: 'XL',
};
const TSHIRT_SP_VALUES = [13, 26, 52, 104];

@Injectable()
export class VotingService {
  /**
   * Polymorphic result calculation based on deck type
   */
  calculateResults(deckType: string, votes: string[]): VotingResult {
    if (deckType === 'FIBONACCI') {
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
   * Calculate results for T-Shirt deck (accepts S, M, L, XL and converts to SP)
   */
  private calculateTShirtResults(votes: string[]): TShirtResult {
    const numericVotes: number[] = [];
    const sizeVotes: string[] = [];
    const distribution: Record<string, number> = {};
    let skippedVotes = 0;

    for (const vote of votes) {
      // Skip "?" and coffee break votes
      if (vote === '?' || vote === '☕') {
        skippedVotes++;
        continue;
      }

      // Check if it's a T-Shirt size
      const upperVote = vote.toUpperCase();
      if (TSHIRT_SIZES.includes(upperVote)) {
        const spValue = TSHIRT_TO_SP[upperVote];
        numericVotes.push(spValue);
        sizeVotes.push(upperVote);
        distribution[upperVote] = (distribution[upperVote] || 0) + 1;
      }
    }

    if (numericVotes.length === 0) {
      return {
        type: 'tshirt',
        average: 0,
        roundedAverage: 0,
        roundedSize: 'N/A',
        votes: [],
        sizeVotes: [],
        distribution: {},
        isConsensus: false,
        totalVotes: votes.length,
        skippedVotes,
      };
    }

    // Calculate arithmetic average of SP values
    const sum = numericVotes.reduce((acc, val) => acc + val, 0);
    const average = sum / numericVotes.length;

    // Round to nearest T-Shirt SP value
    const roundedAverage = this.roundToNearestTShirtSP(average);
    const roundedSize = SP_TO_TSHIRT[roundedAverage] || 'M';

    // Check for consensus (all votes are the same size)
    const uniqueSizes = [...new Set(sizeVotes)];
    const isConsensus = uniqueSizes.length === 1;

    return {
      type: 'tshirt',
      average: Math.round(average * 100) / 100,
      roundedAverage,
      roundedSize,
      votes: numericVotes,
      sizeVotes,
      distribution,
      isConsensus,
      consensusValue: isConsensus ? uniqueSizes[0] : undefined,
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
   * Round a number to the nearest T-Shirt SP value
   */
  private roundToNearestTShirtSP(value: number): number {
    let closest = TSHIRT_SP_VALUES[0];
    let minDiff = Math.abs(value - closest);

    for (const sp of TSHIRT_SP_VALUES) {
      const diff = Math.abs(value - sp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = sp;
      }
    }

    return closest;
  }

  /**
   * Get the deck values based on deck type
   */
  getDeckValues(deckType: string): (string | number)[] {
    if (deckType === 'FIBONACCI') {
      return [...FIBONACCI_SEQUENCE, '?', '☕'];
    } else {
      return [...TSHIRT_SIZES, '?', '☕'];
    }
  }

  /**
   * Validate if a vote value is valid for the given deck type
   */
  isValidVote(deckType: string, value: string): boolean {
    if (value === '?' || value === '☕') {
      return true;
    }

    if (deckType === 'FIBONACCI') {
      const numValue = parseInt(value, 10);
      return !isNaN(numValue) && FIBONACCI_SEQUENCE.includes(numValue);
    } else {
      // Accept T-Shirt sizes
      return TSHIRT_SIZES.includes(value.toUpperCase());
    }
  }
}
