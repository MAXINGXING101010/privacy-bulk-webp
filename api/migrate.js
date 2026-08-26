// Temporary one-time migration endpoint - DELETE AFTER USE
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST to run migration' });
  }

  try {
    const { sql } = await import('@vercel/postgres');

    // Add lemon_squeezy_subscription_id column
    await sql`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id VARCHAR(255)
    `;

    // Add index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_ls_id 
      ON subscriptions(lemon_squeezy_subscription_id)
    `;

    return res.status(200).json({ 
      message: 'Migration completed successfully',
      changes: [
        'Added lemon_squeezy_subscription_id column to subscriptions',
        'Added idx_subscriptions_ls_id index'
      ]
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
