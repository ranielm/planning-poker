// Batman (The Dark Knight trilogy) character avatars for users without profile pictures
// Uses room-based random assignment without repetition

export interface BatmanCharacter {
  name: string;
  image: string;
  color: string;
}

// Inline SVG avatars as data URLs to avoid CORS/external dependency issues
// Simple, stylized character icons
const createAvatarSvg = (bgColor: string, fgColor: string, initials: string, features?: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${bgColor}"/>
    <circle cx="50" cy="40" r="25" fill="${fgColor}"/>
    <circle cx="50" cy="100" r="35" fill="${fgColor}"/>
    ${features || ''}
    <text x="50" y="48" font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="${bgColor}" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Dark Knight character avatars using inline SVGs
export const BATMAN_CHARACTERS: BatmanCharacter[] = [
  {
    name: 'Batman',
    image: createAvatarSvg('#1a1a2e', '#3d3d5c', 'BM', '<path d="M35 25 L50 15 L65 25" stroke="#1a1a2e" stroke-width="3" fill="none"/>'),
    color: '#1a1a2e',
  },
  {
    name: 'Joker',
    image: createAvatarSvg('#4a0e4e', '#7fff7f', 'JK', '<path d="M35 50 Q50 60 65 50" stroke="#4a0e4e" stroke-width="2" fill="none"/>'),
    color: '#4a0e4e',
  },
  {
    name: 'Two-Face',
    image: createAvatarSvg('#2d4a3e', '#8fbc8f', 'TF', '<line x1="50" y1="15" x2="50" y2="65" stroke="#2d4a3e" stroke-width="2"/>'),
    color: '#2d4a3e',
  },
  {
    name: 'Bane',
    image: createAvatarSvg('#3d2914', '#8b7355', 'BN', '<path d="M35 45 L65 45 M40 50 L60 50" stroke="#3d2914" stroke-width="2"/>'),
    color: '#3d2914',
  },
  {
    name: 'Catwoman',
    image: createAvatarSvg('#1a1a1a', '#9370db', 'CW', '<path d="M30 25 L40 15 M70 25 L60 15" stroke="#9370db" stroke-width="3"/>'),
    color: '#1a1a1a',
  },
  {
    name: 'Scarecrow',
    image: createAvatarSvg('#4a3728', '#d2b48c', 'SC', '<circle cx="42" cy="38" r="5" fill="#4a3728"/><circle cx="58" cy="38" r="5" fill="#4a3728"/>'),
    color: '#4a3728',
  },
  {
    name: "Ra's al Ghul",
    image: createAvatarSvg('#1e3a2f', '#90ee90', 'RG', '<path d="M40 55 L50 60 L60 55" stroke="#1e3a2f" stroke-width="2" fill="none"/>'),
    color: '#1e3a2f',
  },
  {
    name: 'Alfred',
    image: createAvatarSvg('#2c3e50', '#c0c0c0', 'AL', '<path d="M35 52 Q50 58 65 52" stroke="#2c3e50" stroke-width="2" fill="none"/>'),
    color: '#2c3e50',
  },
  {
    name: 'Commissioner Gordon',
    image: createAvatarSvg('#34495e', '#f4a460', 'CG', '<rect x="38" y="35" width="24" height="8" rx="2" fill="none" stroke="#34495e" stroke-width="2"/>'),
    color: '#34495e',
  },
  {
    name: 'Lucius Fox',
    image: createAvatarSvg('#1a252f', '#4682b4', 'LF', '<rect x="38" y="35" width="24" height="8" rx="2" fill="none" stroke="#1a252f" stroke-width="2"/>'),
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
