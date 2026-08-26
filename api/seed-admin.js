// Temporary endpoint to seed admin user in Postgres - DELETE AFTER USE
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const ADMIN_EMAIL = 'admin@privacybulkwebp.com';
    const ADMIN_PASSWORD = 'admin123456';

    // Check if admin already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`;
    if (existing.rows.length > 0) {
      return res.status(200).json({ message: 'Admin user already exists', userId: existing.rows[0].id });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Insert admin user
    const userResult = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${ADMIN_EMAIL}, ${passwordHash})
      RETURNING id
    `;
    const userId = userResult.rows[0].id;

    // Create pro subscription for admin
    await sql`
      INSERT INTO subscriptions (user_id, tier, status, current_period_end)
      VALUES (${userId}, 'pro', 'active', NOW() + INTERVAL '1 year')
    `;

    return res.status(200).json({ 
      message: 'Admin user created successfully', 
      userId,
      email: ADMIN_EMAIL,
      tier: 'pro'
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
}
