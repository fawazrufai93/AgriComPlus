import { randomBytes } from 'node:crypto';
import { adminClient, DELIVERY_FEE, json, paystack, requireUser, rowToOrder } from './_lib/server.js';

type Body = {
  items: { productId: string; quantity: number }[];
  address: { id: string; title: string; area: string; landmark: string; city: string; recipientPhone: string; isDefault: boolean };
  payment: { type: 'momo' | 'card' | 'cod'; momoProvider?: 'mtn' | 'telecel' | 'at'; momoPhone?: string };
};

const MOMO_NAMES = { mtn: 'MTN MoMo', telecel: 'Telecel Cash', at: 'AirtelTigo Money' } as const;

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return json({ error: 'Please log in to place an order.' }, 401);

    const body = (await request.json()) as Body;
    if (!body?.items?.length || !body.address?.area || !body.payment?.type) {
      return json({ error: 'Invalid order request.' }, 400);
    }
    if (!['momo', 'card', 'cod'].includes(body.payment.type)) return json({ error: 'Invalid payment method.' }, 400);

    const db = adminClient();

    // 1. Prices & stock come from the database, never from the browser.
    const qtyById = new Map<string, number>();
    for (const i of body.items) {
      const q = Math.floor(Number(i.quantity));
      if (!i.productId || !Number.isFinite(q) || q < 1 || q > 100) return json({ error: 'Invalid quantity.' }, 400);
      qtyById.set(i.productId, (qtyById.get(i.productId) || 0) + q);
    }
    const { data: products, error: pErr } = await db.from('products').select('*').in('id', [...qtyById.keys()]);
    if (pErr) throw pErr;
    if (!products || products.length !== qtyById.size) return json({ error: 'Some items are no longer available.' }, 400);

    for (const p of products) {
      const want = qtyById.get(p.id)!;
      if (!p.in_stock || p.stock_count < want) {
        return json({ error: `Sorry, only ${Math.max(p.stock_count, 0)} of "${p.name}" left in stock.` }, 409);
      }
    }

    const cartItems = products.map((p) => ({
      quantity: qtyById.get(p.id)!,
      product: {
        id: p.id, name: p.name, localName: p.local_name, category: p.category, price: Number(p.price),
        originalPrice: Number(p.original_price ?? p.price), discountPercent: Number(p.discount_percent ?? 0),
        unit: p.unit, weight: p.weight, images: p.images, farmId: p.farm_id, description: p.description,
        healthTags: p.health_tags, inStock: p.in_stock, stockCount: p.stock_count, harvestDate: p.harvest_date,
        shelfLife: p.shelf_life, nutritionHighlights: p.nutrition_highlights,
      },
    }));
    const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const total = Math.round((subtotal + DELIVERY_FEE) * 100) / 100;

    // 2. Farm info for the traceability timeline
    const farmIds = [...new Set(products.map((p) => p.farm_id).filter(Boolean))] as string[];
    const { data: farms } = await db.from('farms').select('*').in('id', farmIds);
    const farm = farms?.[0];

    // 3. Profile (for customer details the admin sees)
    const { data: profile } = await db.from('profiles').select('name,phone,email').eq('id', user.id).maybeSingle();

    const stamp = Date.now();
    const orderId = `ACP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const traceCode = `TRACE-KMS-${String(stamp).slice(-4)}-${randomBytes(2).toString('hex').toUpperCase()}`;
    const addr = body.address;

    const traceEvents = [
      { id: `ev-${stamp}-1`, stage: 'Farm', title: 'Certified Harvest at Source Farm', timestamp: 'Pending', location: farm ? `${farm.name}, ${farm.location}` : 'Partner farm, Ashanti Region', description: farm ? `Produce sourced direct from ${farm.farmer_name}.` : 'Produce sourced direct from partner farm.', verifiedBy: 'Farm Lead & MoFA Cert Officer', status: 'pending', badge: 'MoFA Certified' },
      { id: `ev-${stamp}-2`, stage: 'Harvest', title: 'Dawn Sorting & Cold Packaging', timestamp: 'Pending', location: 'AgriCom+ Kumasi Sorting Hub (Kaase)', description: 'Packed in biodegradable breathable packaging with tamper-resistant QR seal.', verifiedBy: 'AgriCom+ Pack Inspector', status: 'pending' },
      { id: `ev-${stamp}-3`, stage: 'Pack', title: 'Batch Consolidated & Tagged', timestamp: 'Pending', location: 'Kaase Hub, Kumasi', description: `Assigned unique tamper QR trace code: ${traceCode}`, verifiedBy: 'Digital Registry #ACP-GH', status: 'pending' },
      { id: `ev-${stamp}-4`, stage: 'Delivery', title: 'Express Dispatch to Kumasi Buyer', timestamp: 'Pending', location: `${addr.title} - ${addr.area}`, description: `Delivered by AgriCom+ rider to ${addr.recipientPhone}.`, verifiedBy: 'Kumasi Metro Logistics', status: 'pending' },
    ];

    const pay = body.payment;
    const details =
      pay.type === 'momo' ? `${MOMO_NAMES[pay.momoProvider || 'mtn']} (${pay.momoPhone || addr.recipientPhone})`
      : pay.type === 'card' ? 'Card via Paystack'
      : 'Cash on Delivery';

    const isCod = pay.type === 'cod';
    const reference = isCod ? null : orderId; // Paystack reference = our order id

    const { data: row, error: insErr } = await db
      .from('orders')
      .insert({
        id: orderId,
        user_id: user.id,
        trace_code: traceCode,
        placed_at: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Accra' }),
        items: cartItems,
        subtotal, delivery_fee: DELIVERY_FEE, total,
        delivery_address: addr,
        payment_method: { type: pay.type, details },
        status: 'Order Placed',
        estimated_delivery: 'Today within 2–3 hours (Kumasi Metro)',
        farm_ids: farmIds,
        trace_events: traceEvents,
        payment_status: isCod ? 'pay_on_delivery' : 'pending',
        payment_reference: reference,
        customer_name: profile?.name || user.email?.split('@')[0],
        customer_phone: addr.recipientPhone || profile?.phone,
        customer_email: user.email,
      })
      .select('*')
      .single();
    if (insErr) throw insErr;

    if (isCod) {
      await db.rpc('deduct_order_stock', { p_order_id: orderId });
      return json({ order: rowToOrder(row) });
    }

    // 4. Online payment → Paystack hosted checkout (card + mobile money, GHS)
    const origin = request.headers.get('origin') || `https://${request.headers.get('host')}`;
    const init = await paystack<{ data: { authorization_url: string } }>('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(total * 100), // pesewas
        currency: 'GHS',
        reference,
        channels: pay.type === 'momo' ? ['mobile_money'] : ['card'],
        callback_url: `${origin}/?payment=callback`,
        metadata: { order_id: orderId, customer_phone: addr.recipientPhone },
      }),
    });

    return json({ order: rowToOrder(row), authorizationUrl: init.data.authorization_url });
  } catch (e: any) {
    console.error('create-order failed', e);
    return json({ error: e?.message || 'Could not create order.' }, 500);
  }
}
