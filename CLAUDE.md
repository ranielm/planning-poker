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

## Voting History Bug Fixes
Date: 2026-01-15

### Overview:
Fixed two bugs preventing voting history from working correctly: topics not being saved to rounds, and the history section not being visible.

### Changes:
- `server/src/modules/game/game.service.ts`: Updated `setTopic()` to save topic to both `room.activeTopic` AND current `round.topic`
- `client/src/components/VotingHistory.tsx`: Removed conditional return that hid the component when history was empty
- `client/src/components/TopicPanel.tsx`: Fixed "Set New Topic" button to show form when clicked after reveal

### Summary:
The voting history now correctly displays previously voted topics with their names and final results. The `setTopic` function was only updating the room's active topic but not the round's topic field, causing history entries to show "Untitled round". Additionally, the VotingHistory component was hidden when empty, preventing users from ever seeing or expanding it. Both issues are now resolved.

## Fibonacci Card Display Fix
Date: 2026-01-15

### Overview:
Fixed the Fibonacci deck cards to display actual Fibonacci sequence values (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89) instead of sequential playing card ranks (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J).

### Changes:
- `client/src/components/Card.tsx`: Removed `valueToRank` mapping that was converting Fibonacci values to traditional playing card ranks. Cards now display the actual Story Point values directly.

### Technical Details:
The previous implementation had a mapping that converted Fibonacci values to playing card ranks:
- 0 → "A", 1 → "2", 2 → "3", 3 → "4", 5 → "5", 8 → "6", etc.

This was confusing because users selecting card "6" were actually voting "8 SP". Now cards display the true Fibonacci values making the Planning Poker experience intuitive and correct.

### Summary:
Cards now show actual Fibonacci Story Point values (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕) matching standard Planning Poker conventions.

## T-Shirt Deck Simplification
Date: 2026-01-15

### Overview:
Simplified the T-Shirt deck to only 4 sizes with specific Story Point values, and improved the Joker card visual design.

### Changes:
- `client/src/store/gameStore.ts`: Updated TSHIRT_DECK to ['S', 'M', 'L', 'XL', '?', '☕'] and TSHIRT_TO_SP mapping
- `client/src/components/Card.tsx`: Updated tshirtToSP mapping, TShirtIcon scales, and improved Joker card design with gradient background and "JOKER" label

### T-Shirt Size to Story Points:
- S (Small) = 13 SP
- M (Medium) = 26 SP
- L (Large) = 52 SP
- XL (Extra Large) = 104 SP
- ? (Joker) = Not sure
- ☕ (Coffee) = Need a break

### Visual Improvements:
- Joker card now has a purple/pink gradient background with "JOKER" text label for better visual appeal
- T-Shirt icon scales adjusted for the 4 sizes (S: 0.65, M: 0.75, L: 0.85, XL: 1.0)

### Summary:
The T-Shirt deck is now simpler with just 4 meaningful sizes that double in Story Points (13→26→52→104), making estimation more intuitive for teams that prefer relative sizing.

## Simplified Fibonacci Deck and UI Cleanup
Date: 2026-01-15

### Overview:
Simplified the Fibonacci deck to only include commonly used values (1-13) and removed the Create Room button from the header.

### Changes:
- `client/src/store/gameStore.ts`: Updated FIBONACCI_DECK from [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'] to [1, 2, 3, 5, 8, 13, '?', '☕']
- `server/src/modules/game/voting.service.ts`: Updated FIBONACCI_SEQUENCE to [1, 2, 3, 5, 8, 13]
- `client/src/components/Layout.tsx`: Removed Create Room button from header navigation (both desktop and mobile)

### Fibonacci Deck Values:
- 1, 2, 3, 5, 8, 13 (standard Fibonacci up to 13)
- ? (Joker) = Not sure
- ☕ (Coffee) = Need a break

### Summary:
The Fibonacci deck now focuses on the most practical range for story point estimation (1-13 SP), removing rarely used high values. The header is cleaner without the redundant Create Room button since users can access room creation from the home page.

## Voting History Detail Modal and Session Timer
Date: 2026-01-15

### Overview:
Added a detail modal for voting history items and a session timer to track how long users have been in a room.

### Voting History Detail Modal:
- `client/src/components/VotingHistory.tsx`: Added `VotingDetailModal` component with:
  - Topic info section (Jira key badge, title, description)
  - "Open in Jira" button when jiraUrl is available
  - Final result with consensus/no consensus indicator
  - Distribution bar chart showing vote breakdown
  - Stats cards (total votes, revealed timestamp)
  - Skipped votes count
  - Average/Rounded values for Fibonacci results
  - Close on ESC key or backdrop click
- History items converted from div to button for clickability
- Added "Click for details" hint on each item

### Session Timer:
- `client/src/components/SessionTimer.tsx`: New component that tracks time since user joined the room
  - Shows elapsed time in mm:ss or h:mm:ss format
  - Uses monospace font with tabular-nums for stable display
  - Updates every second
- `client/src/pages/RoomPage.tsx`: Added SessionTimer to room header alongside participant count

### Timezone Handling:
All timestamps use `toLocaleTimeString()` and `toLocaleString()` which automatically use the user's browser timezone.

### Version:
Updated to v1.1.6

## Bug Fixes - Modal and Topic
Date: 2026-01-15

### Voting Detail Modal Portal Fix:
- `client/src/components/VotingHistory.tsx`: Used `createPortal` from react-dom to render the modal directly in `document.body`, escaping the sidebar container context and ensuring proper centering/floating appearance.

### Topic Change at Any Phase:
- `client/src/components/TopicPanel.tsx`: Removed `phase === 'REVEALED'` restriction from "Set New Topic" button. Moderators can now change the topic at any phase:
  - In REVEALED phase: button shows "Set New Topic"
  - In other phases: button shows "Change Topic"

### Summary:
Fixed modal appearing misaligned by using React Portal. Fixed bug where moderators couldn't add new topics after a round was completed and reset.

## Face Card Mapping for 13 SP
Date: 2026-01-15

### Overview:
Mapped 13 Story Points to King (K) on card faces to maintain traditional playing card aesthetic.

### Changes:
- `client/src/components/Card.tsx`: Added `fibonacciToRank` mapping (13 → 'K'). Cards now display 'K' instead of '13' while tooltip still shows "13 Story Points".
- `client/src/components/ParticipantCard.tsx`: Same mapping applied for revealed cards on poker table.

### Visual:
- Card shows: K with suit symbol
- Tooltip shows: 13 Story Points

### Summary:
The 13 SP card now displays as King (K) matching traditional playing card conventions while preserving the actual story point value in tooltips.

## Homepage Card Height Consistency
Date: 2026-01-21

### Overview:
Added consistent minimum height to the three dashboard cards on the homepage when they are empty.

### Changes:
- `client/src/pages/HomePage.tsx`: Added `min-h-[200px]` to:
  - Join a Room card (always visible)
  - Your Rooms empty state
  - Public Rooms empty state

### Summary:
The three cards on the homepage now have a consistent 200px minimum height when empty, creating a more balanced visual layout. When cards have content (room lists), they grow naturally to accommodate the items.

## Poker Table Wood Border Restoration
Date: 2026-01-21

### Overview:
Restored the classic poker table design with dark brown wood border and gold/brass edge accents.

### Changes:
- `client/src/components/PokerTable.tsx`: Reverted table styling to previous design with:
  - Outer dark brown wood rim with gradient (from-[#4a3728] via-[#3d2d20] to-[#2a1f16])
  - Inner wood rim highlight
  - Gold/brass edge border
  - Green felt surface with texture overlay
  - Oval betting area in center with decorative borders
  - Kept all new props (deckType, isModerator, dealerId, onAssignDealer)

### Summary:
The poker table now has the classic casino look with wood border instead of the simplified emerald design.

## Card Number Size Adjustment
Date: 2026-01-21

### Overview:
Adjusted card number sizes to prevent two-digit numbers (like 13) from touching the card border.

### Changes:
- `client/src/components/Card.tsx`: Dynamic font size based on digit count
  - Single digit: text-5xl
  - Two digits: text-4xl
- `client/src/components/ParticipantCard.tsx`: Same logic for revealed cards on table
  - Single digit: text-3xl
  - Two digits: text-2xl

### Summary:
Numbers now scale appropriately based on their length, ensuring proper spacing within the card borders.

## Topic Panel Layout Improvement
Date: 2026-01-21

### Overview:
Improved the Current Topic display to show ticket number and title on separate lines with tooltips.

### Changes:
- `client/src/components/TopicPanel.tsx`:
  - Jira key badge now on its own line
  - Title on separate line with `line-clamp-2` and tooltip
  - Description with `line-clamp-2` and tooltip
  - Added `cursor-default` for hover indication

### Summary:
The topic panel is now cleaner with ticket and title on separate lines. Full text available via hover tooltip.

## Observer Role Feature
Date: 2026-01-21

### Overview:
Implemented Observer role functionality allowing users to watch sessions without participating in voting. Observers don't count toward consensus and their preference is saved for future sessions.

### Database Changes:
- `server/prisma/schema.prisma`: Added `defaultRole` field to User model (default: "VOTER")

### Server Changes:
- `server/src/modules/room/room.service.ts`:
  - Added `toggleOwnRole()` method - allows users to switch between VOTER/OBSERVER
  - Added `getUserDefaultRole()` method - retrieves user's saved preference
  - Moderators cannot become observers (enforced)
- `server/src/gateway/game.gateway.ts`:
  - Updated `room:join` to use user's default role preference for new participants
  - Added `room:toggleRole` socket event for role switching

### Client Changes:
- `client/src/services/socket.ts`: Added `toggleRole()` method
- `client/src/hooks/useGameSocket.ts`:
  - Added `toggleRole` callback
  - Added `isObserver` and `myRole` computed values
- `client/src/components/RoleToggle.tsx`: New component with:
  - Visual indicator (Eye for Observer, User for Voter)
  - Dropdown to choose "Just for this session" or "Save as my default"
- `client/src/pages/RoomPage.tsx`: Added RoleToggle to header

### How it works:
1. Users can click the role button in the room header to toggle between Voter and Observer
2. When toggling, they can choose to save it as their default for future rooms
3. Observer role:
   - Cannot vote
   - Card deck is hidden
   - Not counted in voting statistics or consensus
   - Can see all results when revealed
4. All users (including moderators) can become observers
5. User's preference is stored in database and applied when joining new rooms

### Behavior:
- Existing participants keep their current role when reconnecting
- New participants use their saved default role preference
- Role can be toggled anytime during a session

## Allow Vote Changes After Reveal
Date: 2026-01-21

### Overview:
Players can now change their votes even after cards have been revealed.

### Changes:
- `client/src/hooks/useGameSocket.ts`: Updated `canVote` to allow voting in both VOTING and REVEALED phases
- `client/src/pages/RoomPage.tsx`: Removed `disabled` restriction on CardDeck when phase is REVEALED
- `server/src/modules/game/game.service.ts`: Already allowed (line 200-203) - votes can be cast/updated in REVEALED phase

### How it works:
1. After cards are revealed, the card deck remains visible and active
2. Players can click a different card to change their vote
3. The vote is updated in real-time and results recalculate
4. This allows teams to revote without starting a new round

## Moderator Can Become Observer
Date: 2026-01-21

### Overview:
Removed the restriction that prevented moderators from becoming observers. Now all users, including the room moderator, can toggle between Voter and Observer roles.

### Changes:
- `server/src/modules/room/room.service.ts`: Removed the `ForbiddenException` check that blocked moderators from toggling their role
- `client/src/components/RoleToggle.tsx`:
  - Removed the `if (isModerator) return null;` check
  - Removed `isModerator` prop from the interface

### How it works:
1. Moderator (room creator) can now click the role toggle button
2. They can switch between Voter and Observer like any other participant
3. When set to Observer, the moderator can still use moderator controls (reveal, reset, etc.) but won't participate in voting
4. This is useful for Scrum Masters or facilitators who don't need to estimate but want to run the session
5. When toggling back from Observer, the room creator returns to MODERATOR role (not VOTER)

## Fix: Role Toggle Causing UI Freeze
Date: 2026-01-21

### Overview:
Fixed a bug where toggling user role (Voter/Observer) caused the application to freeze, requiring a page refresh.

### Problem:
The `useEffect` hook for socket event listeners had `[onKicked, navigate]` as dependencies. Since `navigate` from React Router creates a new reference on each render, the useEffect was re-running constantly, causing listener cleanup/recreation cycles that interfered with incoming socket events.

### Solution:
- `client/src/hooks/useGameSocket.ts`:
  - Added `onKickedRef` and `navigateRef` refs to hold stable references
  - Added a separate useEffect to keep refs updated
  - Changed socket events useEffect to use refs instead of direct dependencies
  - Changed dependency array to `[]` (runs once on mount)

### Technical Details:
When socket events like `room:state` were emitted after a role toggle, the listener was sometimes in the middle of being recreated due to the dependency change, causing the event to be missed or processed incorrectly. Using refs ensures the listeners are stable and only created once.

## Fix: Observer Section Breaking Poker Table Layout
Date: 2026-01-21

### Overview:
Fixed a layout bug where having observers in the room caused the poker table to display incorrectly - half green felt, half broken background.

### Problem:
The Observers section was rendered inside the poker table's wood border container but outside the green felt area, causing the table layout to break.

### Solution:
- `client/src/components/PokerTable.tsx`:
  - Wrapped the return in a React Fragment (`<>...</>`)
  - Moved Observers section completely outside the table div
  - Observers now displayed in their own styled card below the table

### Summary:
The poker table felt surface now always remains fully green regardless of observers. Observers are displayed in a separate section below the table with their own styling.

## Room Code Display and Toolbar Centering
Date: 2026-01-21

### Overview:
Added room code display near the copy button and fixed toolbar centering issues.

### Changes:
- `client/src/pages/RoomPage.tsx`:
  - Added room slug display next to the copy button in a combined UI element
  - Slug is displayed in monospace font with `select-all` for easy copying
  - Visual grouping with background color distinguishing slug from copy button

- `client/src/components/Layout.tsx`:
  - Removed `flex-1` from the three header sections (logo, nav, user menu)
  - Header now uses `justify-between` properly with natural content widths
  - Logo and org name properly aligned on the left

### Summary:
Users can now see the room code directly in the header and the toolbar elements are properly positioned.

## Jira Search by Issue Number
Date: 2026-01-21

### Overview:
Added ability to search Jira issues by just the numeric ID (e.g., "6050") instead of requiring the full key (e.g., "VAN-6050").

### Server Changes:
- `server/src/modules/jira/jira.service.ts`:
  - Added `JIRA_DEFAULT_PROJECT` environment variable support
  - Updated `extractIssueKey()` method to handle numeric-only input
  - When user enters just a number, it prepends the default project prefix

### Client Changes:
- `client/src/components/TopicPanel.tsx`:
  - Updated `isJiraInput` regex to recognize numeric-only input as a potential Jira key

### Environment Variables:
- `JIRA_DEFAULT_PROJECT`: The default project prefix (e.g., "VAN") to use when searching by number only

### How it works:
1. User enters "6050" in the topic search
2. Client recognizes it as a potential Jira input
3. Server prepends the configured default project: "VAN-6050"
4. Jira API is queried with the full key
5. Same issue is returned whether user searches "VAN-6050" or "6050"

## Database Migration: Add defaultRole Column
Date: 2026-01-21

### Overview:
The `defaultRole` column was added to the Prisma schema but was missing from the production Turso database, causing OAuth and registration to fail.

### Migration Scripts Created:
- `server/scripts/migrate-add-default-role.sql`: Raw SQL migration
- `server/scripts/migrate-add-default-role.js`: Node.js script using @libsql/client
- `server/scripts/migrate-add-default-role.sh`: Bash script using Turso CLI

### Migration Executed:
```sql
ALTER TABLE User ADD COLUMN defaultRole TEXT DEFAULT 'VOTER';
```

### Summary:
The migration was executed via Turso HTTP API, adding the `defaultRole` column to the User table. OAuth and user registration now work correctly.

## Role Toggle UX Simplification
Date: 2026-01-21

### Overview:
Simplified the role toggle component from a complex dropdown menu to a simple click-to-toggle button.

### Changes:
- `client/src/components/RoleToggle.tsx`:
  - Removed dropdown menu with "Just for this session" and "Save as default" options
  - Converted to simple toggle button that changes role on click
  - Shows current role with appropriate icon (Eye for Observer, User for Voter)
  - Added loading state with opacity and cursor changes
  - Tooltip indicates what clicking will do

### How it works:
1. Click the button to immediately toggle between Voter and Observer
2. Button shows current role with colored badge styling
3. Disabled state during API call prevents double-toggling
4. Role changes are applied immediately to the current session

### Summary:
The role toggle is now more intuitive - one click toggles the role without requiring menu interaction. The "save as default" feature was removed for simplicity.

## Delete Room Feature
Date: 2026-01-21

### Overview:
Added ability for room creators to delete their rooms from the homepage with a trash icon button.

### Changes:
- `client/src/pages/HomePage.tsx`:
  - Added `Trash2` icon import from lucide-react
  - Added `deletingRoomId` state for loading indication
  - Added `handleDeleteRoom()` function with:
    - Confirmation dialog before deletion
    - API call to DELETE `/rooms/:id`
    - Removes room from both user rooms and public rooms lists
    - Error handling with alert message
  - Modified room cards in "Your Rooms" section:
    - Changed from Link to div wrapper for proper button positioning
    - Added absolute-positioned trash button in top-right corner
    - Button shows loading spinner while deleting
    - Red hover color for delete action

### Backend Support:
- Server already has DELETE `/rooms/:id` endpoint (room.controller.ts:63-72)
- Only the room moderator (creator) can delete the room (room.service.ts:128-140)

### How it works:
1. User sees trash icon on their room cards in "Your Rooms" section
2. Clicking shows confirmation: "Are you sure you want to delete 'Room Name'?"
3. On confirm, room is deleted via API and removed from the list
4. Public rooms are also updated if the room was public

## Poker Table Height Restore
Date: 2026-01-21

### Overview:
Restored the poker table felt minimum height back to the original 280px.

### Changes:
- `client/src/components/PokerTable.tsx`: Changed `min-h-[320px]` back to `min-h-[280px]`

### Summary:
The table height was increased to 320px in an earlier fix, but the original 280px is correct now that observers are displayed outside the table.

## Role Toggle UX Fix - Show Action Instead of State
Date: 2026-01-22

### Overview:
Fixed the role toggle button to show the action that will happen when clicked, not the current state.

### Changes:
- `client/src/components/RoleToggle.tsx`:
  - Button now shows "Switch to Voter" when user is Observer
  - Button now shows "Switch to Observer" when user is Voter
  - Icon matches the target role (User icon for Voter action, Eye icon for Observer action)
  - Tooltip shows current state ("Currently observing" / "Currently voting")
  - Colors swapped to match the action being taken

### Summary:
The toggle button now clearly indicates what will happen when clicked, improving UX by following the standard pattern where buttons describe their action.

## Batman Character Avatars
Date: 2026-01-22

### Overview:
Added Batman (The Dark Knight trilogy) character avatars as default profile pictures for users without custom avatars.

### Files Created:
- `client/src/utils/batmanAvatars.ts`: Utility with character list and hash-based selection
- `client/public/avatars/*.svg`: 10 SVG avatar images for characters

### Characters Available:
1. Batman - Dark masked vigilante
2. Joker - Green hair, makeup (matches the "?" card theme!)
3. Two-Face - Half normal, half scarred
4. Bane - Iconic mask
5. Catwoman - Cat ears, green eyes
6. Scarecrow - Burlap mask
7. Ra's al Ghul - Serious, bearded
8. Alfred - Gray hair, elegant butler
9. Commissioner Gordon - Glasses, mustache
10. Lucius Fox - Professional appearance

### Files Updated:
- `client/src/components/ParticipantCard.tsx`: Uses `getAvatarUrl()` for participant avatars
- `client/src/components/Layout.tsx`: Uses `getAvatarUrl()` for header user avatar

### How it works:
1. When a user doesn't have a custom avatar, the system selects a Batman character
2. Character selection is deterministic based on user ID hash (same user = same character)
3. SVG avatars are stylized representations of each character
4. Users with custom avatars continue to see their uploaded image

## Automatic Reconnection System
Date: 2026-01-22

### Overview:
Implemented automatic WebSocket reconnection when users switch tabs or lose connection, preventing infinite loading states.

### Socket Service Changes (`client/src/services/socket.ts`):
- Added state tracking: `currentToken`, `currentRoom`, `isReconnecting`, `reconnectAttempts`
- New method `forceReconnect()`: Forces reconnection and rejoins room
- New method `getCurrentRoom()`: Returns current room slug
- Private method `rejoinRoom()`: Automatically rejoins room after reconnect
- Enhanced Socket.io config: 10 reconnection attempts, progressive delay up to 5s
- New events emitted: `connected`, `reconnected`, `reconnecting`, `reconnect_failed`

### Hook Changes (`client/src/hooks/useGameSocket.ts`):
- Added `visibilitychange` listener: Detects when tab becomes visible
- Added `online`/`offline` listeners: Detects network state changes
- New states: `isReconnecting`, `reconnectAttempt`
- When tab becomes visible:
  - If disconnected: Attempts reconnection
  - If connected: Refreshes room state by rejoining
- Maintains game state during reconnection (no blank screen)

### UI Changes (`client/src/pages/RoomPage.tsx`):
- Added reconnection banner at top of screen
- Shows "Reconnecting (attempt X)..." with spinner
- Shows "Connection lost. Reconnecting..." when offline
- Game state remains visible during reconnection

### How it works:
1. User switches to another tab → socket may disconnect due to browser throttling
2. User returns to tab → `visibilitychange` event fires
3. System checks connection status
4. If disconnected: Shows banner, attempts reconnection, rejoins room
5. If connected: Silently refreshes state
6. Game continues seamlessly without manual refresh

## Moderator Kick Participant Feature
Date: 2026-01-22

### Overview:
Moderators can now remove participants from the room directly from the poker table.

### Changes:
- `client/src/components/ParticipantCard.tsx`:
  - Added `onKick` prop
  - Added red kick button (UserX icon) in moderator action buttons
  - Button appears on hover alongside the assign dealer button
  - Confirmation dialog before removing participant
  - Kick button hidden for moderators (can't kick moderators)

- `client/src/components/PokerTable.tsx`:
  - Added `onKickParticipant` prop
  - Passes kick function to all ParticipantCard components (voters and observers)

- `client/src/pages/RoomPage.tsx`:
  - Added `kickParticipant` from useGameSocket
  - Passes kick function to PokerTable

### How it works:
1. Moderator hovers over any participant (except themselves)
2. Action buttons appear to the right of the participant card
3. Blue button (UserCog) = Assign Dealer
4. Red button (UserX) = Remove from Room
5. Clicking kick shows confirmation: "Remove [name] from the room?"
6. On confirm, participant is kicked and redirected to home page
7. Moderators cannot be kicked (button doesn't appear for them)

### Moderator Powers Summary:
Moderators retain all powers even when set to Observer role:
- Reveal cards
- Reset round
- Change deck type
- Set/change topic
- Assign dealer
- Kick participants