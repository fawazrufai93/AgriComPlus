import { createHmac, timingSafeEqual } from 'node:crypto';
import { env, finalizePayment, json } from './_lib/server.js';

// Paystack → us. Confirms payments even if the customer closes the browser tab.
// Set this URL in Paystack Dashboard → Settings → API Keys & Webhooks:
//   https://YOUR-DOMAIN/api/paystack-webhook
export async function POST(request: Request) {
  const raw = await request.text();
  const sig = request.headers.get('x-paystack-signature') || '';
  const expected = createHmac('sha512', env('PAYSTACK_SECRET_KEY')).update(raw).digest('hex');

  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json({ error: 'Invalid signature' }, 401);

  try {
    const event = JSON.parse(raw);
    const reference = event?.data?.reference;
    if (reference && String(event.event).startsWith('charge.')) {
      await finalizePayment(reference); // re-verifies with Paystack before trusting anything
    }
    return json({ received: true });
  } catch (e) {
    console.error('webhook failed', e);
    return json({ error: 'webhook error' }, 500);
  }
}
