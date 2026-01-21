/**
 * Migration Script: Add defaultRole column to User table
 *
 * Run with: node scripts/migrate-add-default-role.js
 *
 * Requires environment variables:
 * - TURSO_DATABASE_URL (e.g., libsql://planning-poker-xxx.turso.io)
 * - TURSO_AUTH_TOKEN
 */

const { createClient } = require('@libsql/client');

async function migrate() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ Missing environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
    process.exit(1);
  }

  console.log('🔗 Connecting to Turso database...');
  console.log(`📍 URL: ${url}`);

  const client = createClient({
    url,
    authToken,
  });

  try {
    // Check if column already exists
    console.log('🔍 Checking current schema...');
    const tableInfo = await client.execute("PRAGMA table_info(User)");
    const columns = tableInfo.rows.map(row => row.name);

    if (columns.includes('defaultRole')) {
      console.log('✅ Column "defaultRole" already exists. Migration not needed.');
      return;
    }

    console.log('📝 Current columns:', columns.join(', '));
    console.log('🚀 Adding "defaultRole" column...');

    // Add the column
    await client.execute("ALTER TABLE User ADD COLUMN defaultRole TEXT DEFAULT 'VOTER'");

    console.log('✅ Migration successful! Column "defaultRole" added to User table.');

    // Verify
    const verifyInfo = await client.execute("PRAGMA table_info(User)");
    const newColumns = verifyInfo.rows.map(row => row.name);
    console.log('📝 Updated columns:', newColumns.join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
