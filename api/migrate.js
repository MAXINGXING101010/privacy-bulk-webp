// Temporary one-time setup + migration endpoint - DELETE AFTER USE
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST to run migration' });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const results = [];

    // Step 1: Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    results.push('Created users table');

    // Step 2: Create subscriptions table (with lemon_squeezy column included)
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'personal', 'pro')),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
        paypal_subscription_id VARCHAR(255),
        paypal_payer_id VARCHAR(255),
        lemon_squeezy_subscription_id VARCHAR(255),
        current_period_start TIMESTAMPTZ,
        current_period_end TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    results.push('Created subscriptions table (with lemon_squeezy_subscription_id)');

    // Step 3: Create conversion_history table
    await sql`
      CREATE TABLE IF NOT EXISTS conversion_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(500) NOT NULL,
        original_size BIGINT NOT NULL,
        converted_size BIGINT NOT NULL,
        compression_mode VARCHAR(20),
        quality INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    results.push('Created conversion_history table');

    // Step 4: Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_ls_id ON subscriptions(lemon_squeezy_subscription_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_history_user_id ON conversion_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_history_created_at ON conversion_history(created_at)`;
    results.push('Created all indexes');

    return res.status(200).json({ 
      message: 'Database setup completed successfully',
      changes: results
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
