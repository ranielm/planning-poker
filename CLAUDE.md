# Planning Poker - Development Documentation

## Initial Implementation
Date: 2026-01-14

### Changes:

- `server/prisma/schema.prisma`: Migrated from PostgreSQL to SQLite, converted enums to strings, JSON fields to String type
- `server/src/gateway/game.gateway.ts`: Updated type definitions from Prisma enums to string literal types
- `server/src/modules/game/game.service.ts`: Added string constants for GamePhase and ParticipantRole, updated JSON parsing for activeTopic
- `server/src/modules/game/voting.service.ts`: Updated to use string type for deckType parameter
- `server/src/modules/room/dto/room.dto.ts`: Changed validation to use string arrays instead of Prisma enums
- `server/src/modules/room/room.service.ts`: Added string constants for DeckType and ParticipantRole, updated socketIds JSON handling

### Summary:
Enterprise Scrum Planning Poker application with real-time voting capabilities. Features include multi-login authentication (Email/Password + OAuth), room management with Moderator/Voter/Observer roles, real-time game state via Socket.io, configurable deck types (Fibonacci/T-Shirt), and polymorphic voting results calculation. Migrated from PostgreSQL to SQLite for Docker-free local development, requiring conversion of Prisma enums to string constants and JSON fields to string storage with manual serialization.

## Automatic Token Refresh System
Date: 2026-01-14

### Changes:

- `server/prisma/schema.prisma`: Added RefreshToken model with userId, token (unique), expiresAt fields
- `server/src/modules/auth/auth.service.ts`: Added generateTokenResponse() with refresh token creation, refreshTokens(), revokeRefreshToken(), revokeAllUserRefreshTokens() methods
- `server/src/modules/auth/auth.controller.ts`: Added POST /auth/refresh and POST /auth/logout endpoints, updated OAuth callbacks to include refreshToken
- `server/src/modules/auth/dto/auth.dto.ts`: Added RefreshTokenDto class
- `client/src/services/api.ts`: Added auto-refresh interceptor that detects 401 errors, attempts token refresh, and retries the request
- `client/src/store/authStore.ts`: Added refreshToken to state, updated login/register to store both tokens, added setTokens() method
- `client/src/pages/AuthCallbackPage.tsx`: Updated to handle both token and refreshToken from OAuth callback

### How it works:
1. Access token expires in ~15 minutes (configured in JWT_EXPIRES_IN)
2. Refresh token expires in 30 days (stored in database)
3. When access token expires (401 error), the API client automatically:
   - Calls POST /auth/refresh with the refresh token
   - Updates stored tokens with new access and refresh tokens
   - Retries the original request
4. Refresh tokens are rotated on each use (old token deleted, new one created)
5. On logout, refresh token is revoked on server

### Environment Variables:
- JWT_SECRET: Secret for signing JWT tokens
- JWT_EXPIRES_IN: Access token expiry (default: 15m)

## T-Shirt Sizes and Public/Private Rooms
Date: 2026-01-14

### T-Shirt Sizes Update:
- `server/src/modules/game/voting.service.ts`: Updated T-Shirt deck to accept actual size labels (S, M, L, XL) instead of raw numbers. Added mapping to Story Points: S=13, M=26, L=52, XL=104. Results include both size labels and SP values.
- `client/src/store/gameStore.ts`: Updated TSHIRT_DECK to use ['S', 'M', 'L', 'XL', '?', '☕']. Exported TSHIRT_TO_SP mapping for UI display.

### Public/Private Rooms Feature:
- `server/prisma/schema.prisma`: Added `isPublic` Boolean field to Room model (default: false), added index on isPublic
- `server/src/modules/room/dto/room.dto.ts`: Added `isPublic` field to CreateRoomDto and UpdateRoomDto with @IsBoolean validation
- `server/src/modules/room/room.service.ts`: Added `findPublicRooms()` method to fetch public, active rooms with moderator info and participant count
- `server/src/modules/room/room.controller.ts`: Added GET /rooms/public endpoint (no auth required) to list public rooms
- `client/src/pages/CreateRoomPage.tsx`: Added room visibility toggle (Private/Public) with Lock/Globe icons
- `client/src/pages/HomePage.tsx`: Added "Public Rooms" section showing all public rooms with moderator name and participant count

### How Public Rooms Work:
1. When creating a room, user can toggle between Private (default) and Public
2. Private rooms: Only accessible via room code/URL
3. Public rooms: Listed on homepage, anyone can see and join them
4. GET /rooms/public endpoint is unauthenticated, allowing visitors to see available rooms

## Internationalization (i18n)
Date: 2026-01-14

### Overview:
Added support for two languages: English (en-US) as default and Portuguese (pt-BR). Language preference is persisted in localStorage and auto-detected from browser settings.

### Files Created:
- `client/src/i18n/en-US.ts`: English translations
- `client/src/i18n/pt-BR.ts`: Portuguese (Brazil) translations
- `client/src/i18n/index.ts`: i18n context, types, and useI18n hook
- `client/src/i18n/I18nProvider.tsx`: Provider component with language detection and persistence
- `client/src/components/LanguageSelector.tsx`: Dropdown component for changing language
- `client/src/utils/cn.ts`: Utility for combining classNames

### Files Updated:
- `client/src/main.tsx`: Wrapped App with I18nProvider
- `client/src/components/Layout.tsx`: Added LanguageSelector to header, used translations
- `client/src/pages/HomePage.tsx`: All strings translated
- `client/src/pages/CreateRoomPage.tsx`: All strings translated
- `client/src/pages/LoginPage.tsx`: All strings translated, added LanguageSelector
- `client/src/pages/RegisterPage.tsx`: All strings translated, added LanguageSelector
- `client/src/pages/AuthCallbackPage.tsx`: Loading text translated

### How it works:
1. On first visit, language is auto-detected from browser (navigator.language)
2. If browser is pt-*, sets Portuguese; otherwise English
3. User can change language via dropdown in header or login/register pages
4. Preference saved in localStorage under 'planning-poker-language'
5. Date formatting respects current language locale

## Voting History Feature
Date: 2026-01-15

### Overview:
Added voting history to track previously voted stories and their results. Users can see past voting rounds with topics, final results, vote counts, and timestamps.

### Server Changes:
- `server/src/modules/game/game.service.ts`: Added `VotingHistoryItem` interface and `getVotingHistory()` method that fetches revealed rounds with calculated results
- `server/src/gateway/game.gateway.ts`: Added `game:getHistory` socket event handler

### Client Changes:
- `client/src/types/index.ts`: Added `VotingHistoryItem` interface
- `client/src/services/socket.ts`: Added `getVotingHistory()` method
- `client/src/hooks/useGameSocket.ts`: Exposed `getVotingHistory` callback
- `client/src/components/VotingHistory.tsx`: New component displaying collapsible history list
- `client/src/components/TopicPanel.tsx`: Integrated VotingHistory component
- `client/src/pages/RoomPage.tsx`: Pass `getVotingHistory` to TopicPanel
- `client/src/i18n/en-US.ts`: Added history translations
- `client/src/i18n/pt-BR.ts`: Added history translations (Portuguese)

### How it works:
1. After cards are revealed, the round is stored with its topic and final result
2. Users can expand the "Voting History" section in the Topic Panel
3. History shows: topic title (with Jira key if available), final result, vote count, and time
4. Results are color-coded: green for consensus, yellow for no consensus
5. Moderators can start a new round by setting a new topic after reveal

## Dark/Light Theme Fix
Date: 2026-01-15

### Overview:
Fixed the dark/light mode toggle that was not working due to invalid Tailwind CSS class usage. The code was incorrectly using `light:` as a prefix, which doesn't exist in Tailwind CSS.

### Changes:
- `client/src/components/Layout.tsx`: Replaced invalid `light:` prefixes with proper pattern (default classes for light mode, `dark:` prefix for dark mode)
- `client/src/components/ThemeToggle.tsx`: Fixed hover class styling
- `client/src/pages/HomePage.tsx`: Complete rewrite with proper dark: variants for all elements
- `client/src/pages/RoomPage.tsx`: Fixed text and button colors for both themes
- `client/src/components/TopicPanel.tsx`: Complete rewrite with proper dark: variants
- `client/src/components/VotingHistory.tsx`: Fixed all color classes
- `client/src/components/CardDeck.tsx`: Fixed container styling
- `client/src/components/ModeratorControls.tsx`: Fixed all button and text colors
- `client/src/components/ResultsPanel.tsx`: Complete rewrite with proper dark: variants

### Technical Details:
Tailwind CSS uses `darkMode: 'class'` strategy where:
- Default styles (no prefix) apply to light mode
- `dark:` prefix applies when `.dark` class is on the root element
- There is NO `light:` prefix in Tailwind - this was the bug

### Summary:
The theme toggle now correctly switches between light and dark modes. All components have been updated to use the proper Tailwind dark mode pattern where default classes define light mode appearance and `dark:` prefixed classes override for dark mode.