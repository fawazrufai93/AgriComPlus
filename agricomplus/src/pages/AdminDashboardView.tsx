import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Download, Package, RefreshCw, Search, ShieldAlert, Wallet, Clock, Truck, CheckCircle2, Phone, MapPin,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { rowToOrder, rowToProduct } from '../lib/mappers';
import { Order, OrderStatus, PaymentStatus, Product, TraceEvent } from '../types';
import { useApp } from '../context/AppContext';

const STATUSES: OrderStatus[] = ['Order Placed', 'Harvested & Packed', 'Out for Delivery', 'Delivered'];

const payBadge: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'Awaiting payment', cls: 'bg-amber-100 text-amber-800' },
  failed: { label: 'Payment failed', cls: 'bg-red-100 text-red-700' },
  pay_on_delivery: { label: 'Cash on delivery', cls: 'bg-sky-100 text-sky-800' },
};

// Moves the QR traceability timeline in step with the order status.
function traceFor(events: TraceEvent[], status: OrderStatus): TraceEvent[] {
  const done = { 'Order Placed': 0, 'Harvested & Packed': 3, 'Out for Delivery': 3, Delivered: 4 }[status];
  const now = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Accra' });
  return events.map((ev, i) => {
    let next: TraceEvent['status'] = 'pending';
    if (i < done) next = 'completed';
    else if (i === done && status !== 'Delivered') next = 'in-progress';
    if (next === 'completed' && (ev.status !== 'completed' || ev.timestamp === 'Pending')) {
      return { ...ev, status: next, timestamp: now };
    }
    return { ...ev, status: next };
  });
}

const fmt = (n: number) => `GH₵ ${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const AdminDashboardView: React.FC = () => {
  const { isAdmin, isAuthLoading, goToScreen, refreshCatalog } = useApp();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [payFilter, setPayFilter] = useState<'all' | PaymentStatus>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [o, p] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('products').select('*').order('name'),
    ]);
    if (o.error) setError(o.error.message);
    else setOrders((o.data || []).map(rowToOrder));
    if (p.data) setProducts(p.data.map(rowToProduct));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const ch = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const row: any = payload.new;
        if (!row?.id) return;
        const o = rowToOrder(row);
        setOrders((prev) => (prev.some((x) => x.id === o.id) ? prev.map((x) => (x.id === o.id ? o : x)) : [o, ...prev]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [isAdmin, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (payFilter !== 'all' && o.paymentStatus !== payFilter) return false;
      if (!q) return true;
      return [o.id, o.traceCode, o.customerName, o.customerPhone, o.customerEmail, o.deliveryAddress?.area]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, statusFilter, payFilter, query]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const paid = orders.filter((o) => o.paymentStatus === 'paid');
    return {
      revenue: paid.reduce((s, o) => s + o.total, 0),
      todayCount: orders.filter((o) => o.createdAt && new Date(o.createdAt).toDateString() === today).length,
      toDispatch: orders.filter((o) => o.status === 'Order Placed' && (o.paymentStatus === 'paid' || o.paymentStatus === 'pay_on_delivery')).length,
      awaitingPay: orders.filter((o) => o.paymentStatus === 'pending').length,
    };
  }, [orders]);

  const updateOrder = async (o: Order, patch: Record<string, unknown>) => {
    setBusyId(o.id);
    const { error: e } = await supabase.from('orders').update(patch).eq('id', o.id);
    setBusyId(null);
    if (e) setError(e.message);
  };

  const changeStatus = (o: Order, status: OrderStatus) =>
    updateOrder(o, { status, trace_events: traceFor(o.traceEvents, status) });

  const markCashReceived = (o: Order) =>
    updateOrder(o, { payment_status: 'paid', paid_at: new Date().toISOString() });

  const exportCsv = () => {
    const head = ['Order', 'Date', 'Customer', 'Phone', 'Email', 'Area', 'Items', 'Total (GHS)', 'Payment', 'Payment status', 'Status', 'Reference'];
    const rows = filtered.map((o) => [
      o.id, o.createdAt || '', o.customerName || '', o.customerPhone || '', o.customerEmail || '', o.deliveryAddress?.area || '',
      o.items.map((i) => `${i.quantity}x ${i.product.name}`).join('; '), o.total, o.paymentMethod?.details || '',
      o.paymentStatus || '', o.status, o.paymentReference || '',
    ]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `agricomplus-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveProduct = async (p: Product, patch: { price: number; stock_count: number; in_stock: boolean }) => {
    setBusyId(p.id);
    const { error: e } = await supabase.from('products').update(patch).eq('id', p.id);
    setBusyId(null);
    if (e) return setError(e.message);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, price: patch.price, stockCount: patch.stock_count, inStock: patch.in_stock } : x)));
    refreshCatalog();
  };

  if (isAuthLoading) return <div className="p-8 text-center text-sm text-stone-500">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-stone-400" />
        <p className="font-bold text-stone-800">Admin access only</p>
        <p className="text-xs text-stone-500">Your account doesn't have the admin role.</p>
        <button onClick={() => goToScreen({ type: 'home' })} className="px-4 py-2 rounded-full bg-[#234D33] text-white text-xs font-bold">
          Back to shop
        </button>
      </div>
    );
  }

  const card = (icon: React.ReactNode, label: string, value: string) => (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#234D33] flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-stone-400 font-bold">{label}</p>
        <p className="font-heading text-lg font-extrabold text-stone-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <header className="bg-[#234D33] text-white px-4 sm:px-8 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => goToScreen({ type: 'account' })} aria-label="Back" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-base font-bold">AgriCom+ Admin</h1>
            <p className="text-[11px] text-emerald-200">Orders, payments & stock</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-5 space-y-5">
        {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {card(<Wallet className="w-5 h-5" />, 'Paid revenue', fmt(stats.revenue))}
          {card(<Package className="w-5 h-5" />, 'Orders today', String(stats.todayCount))}
          {card(<Truck className="w-5 h-5" />, 'Ready to dispatch', String(stats.toDispatch))}
          {card(<Clock className="w-5 h-5" />, 'Awaiting payment', String(stats.awaitingPay))}
        </div>

        <div className="flex gap-1 bg-stone-200/60 p-1 rounded-full w-fit">
          {(['orders', 'products'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-1.5 rounded-full text-xs font-bold capitalize ${tab === t ? 'bg-white text-[#234D33] shadow-xs' : 'text-stone-500'}`}>
              {t} {t === 'orders' ? `(${orders.length})` : `(${products.length})`}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <section className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, customer, phone, area…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={payFilter} onChange={(e) => setPayFilter(e.target.value as any)} className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs">
                <option value="all">All payments</option>
                {(Object.keys(payBadge) as PaymentStatus[]).map((k) => <option key={k} value={k}>{payBadge[k].label}</option>)}
              </select>
              <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#234D33] text-white text-xs font-bold">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>

            {loading && orders.length === 0 ? (
              <p className="text-center text-xs text-stone-500 py-10">Loading orders…</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xs text-stone-500 py-10">No orders match.</p>
            ) : (
              filtered.map((o) => {
                const pb = payBadge[o.paymentStatus || 'pending'];
                const open = expanded === o.id;
                return (
                  <div key={o.id} className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden">
                    <button onClick={() => setExpanded(open ? null : o.id)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="min-w-[150px]">
                        <p className="font-mono text-xs font-bold text-stone-900">{o.id}</p>
                        <p className="text-[11px] text-stone-400">{o.placedAt}</p>
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <p className="text-xs font-semibold text-stone-800">{o.customerName || 'Customer'}</p>
                        <p className="text-[11px] text-stone-500">{o.deliveryAddress?.area}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pb.cls}`}>{pb.label}</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">{o.status}</span>
                      <span className="font-heading text-sm font-extrabold text-[#234D33] ml-auto">{fmt(o.total)}</span>
                    </button>

                    {open && (
                      <div className="border-t border-stone-100 p-4 grid md:grid-cols-2 gap-4 text-xs bg-stone-50/60">
                        <div className="space-y-2">
                          <p className="font-bold text-stone-900">Items</p>
                          {o.items.map((i) => (
                            <div key={i.product.id} className="flex justify-between text-stone-600">
                              <span>{i.quantity}× {i.product.name}</span><span>{fmt(i.product.price * i.quantity)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-stone-500 border-t border-stone-200 pt-1"><span>Delivery</span><span>{fmt(o.deliveryFee)}</span></div>
                          <div className="flex justify-between font-bold text-stone-900"><span>Total</span><span>{fmt(o.total)}</span></div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-stone-900">Deliver to</p>
                          <p className="flex items-start gap-1.5 text-stone-600"><MapPin className="w-3.5 h-3.5 mt-0.5 text-[#3A7D44]" />{o.deliveryAddress?.title} — {o.deliveryAddress?.area}, {o.deliveryAddress?.landmark}</p>
                          <a href={`tel:${o.customerPhone}`} className="flex items-center gap-1.5 text-[#234D33] font-semibold"><Phone className="w-3.5 h-3.5" />{o.customerPhone}</a>
                          <p className="text-stone-500">{o.customerEmail}</p>
                          <p className="text-stone-500">Payment: {o.paymentMethod?.details}{o.paymentReference ? ` · ref ${o.paymentReference}` : ''}</p>
                          <p className="text-stone-400 font-mono">{o.traceCode}</p>

                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <select
                              value={o.status}
                              disabled={busyId === o.id || o.paymentStatus === 'pending' || o.paymentStatus === 'failed'}
                              onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                            >
                              {STATUSES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            {o.paymentStatus === 'pay_on_delivery' && (
                              <button disabled={busyId === o.id} onClick={() => markCashReceived(o)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Cash received
                              </button>
                            )}
                          </div>
                          {(o.paymentStatus === 'pending' || o.paymentStatus === 'failed') && (
                            <p className="text-[11px] text-amber-700">Status changes unlock once payment is confirmed.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        )}

        {tab === 'products' && (
          <section className="space-y-2">
            {products.map((p) => <ProductRow key={p.id} p={p} busy={busyId === p.id} onSave={saveProduct} />)}
          </section>
        )}
      </main>
    </div>
  );
};

const ProductRow: React.FC<{ p: Product; busy: boolean; onSave: (p: Product, patch: { price: number; stock_count: number; in_stock: boolean }) => void }> = ({ p, busy, onSave }) => {
  const [price, setPrice] = useState(String(p.price));
  const [stock, setStock] = useState(String(p.stockCount));
  const [inStock, setInStock] = useState(p.inStock);
  const dirty = Number(price) !== p.price || Number(stock) !== p.stockCount || inStock !== p.inStock;
  const valid = Number(price) >= 0 && Number.isInteger(Number(stock)) && Number(stock) >= 0;
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-3 flex flex-wrap items-center gap-3 text-xs">
      <img src={p.images[0]} alt="" className="w-11 h-11 rounded-xl object-cover bg-stone-100" />
      <div className="flex-1 min-w-[140px]">
        <p className="font-bold text-stone-900">{p.name}</p>
        <p className="text-stone-400">{p.unit} · {p.category}</p>
      </div>
      <label className="flex items-center gap-1 text-stone-500">GH₵
        <input type="number" min={0} step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} className="w-20 px-2 py-1.5 rounded-lg border border-stone-200" />
      </label>
      <label className="flex items-center gap-1 text-stone-500">Stock
        <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="w-20 px-2 py-1.5 rounded-lg border border-stone-200" />
      </label>
      <label className="flex items-center gap-1 text-stone-500"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> Listed</label>
      <button disabled={!dirty || !valid || busy} onClick={() => onSave(p, { price: Number(price), stock_count: Number(stock), in_stock: inStock })}
        className="px-3 py-1.5 rounded-lg bg-[#234D33] text-white font-bold disabled:opacity-30">
        {busy ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
};
