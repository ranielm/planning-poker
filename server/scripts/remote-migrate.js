const { createClient } = require('@libsql/client');

const { createClient } = require('@libsql/client');
require('dotenv').config();

const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
    console.error('❌ Missing TURSO_DATABASE_URL/DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
}

const client = createClient({
    url: dbUrl,
    authToken: authToken,
});

const sql = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "oauthProvider" TEXT,
    "oauthId" TEXT
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deckType" TEXT NOT NULL DEFAULT 'FIBONACCI',
    "moderatorId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "activeTopic" TEXT,
    CONSTRAINT "Room_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VOTER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socketIds" TEXT NOT NULL DEFAULT '[]',
    "isBrb" BOOLEAN NOT NULL DEFAULT false,
    "brbAt" DATETIME,
    CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Participant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "topic" TEXT,
    "phase" TEXT NOT NULL DEFAULT 'VOTING',
    "revealedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Round_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_oauthProvider_oauthId_key" ON "User"("oauthProvider", "oauthId");

CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_token_idx" ON "Session"("token");

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");

CREATE UNIQUE INDEX IF NOT EXISTS "Room_slug_key" ON "Room"("slug");
CREATE INDEX IF NOT EXISTS "Room_slug_idx" ON "Room"("slug");
CREATE INDEX IF NOT EXISTS "Room_moderatorId_idx" ON "Room"("moderatorId");
CREATE INDEX IF NOT EXISTS "Room_isPublic_idx" ON "Room"("isPublic");

CREATE INDEX IF NOT EXISTS "Participant_roomId_idx" ON "Participant"("roomId");
CREATE UNIQUE INDEX IF NOT EXISTS "Participant_userId_roomId_key" ON "Participant"("userId", "roomId");

CREATE INDEX IF NOT EXISTS "Vote_roomId_idx" ON "Vote"("roomId");
CREATE INDEX IF NOT EXISTS "Vote_roundId_idx" ON "Vote"("roundId");
CREATE UNIQUE INDEX IF NOT EXISTS "Vote_roundId_userId_key" ON "Vote"("roundId", "userId");

CREATE INDEX IF NOT EXISTS "Round_roomId_idx" ON "Round"("roomId");
`;

async function main() {
    console.log('🚀 Connecting to Turso...');
    try {
        const statements = sql.split(';')
            .map(s => {
                // Remove comment lines
                const lines = s.split('\n');
                const cleanLines = lines.filter(line => !line.trim().startsWith('--'));
                return cleanLines.join('\n').trim();
            })
            .filter(s => s.length > 0);

        console.log(`📝 Found ${statements.length} statements to execute.`);

        for (const statement of statements) {
            // Pular comentários de linha inteira se houver
            if (statement.startsWith('--')) continue;

            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await client.execute(statement);
        }

        console.log('✅ Migration completed successfully!');
    } catch (e) {
        console.error('❌ Migration failed:', e);
    } finally {
        client.close();
    }
}

main();
