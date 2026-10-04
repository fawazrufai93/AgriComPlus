import { createClient } from '@supabase/supabase-js';

export const DELIVERY_FEE = 15; // GH₵ flat fee, Kumasi Metro

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

// Service-role client: bypasses RLS. NEVER import this from src/.
export function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || env('VITE_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// Validates the caller's Supabase access token and returns the user.
export async function requireUser(request: Request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// ── Paystack ────────────────────────────────────────────────
const PAYSTACK = 'https://api.paystack.co';

export async function paystack<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) {
    throw new Error(body.message || `Paystack error ${res.status}`);
  }
  return body as T;
}

// Row → camelCase Order used by the front end
export function rowToOrder(row: any) {
  return {
    id: row.id,
    traceCode: row.trace_code,
    placedAt: row.placed_at,
    items: row.items,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    status: row.status,
    estimatedDelivery: row.estimated_delivery,
    farmIds: row.farm_ids,
    traceEvents: row.trace_events,
    paymentStatus: row.payment_status,
    paymentReference: row.payment_reference,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
  };
}

/**
 * Asks Paystack whether a reference was really paid, then updates the order.
 * Safe to call many times (webhook + browser callback): the order is only
 * flipped to "paid" once and stock is only deducted once.
 */
export async function finalizePayment(reference: string) {
  const db = adminClient();
  const { data: order } = await db.from('orders').select('*').eq('payment_reference', reference).maybeSingle();
  if (!order) return { order: null, state: 'not_found' as const };
  if (order.payment_status === 'paid') return { order, state: 'paid' as const };

  const verify = await paystack<{ data: { status: string; amount: number; currency: string } }>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
  const tx = verify.data;

  if (tx.status === 'success') {
    // The amount must match what WE computed, never what the browser claimed.
    if (tx.currency !== 'GHS' || tx.amount !== Math.round(Number(order.total) * 100)) {
      await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
      return { order, state: 'amount_mismatch' as const };
    }
    const { data: updated } = await db
      .from('orders')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
      .select('*')
      .maybeSingle();
    if (updated) await db.rpc('deduct_order_stock', { p_order_id: order.id });
    const { data: fresh } = await db.from('orders').select('*').eq('id', order.id).single();
    return { order: fresh, state: 'paid' as const };
  }

  if (['failed', 'abandoned', 'reversed'].includes(tx.status)) {
    await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id).neq('payment_status', 'paid');
    const { data: fresh } = await db.from('orders').select('*').eq('id', order.id).single();
    return { order: fresh, state: 'failed' as const };
  }
  return { order, state: 'pending' as const };
}
