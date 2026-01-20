const { createClient } = require('@libsql/client');
require('dotenv').config();

const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
}

const client = createClient({
    url: dbUrl,
    authToken: authToken,
});

async function main() {
    console.log('🚀 Starting Dealer migration...');
    try {
        console.log('Adding dealerId column...');
        await client.execute('ALTER TABLE "Room" ADD COLUMN "dealerId" TEXT');
        console.log('✅ Added dealerId column');

        console.log('Creating index...');
        await client.execute('CREATE INDEX IF NOT EXISTS "Room_dealerId_idx" ON "Room"("dealerId")');
        console.log('✅ Created index');

        console.log('🎉 Migration successful!');
    } catch (e) {
        if (e.message && e.message.includes('duplicate column name')) {
            console.log('⚠️ Column already exists, skipping.');
        } else {
            console.error('❌ Migration failed:', e);
            process.exit(1);
        }
    } finally {
        client.close();
    }
}

main();
