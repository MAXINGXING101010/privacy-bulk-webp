const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`);
  }
  
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000; // 5 min buffer
  return cachedToken;
}

export async function createSubscription(planId, subscriberEmail) {
  const token = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: {
        email_address: subscriberEmail,
      },
      application_context: {
        brand_name: 'PrivacyBulkWebP',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/pricing?cancelled=true`,
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal subscription creation failed: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

export async function getSubscriptionDetails(subscriptionId) {
  const token = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`PayPal subscription fetch failed: ${response.status}`);
  }
  
  return response.json();
}

export async function cancelSubscription(subscriptionId) {
  const token = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: 'User requested cancellation',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`PayPal subscription cancellation failed: ${response.status}`);
  }
  
  return true;
}

export async function activateSubscription(subscriptionId) {
  const token = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/activate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: 'Reactivating subscription',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`PayPal subscription activation failed: ${response.status}`);
  }
  
  return true;
}
