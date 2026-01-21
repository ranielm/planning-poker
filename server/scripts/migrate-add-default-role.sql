-- Migration: Add defaultRole column to User table
-- Date: 2026-01-21
-- Description: Adds the defaultRole column for storing user's preferred role when joining rooms

-- Add the defaultRole column with default value 'VOTER'
ALTER TABLE User ADD COLUMN defaultRole TEXT DEFAULT 'VOTER';

-- Verify the migration
SELECT name, type, sql FROM sqlite_master WHERE type='table' AND name='User';
