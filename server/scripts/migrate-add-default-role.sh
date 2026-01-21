#!/bin/bash
# Migration Script: Add defaultRole column to User table
#
# Prerequisites: Turso CLI installed and authenticated
# Run with: bash scripts/migrate-add-default-role.sh <database-name>
#
# Example: bash scripts/migrate-add-default-role.sh planning-poker-ranielm

DB_NAME=${1:-"planning-poker-ranielm"}

echo "🔗 Connecting to Turso database: $DB_NAME"

# Check if column exists
echo "🔍 Checking current schema..."
COLUMNS=$(turso db shell "$DB_NAME" --execute "PRAGMA table_info(User)" 2>&1)

if echo "$COLUMNS" | grep -q "defaultRole"; then
    echo "✅ Column 'defaultRole' already exists. Migration not needed."
    exit 0
fi

echo "🚀 Adding 'defaultRole' column..."
turso db shell "$DB_NAME" --execute "ALTER TABLE User ADD COLUMN defaultRole TEXT DEFAULT 'VOTER';"

if [ $? -eq 0 ]; then
    echo "✅ Migration successful!"
    echo "📝 Verifying..."
    turso db shell "$DB_NAME" --execute "PRAGMA table_info(User)"
else
    echo "❌ Migration failed!"
    exit 1
fi
