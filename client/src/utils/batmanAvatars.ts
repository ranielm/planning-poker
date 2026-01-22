// Batman (The Dark Knight trilogy) character avatars for users without profile pictures
// Uses room-based random assignment without repetition

export interface BatmanCharacter {
  name: string;
  image: string;
  color: string;
}

// Dark Knight character avatars using DiceBear API with character-themed seeds
// Each character gets a unique, deterministic avatar based on their name
// The avatars are reliably hosted and always available
export const BATMAN_CHARACTERS: BatmanCharacter[] = [
  {
    name: 'Batman',
    // Dark hero avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=BatmanBruceWayne&backgroundColor=1a1a2e&accessories=blank&clothing=blazerAndShirt&clothingColor=262e33&eyebrows=defaultNatural&eyes=default&facialHair=blank&hairColor=2c1b18&mouth=serious&skinColor=d08b5b&top=shortHairShortFlat',
    color: '#1a1a2e',
  },
  {
    name: 'Joker',
    // Chaotic villain avatar with green hair
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=JokerHeathLedger&backgroundColor=4a0e4e&accessories=blank&clothing=blazerAndShirt&clothingColor=614b8f&eyebrows=raisedExcitedNatural&eyes=happy&facialHair=blank&hairColor=4a8f4d&mouth=twinkle&skinColor=ffdbb4&top=shortHairShortCurly',
    color: '#4a0e4e',
  },
  {
    name: 'Two-Face',
    // Harvey Dent avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=TwoFaceHarveyDent&backgroundColor=2d4a3e&accessories=blank&clothing=blazerAndSweater&clothingColor=3c4f5c&eyebrows=angryNatural&eyes=squint&facialHair=blank&hairColor=2c1b18&mouth=grimace&skinColor=d08b5b&top=shortHairShortWaved',
    color: '#2d4a3e',
  },
  {
    name: 'Bane',
    // Muscular villain avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=BaneTomHardy&backgroundColor=3d2914&accessories=blank&clothing=hoodie&clothingColor=3c4f5c&eyebrows=angryNatural&eyes=serious&facialHair=blank&hairColor=4a312c&mouth=serious&skinColor=ae5d29&top=shortHairShortFlat',
    color: '#3d2914',
  },
  {
    name: 'Catwoman',
    // Selina Kyle avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=CatwomanSelinaKyle&backgroundColor=1a1a1a&accessories=blank&clothing=blazerAndShirt&clothingColor=262e33&eyebrows=defaultNatural&eyes=winkWacky&facialHair=blank&hairColor=2c1b18&mouth=default&skinColor=ffdbb4&top=longHairStraight2',
    color: '#1a1a1a',
  },
  {
    name: 'Scarecrow',
    // Dr. Jonathan Crane avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ScarecrowJonathanCrane&backgroundColor=4a3728&accessories=prescription02&clothing=blazerAndShirt&clothingColor=3c4f5c&eyebrows=flatNatural&eyes=surprised&facialHair=blank&hairColor=4a312c&mouth=concerned&skinColor=edb98a&top=shortHairShortWaved',
    color: '#4a3728',
  },
  {
    name: "Ra's al Ghul",
    // Liam Neeson's character avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=RasAlGhulLiamNeeson&backgroundColor=1e3a2f&accessories=blank&clothing=blazerAndSweater&clothingColor=3c4f5c&eyebrows=defaultNatural&eyes=default&facialHair=beardMajestic&facialHairColor=4a312c&hairColor=4a312c&mouth=serious&skinColor=d08b5b&top=shortHairShortWaved',
    color: '#1e3a2f',
  },
  {
    name: 'Alfred',
    // Michael Caine's butler avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AlfredPennyworth&backgroundColor=2c3e50&accessories=blank&clothing=blazerAndSweater&clothingColor=3c4f5c&eyebrows=defaultNatural&eyes=default&facialHair=blank&hairColor=c0c0c0&mouth=smile&skinColor=ffdbb4&top=shortHairSides',
    color: '#2c3e50',
  },
  {
    name: 'Commissioner Gordon',
    // Gary Oldman's character avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=GordonGCPD&backgroundColor=34495e&accessories=prescription01&clothing=blazerAndShirt&clothingColor=3c4f5c&eyebrows=defaultNatural&eyes=default&facialHair=beardMedium&facialHairColor=4a312c&hairColor=4a312c&mouth=serious&skinColor=edb98a&top=shortHairShortWaved',
    color: '#34495e',
  },
  {
    name: 'Lucius Fox',
    // Morgan Freeman's character avatar
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=LuciusFoxWayneEnterprises&backgroundColor=1a252f&accessories=prescription02&clothing=blazerAndSweater&clothingColor=3c4f5c&eyebrows=defaultNatural&eyes=default&facialHair=blank&hairColor=2c1b18&mouth=smile&skinColor=614335&top=shortHairSides',
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
