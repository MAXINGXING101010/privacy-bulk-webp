import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const event = req.body;

    // Verify webhook (in production, verify PayPal webhook signature)
    // For now, process the event directly

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = event.resource.id;
        const payerEmail = event.resource.subscriber?.email_address;
        const planId = event.resource.plan_id;

        // Determine tier from plan ID
        const tier = planId === process.env.PAYPAL_PLAN_PERSONAL ? 'personal' : 'pro';

        // Find user by email
        const userResult = await sql`SELECT id FROM users WHERE email = ${payerEmail}`;
        if (userResult.rows.length === 0) {
          console.error('User not found for PayPal email:', payerEmail);
          return res.status(200).json({ message: 'User not found, webhook ignored' });
        }

        const userId = userResult.rows[0].id;
        const periodEnd = event.resource.billing_info?.next_billing_time 
          ? new Date(event.resource.billing_info.next_billing_time)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Update or insert subscription
        await sql`
          INSERT INTO subscriptions (user_id, tier, status, paypal_subscription_id, current_period_end)
          VALUES (${userId}, ${tier}, 'active', ${subscriptionId}, ${periodEnd})
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            tier = ${tier},
            status = 'active',
            paypal_subscription_id = ${subscriptionId},
            current_period_end = ${periodEnd},
            updated_at = NOW()
        `;

        console.log(`Subscription activated: user=${userId}, tier=${tier}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = event.resource.id;
        
        await sql`
          UPDATE subscriptions 
          SET status = 'cancelled', updated_at = NOW()
          WHERE paypal_subscription_id = ${subscriptionId}
        `;

        console.log(`Subscription cancelled: ${subscriptionId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = event.resource.id;
        
        await sql`
          UPDATE subscriptions 
          SET tier = 'free', status = 'expired', updated_at = NOW()
          WHERE paypal_subscription_id = ${subscriptionId}
        `;

        console.log(`Subscription expired: ${subscriptionId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = event.resource.id;
        
        await sql`
          UPDATE subscriptions 
          SET status = 'suspended', updated_at = NOW()
          WHERE paypal_subscription_id = ${subscriptionId}
        `;

        console.log(`Subscription suspended: ${subscriptionId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPGRADED': {
        const subscriptionId = event.resource.id;
        const planId = event.resource.plan_id;
        const tier = planId === process.env.PAYPAL_PLAN_PERSONAL ? 'personal' : 'pro';

        await sql`
          UPDATE subscriptions 
          SET tier = ${tier}, updated_at = NOW()
          WHERE paypal_subscription_id = ${subscriptionId}
        `;

        console.log(`Subscription upgraded: ${subscriptionId}, tier=${tier}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
