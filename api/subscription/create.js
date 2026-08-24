export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const { tier } = req.body;
    if (!['personal', 'pro'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be "personal" or "pro"' });
    }

    const planId = tier === 'personal' 
      ? process.env.PAYPAL_PLAN_PERSONAL 
      : process.env.PAYPAL_PLAN_PRO;

    if (!planId) {
      return res.status(500).json({ error: `PayPal plan not configured for ${tier} tier` });
    }

    const { sql } = await import('@vercel/postgres');
    const userResult = await sql`SELECT email FROM users WHERE id = ${decoded.userId}`;
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { createSubscription } = await import('../../src/utils/paypal.js');
    const subscription = await createSubscription(planId, userResult.rows[0].email);

    return res.status(200).json({
      subscriptionId: subscription.id,
      approveUrl: subscription.links?.find(l => l.rel === 'approve')?.href,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
}
