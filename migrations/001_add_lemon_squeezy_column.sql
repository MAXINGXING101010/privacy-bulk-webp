-- Migration: Add Lemon Squeezy subscription ID column
-- Run this on your Vercel Postgres database after the initial schema.sql

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_subscriptions_ls_id ON subscriptions(lemon_squeezy_subscription_id);
