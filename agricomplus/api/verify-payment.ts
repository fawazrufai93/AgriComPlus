import { finalizePayment, json, requireUser, rowToOrder } from './_lib/server.js';

// Called by the browser when the customer returns from Paystack.
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return json({ error: 'Not signed in.' }, 401);
    const reference = new URL(request.url).searchParams.get('reference');
    if (!reference) return json({ error: 'Missing reference.' }, 400);

    const result = await finalizePayment(reference);
    if (!result.order || result.order.user_id !== user.id) return json({ error: 'Order not found.' }, 404);
    return json({ state: result.state, order: rowToOrder(result.order) });
  } catch (e: any) {
    console.error('verify-payment failed', e);
    return json({ error: e?.message || 'Could not verify payment.' }, 500);
  }
}
