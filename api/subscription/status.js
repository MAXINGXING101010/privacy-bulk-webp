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
      SELECT tier, status, paypal_subscription_id, current_period_start, current_period_end, updated_at
      FROM subscriptions
      WHERE user_id = ${decoded.userId}
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return res.status(200).json({ tier: 'free', status: 'active' });
    }

    const sub = result.rows[0];
    
    // Check if subscription has expired
    let tier = sub.tier;
    if (sub.current_period_end && new Date(sub.current_period_end) < new Date()) {
      tier = 'free';
    }

    return res.status(200).json({
      tier,
      status: sub.status,
      paypalSubscriptionId: sub.paypal_subscription_id,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
