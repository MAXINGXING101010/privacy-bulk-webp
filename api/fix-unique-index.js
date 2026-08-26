// Temporary endpoint to add unique index on user_id - DELETE AFTER USE
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    const { sql } = await import('@vercel/postgres');

    // First check if there are duplicate user_ids (shouldn't be, but just in case)
    const duplicates = await sql`
      SELECT user_id, COUNT(*) FROM subscriptions 
      GROUP BY user_id HAVING COUNT(*) > 1
    `;

    if (duplicates.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Duplicate user_ids found', 
        duplicates: duplicates.rows 
      });
    }

    // Add unique index
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id_unique 
      ON subscriptions(user_id)
    `;

    return res.status(200).json({ 
      message: 'Unique index on user_id created successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
}
