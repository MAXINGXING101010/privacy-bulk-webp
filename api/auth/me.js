export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { getTokenFromRequest, verifyToken } = await import('../../src/utils/auth.js');
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { sql } = await import('@vercel/postgres');
    
    const result = await sql`
      SELECT u.id, u.email, u.created_at,
             s.tier, s.status as sub_status, s.paypal_subscription_id,
             s.current_period_end
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'trialling')
      WHERE u.id = ${decoded.userId}
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    // Check if subscription has expired
    let tier = user.tier || 'free';
    if (user.current_period_end && new Date(user.current_period_end) < new Date()) {
      tier = 'free';
      // Update expired subscription
      await sql`UPDATE subscriptions SET tier = 'free', status = 'expired' WHERE user_id = ${decoded.userId}`;
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      tier,
      subscription: {
        status: user.sub_status,
        paypalId: user.paypal_subscription_id,
        currentPeriodEnd: user.current_period_end,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
