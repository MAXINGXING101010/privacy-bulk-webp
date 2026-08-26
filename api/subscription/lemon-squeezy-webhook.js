import crypto from 'crypto';

/**
 * Lemon Squeezy Webhook Handler
 * 
 * Events handled:
 * - subscription_created: New subscription → activate tier
 * - subscription_updated: Tier change → update tier
 * - subscription_cancelled: User cancels → mark cancelled
 * - subscription_expired: Subscription ends → downgrade to free
 * - subscription_resumed: User resumes → reactivate
 * - subscription_payment_success: Payment received (info only)
 * - subscription_payment_failed: Payment failed (info only)
 * 
 * Signature verification: HMAC SHA-256 using webhook signing secret
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signingSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!signingSecret) {
      console.error('LEMON_SQUEEZY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = req.headers['x-signature'];

    if (!signature) {
      return res.status(401).json({ error: 'Missing signature header' });
    }

    const hmac = crypto.createHmac('sha256', signingSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { sql } = await import('@vercel/postgres');
    const event = req.body;

    // Skip test mode events in production (or handle them in dev)
    const isTest = event.meta?.test_mode === true;
    if (isTest) {
      console.log('[LS Webhook] Test mode event:', event.meta?.event_name);
    }

    const eventName = event.meta?.event_name;
    const attrs = event.data?.attributes;

    if (!eventName || !attrs) {
      console.log('[LS Webhook] Invalid event structure:', JSON.stringify(event).slice(0, 200));
      return res.status(200).json({ message: 'Event ignored' });
    }

    const userEmail = attrs.user_email;
    const lsSubscriptionId = String(event.data?.id);
    const status = attrs.status;
    const variantId = attrs.variant_id;

    // Determine tier from variant ID
    // Personal variant ID: f0113c8c-1abe-4a2b-86ef-7c0645dad443
    // Pro variant ID: 68c7ee3d-4b08-46a9-ab08-a01543a1146b
    const PERSONAL_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_PERSONAL || 'f0113c8c-1abe-4a2b-86ef-7c0645dad443';
    const PRO_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_PRO || '68c7ee3d-4b08-46a9-ab08-a01543a1146b';

    let tier = null;
    if (variantId === PERSONAL_VARIANT_ID) {
      tier = 'personal';
    } else if (variantId === PRO_VARIANT_ID) {
      tier = 'pro';
    }

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        if (!userEmail || !tier) {
          console.log(`[LS Webhook] ${eventName}: missing email or tier`, { userEmail, tier, variantId });
          break;
        }

        // Find user by email
        const userResult = await sql`SELECT id FROM users WHERE email = ${userEmail}`;
        if (userResult.rows.length === 0) {
          console.error(`[LS Webhook] User not found for email: ${userEmail}`);
          break;
        }

        const userId = userResult.rows[0].id;
        const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Map LS status to our status
        const dbStatus = status === 'active' || status === 'trialing' ? 'active' : status;

        await sql`
          INSERT INTO subscriptions (user_id, tier, status, lemon_squeezy_subscription_id, current_period_end)
          VALUES (${userId}, ${tier}, ${dbStatus}, ${lsSubscriptionId}, ${renewsAt})
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            tier = ${tier},
            status = ${dbStatus},
            lemon_squeezy_subscription_id = ${lsSubscriptionId},
            current_period_end = ${renewsAt},
            updated_at = NOW()
        `;

        console.log(`[LS Webhook] ${eventName}: user=${userId}, tier=${tier}, status=${dbStatus}`);
        break;
      }

      case 'subscription_cancelled': {
        if (!lsSubscriptionId) break;

        await sql`
          UPDATE subscriptions 
          SET status = 'cancelled', updated_at = NOW()
          WHERE lemon_squeezy_subscription_id = ${lsSubscriptionId}
        `;

        console.log(`[LS Webhook] subscription_cancelled: ${lsSubscriptionId}`);
        break;
      }

      case 'subscription_expired': {
        if (!lsSubscriptionId) break;

        await sql`
          UPDATE subscriptions 
          SET tier = 'free', status = 'expired', updated_at = NOW()
          WHERE lemon_squeezy_subscription_id = ${lsSubscriptionId}
        `;

        console.log(`[LS Webhook] subscription_expired: ${lsSubscriptionId} → downgraded to free`);
        break;
      }

      case 'subscription_resumed': {
        if (!lsSubscriptionId) break;

        await sql`
          UPDATE subscriptions 
          SET status = 'active', updated_at = NOW()
          WHERE lemon_squeezy_subscription_id = ${lsSubscriptionId}
        `;

        console.log(`[LS Webhook] subscription_resumed: ${lsSubscriptionId}`);
        break;
      }

      case 'subscription_payment_success':
      case 'subscription_payment_failed':
      case 'subscription_payment_refunded': {
        // Info-only events, log but no DB changes needed
        console.log(`[LS Webhook] ${eventName}: subscription=${lsSubscriptionId}, email=${userEmail}`);
        break;
      }

      default:
        console.log(`[LS Webhook] Unhandled event: ${eventName}`);
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('[LS Webhook] Error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
