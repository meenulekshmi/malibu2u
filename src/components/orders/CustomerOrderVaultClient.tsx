'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  MapPin,
  Upload,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  condition: string;
  product: {
    id: string;
    name: string;
    platform: string;
    images?: { url: string }[];
  };
}

interface OrderVaultProps {
  initialOrders: any[];
  supportWhatsAppNumber: string;
}

export function CustomerOrderVaultClient({ initialOrders, supportWhatsAppNumber }: OrderVaultProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [selectedProofOrder, setSelectedProofOrder] = useState<any | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofMsg, setProofMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
      case 'PAYMENT_PENDING':
        return 0;
      case 'CONFIRMED':
      case 'ADVANCE_PAID':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'PACKED':
        return 3;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Screenshot is too large. Please select an image under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProofImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProofOrder || !utrNumber.trim()) return;

    setSubmittingProof(true);
    setProofMsg(null);

    try {
      const res = await fetch('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedProofOrder.id,
          reference: utrNumber.trim(),
          proofUrl: proofImage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment verification proof');
      }

      setProofMsg({
        type: 'success',
        text: 'Payment proof submitted successfully! Verification is in progress.',
      });

      // Update local order state
      setOrders(
        orders.map((o) =>
          o.id === selectedProofOrder.id
            ? { ...o, paymentStatus: 'PROOF_SUBMITTED', paymentReference: utrNumber.trim() }
            : o
        )
      );

      setTimeout(() => {
        setSelectedProofOrder(null);
        setUtrNumber('');
        setProofImage('');
      }, 1500);
    } catch (err: any) {
      setProofMsg({ type: 'error', text: err.message || 'Error submitting proof' });
    } finally {
      setSubmittingProof(false);
    }
  };

  const openWhatsAppChat = (order: any) => {
    const norm = normalizeWhatsAppNumber(supportWhatsAppNumber);
    const msg = `Hi Malibu2u, I would like to check the status or payment of my Order #${order.trackingNumber || order.id?.slice(0, 8)}.`;
    window.open(`https://wa.me/${norm}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const step = getStatusStepIndex(order.status);
        const isCancelled = order.status === 'CANCELLED';

        let parsedAddress: any = null;
        try {
          parsedAddress = order.shippingAddressJson ? JSON.parse(order.shippingAddressJson) : null;
        } catch (e) {}

        const isPaymentRequired =
          order.paymentStatus === 'PENDING' ||
          order.paymentStatus === 'REJECTED' ||
          order.status === 'PAYMENT_PENDING';

        return (
          <div
            key={order.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6 shadow-2xl transition-all"
          >
            {/* Header / Tracking */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  MALIBU2U ORDER INVOICE
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-lg font-extrabold text-white font-mono">
                    #{order.trackingNumber || order.id.slice(0, 8)}
                  </h3>
                  <span className="text-slate-400 font-mono">
                    Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono border ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : order.paymentStatus === 'PROOF_SUBMITTED'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  Payment: {order.paymentStatus}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-800 text-white border border-slate-700 uppercase font-mono">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Live Order Timeline Progress */}
            {!isCancelled ? (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Order Timeline & Status
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                  {[
                    { label: 'Order Placed', idx: 0 },
                    { label: 'Confirmed', idx: 1 },
                    { label: 'Processing', idx: 2 },
                    { label: 'Packed', idx: 3 },
                    { label: 'Delivered', idx: 5 },
                  ].map((s, i) => {
                    const isDone = step >= s.idx;
                    const isCurrent = (step === s.idx) || (step === 4 && s.idx === 3);
                    return (
                      <div key={i} className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`leading-tight ${isCurrent ? 'text-cyan-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-600'}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>This order was cancelled. If you have any inquiries, please connect on WhatsApp.</span>
              </div>
            )}

            {/* Manual Payment Verification Callout */}
            {isPaymentRequired && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#111726] to-cyan-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h4 className="font-extrabold text-white text-xs">Payment Verification Required</h4>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Please transfer <strong className="text-emerald-400 font-mono">₹{order.totalAmount.toLocaleString()}</strong> to our UPI ID or submit your transaction reference below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProofOrder(order);
                      setUtrNumber(order.paymentReference || '');
                      setProofMsg(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    Submit Payment UTR / Proof
                  </button>
                  <button
                    onClick={() => openWhatsAppChat(order)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Pay via WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Order Items ({order.items?.length || 0})
              </span>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/60">
                {order.items?.map((item: OrderItem) => {
                  const image =
                    item.product?.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                          <Image src={image} alt={item.product?.name || 'Product'} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{item.product?.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Qty: <strong className="text-white">{item.quantity}</strong> • Platform:{' '}
                            <span className="text-cyan-400">{item.product?.platform}</span> • Condition:{' '}
                            <span className="text-emerald-400">{item.condition}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-extrabold text-white text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ₹{item.price.toLocaleString()} each
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Address & Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Confirmed Delivery Address Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Delivery Address Snapshot
                </span>
                {parsedAddress ? (
                  <div className="text-slate-300 space-y-0.5 text-xs">
                    <p className="font-extrabold text-white">{parsedAddress.fullName}</p>
                    <p>{parsedAddress.addressLine1} {parsedAddress.addressLine2 ? `, ${parsedAddress.addressLine2}` : ''}</p>
                    {parsedAddress.landmark && <p className="text-slate-400 text-[11px]">Landmark: {parsedAddress.landmark}</p>}
                    <p>{parsedAddress.city}{parsedAddress.district ? `, ${parsedAddress.district}` : ''}, {parsedAddress.state} - <strong className="font-mono text-white">{parsedAddress.postalCode}</strong></p>
                    <p className="text-cyan-400 font-mono pt-1">Phone: {parsedAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Address details pending WhatsApp confirmation.</p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Payment & Billing Summary
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Order Subtotal:</span>
                    <span>₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Payment Method:</span>
                    <span className="font-bold text-white">{order.paymentMethod}</span>
                  </div>
                  {order.paymentReference && (
                    <div className="flex justify-between text-cyan-400">
                      <span>UTR / Reference:</span>
                      <span className="font-bold">{order.paymentReference}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-bold text-white">Total Amount:</span>
                    <span className="text-lg font-black text-cyan-400">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Malibu2u 7-Day Replacement Guarantee & Verified Delivery</span>
              </div>
              <button
                onClick={() => openWhatsAppChat(order)}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Support & Updates &rarr;
              </button>
            </div>
          </div>
        );
      })}

      {/* Payment Proof Submission Modal */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                PAYMENT VERIFICATION DESK
              </span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                Submit Proof for Order #{selectedProofOrder.trackingNumber || selectedProofOrder.id.slice(0, 8)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Amount: <strong className="text-emerald-400 font-mono">₹{selectedProofOrder.totalAmount.toLocaleString()}</strong>
              </p>
            </div>

            {proofMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  proofMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {proofMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitPaymentProof} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  UPI Transaction ID / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 412356789012"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Payment Screenshot (Optional)
                </label>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all text-xs w-full justify-center">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Upload Screenshot from Device</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>

                  {proofImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={proofImage} alt="Payment Proof Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedProofOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof || !utrNumber.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {submittingProof ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
