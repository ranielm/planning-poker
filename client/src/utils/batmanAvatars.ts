// Batman (The Dark Knight trilogy) character avatars for users without profile pictures
// Characters from Christopher Nolan's Dark Knight trilogy (2005-2012)

export const BATMAN_CHARACTERS = [
  {
    name: 'Batman',
    image: '/avatars/batman.svg',
    color: '#1a1a2e', // Dark blue/black
  },
  {
    name: 'Joker',
    image: '/avatars/joker.svg',
    color: '#4a0e4e', // Purple
  },
  {
    name: 'Two-Face',
    image: '/avatars/two-face.svg',
    color: '#2d4a3e', // Dark teal
  },
  {
    name: 'Bane',
    image: '/avatars/bane.svg',
    color: '#3d2914', // Brown
  },
  {
    name: 'Catwoman',
    image: '/avatars/catwoman.svg',
    color: '#1a1a1a', // Black
  },
  {
    name: 'Scarecrow',
    image: '/avatars/scarecrow.svg',
    color: '#4a3728', // Burlap brown
  },
  {
    name: "Ra's al Ghul",
    image: '/avatars/ras-al-ghul.svg',
    color: '#1e3a2f', // Dark green
  },
  {
    name: 'Alfred',
    image: '/avatars/alfred.svg',
    color: '#2c3e50', // Navy
  },
  {
    name: 'Commissioner Gordon',
    image: '/avatars/gordon.svg',
    color: '#34495e', // Slate
  },
  {
    name: 'Lucius Fox',
    image: '/avatars/lucius.svg',
    color: '#1a252f', // Dark slate
  },
];

/**
 * Get a consistent Batman character avatar based on user ID
 * Uses a simple hash to always return the same character for the same user
 */
export function getBatmanAvatar(userId: string): typeof BATMAN_CHARACTERS[0] {
  // Simple hash function to get consistent index from userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % BATMAN_CHARACTERS.length;
  return BATMAN_CHARACTERS[index];
}

/**
 * Get avatar URL - returns user's avatar if available, otherwise Batman character
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
 * Get avatar character name for alt text
 */
export function getAvatarName(userId: string): string {
  return getBatmanAvatar(userId).name;
}
