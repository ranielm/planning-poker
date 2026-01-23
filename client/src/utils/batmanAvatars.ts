// Batman (The Dark Knight trilogy) character avatars for users without profile pictures
// Uses room-based random assignment without repetition

// Import local avatar images
import batmanImg from '../assets/avatars/batman.jpg';
import baneImg from '../assets/avatars/bane.jpg';
import catwomanImg from '../assets/avatars/catwoman.jpg';
import twoFaceImg from '../assets/avatars/two-face.jpg';
import alfredImg from '../assets/avatars/alfred.png';
import gordonImg from '../assets/avatars/gordon.png';
import luciusFoxImg from '../assets/avatars/lucius-fox.png';
import rasAlGhulImg from '../assets/avatars/ras-al-ghul.png';
import scarecrowImg from '../assets/avatars/scarecrow.png';

// Joker is in public folder (already working)
const jokerImg = '/avatars/joker.svg';

export interface BatmanCharacter {
  name: string;
  image: string;
  color: string;
}

// Dark Knight character avatars using local images
export const BATMAN_CHARACTERS: BatmanCharacter[] = [
  {
    name: 'Batman',
    image: batmanImg,
    color: '#1a1a2e',
  },
  {
    name: 'Joker',
    image: jokerImg,
    color: '#4a0e4e',
  },
  {
    name: 'Two-Face',
    image: twoFaceImg,
    color: '#2d4a3e',
  },
  {
    name: 'Bane',
    image: baneImg,
    color: '#3d2914',
  },
  {
    name: 'Catwoman',
    image: catwomanImg,
    color: '#1a1a1a',
  },
  {
    name: 'Scarecrow',
    image: scarecrowImg,
    color: '#4a3728',
  },
  {
    name: "Ra's al Ghul",
    image: rasAlGhulImg,
    color: '#1e3a2f',
  },
  {
    name: 'Alfred',
    image: alfredImg,
    color: '#2c3e50',
  },
  {
    name: 'Commissioner Gordon',
    image: gordonImg,
    color: '#34495e',
  },
  {
    name: 'Lucius Fox',
    image: luciusFoxImg,
    color: '#1a252f',
  },
];

// Store room-specific avatar assignments
// Key: roomId, Value: Map<participantUserId, characterIndex>
const roomAvatarAssignments = new Map<string, Map<string, number>>();

// Track which indices are used in each room
const roomUsedIndices = new Map<string, Set<number>>();

/**
 * Shuffle array using Fisher-Yates algorithm with a seed
 */
function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum = ((seedNum << 5) - seedNum) + seed.charCodeAt(i);
    seedNum = seedNum & seedNum;
  }

  // Simple seeded random
  const random = () => {
    seedNum = (seedNum * 1103515245 + 12345) & 0x7fffffff;
    return seedNum / 0x7fffffff;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Get avatar for a user in a specific room
 * Ensures no repetition within the same room (up to 10 users)
 */
export function getRoomAvatar(roomId: string, orderId: number, userId: string): BatmanCharacter {
  // Initialize room assignments if needed
  if (!roomAvatarAssignments.has(roomId)) {
    roomAvatarAssignments.set(roomId, new Map());
    roomUsedIndices.set(roomId, new Set());
  }

  const roomAssignments = roomAvatarAssignments.get(roomId)!;
  const usedIndices = roomUsedIndices.get(roomId)!;

  // If user already has an assignment in this room, return it
  if (roomAssignments.has(userId)) {
    return BATMAN_CHARACTERS[roomAssignments.get(userId)!];
  }

  // Get available indices (not used by others in this room)
  let availableIndices = BATMAN_CHARACTERS
    .map((_, idx) => idx)
    .filter(idx => !usedIndices.has(idx));

  // If all characters are used, reset and allow reuse
  if (availableIndices.length === 0) {
    availableIndices = BATMAN_CHARACTERS.map((_, idx) => idx);
  }

  // Use order ID to pick from shuffled available indices for deterministic but random appearance
  const shuffled = seededShuffle(availableIndices, `${roomId}-${orderId}`);
  const selectedIndex = shuffled[0];

  // Store the assignment
  roomAssignments.set(userId, selectedIndex);
  usedIndices.add(selectedIndex);

  return BATMAN_CHARACTERS[selectedIndex];
}

/**
 * Get a consistent Batman character avatar based on user ID (legacy function)
 * Used as fallback when room context is not available
 */
export function getBatmanAvatar(userId: string): BatmanCharacter {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % BATMAN_CHARACTERS.length;
  return BATMAN_CHARACTERS[index];
}

/**
 * Get avatar URL - returns user's avatar if available, otherwise Batman character
 * For use with room context (preferred)
 */
export function getAvatarUrlForRoom(
  avatarUrl: string | null | undefined,
  roomId: string,
  orderId: number,
  userId: string
): string {
  if (avatarUrl) return avatarUrl;
  return getRoomAvatar(roomId, orderId, userId).image;
}

/**
 * Get avatar URL - returns user's avatar if available, otherwise Batman character
 * Legacy function for use without room context
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, userId: string): string {
  if (avatarUrl) return avatarUrl;
  return getBatmanAvatar(userId).image;
}

/**
 * Get avatar background color for fallback display
 */
export function getAvatarColor(userId: string): string {
  return getBatmanAvatar(userId).color;
}

/**
 * Get avatar background color for a room context
 */
export function getAvatarColorForRoom(roomId: string, orderId: number, userId: string): string {
  return getRoomAvatar(roomId, orderId, userId).color;
}

/**
 * Get avatar character name for alt text
 */
export function getAvatarName(userId: string): string {
  return getBatmanAvatar(userId).name;
}

/**
 * Get avatar character name for a room context
 */
export function getAvatarNameForRoom(roomId: string, orderId: number, userId: string): string {
  return getRoomAvatar(roomId, orderId, userId).name;
}

/**
 * Clear avatar assignments for a room (call when room is destroyed)
 */
export function clearRoomAvatars(roomId: string): void {
  roomAvatarAssignments.delete(roomId);
  roomUsedIndices.delete(roomId);
}
