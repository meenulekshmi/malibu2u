'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  User as UserIcon,
  Mail,
  AlertTriangle,
  ArrowRight,
  Package,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  getProductOrderWhatsAppUrl,
  getCartOrderWhatsAppUrl,
  normalizeWhatsAppNumber,
  SingleProductOrderDetails,
  CartOrderDetails,
} from '@/lib/whatsapp';

export interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
  singleProduct?: {
    id: string;
    name: string;
    sku?: string;
    category?: string;
    quantity: number;
    price: number;
    image: string;
    condition?: string;
  } | null;
  cartItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    condition?: string;
  }> | null;
  user?: {
    name: string;
    email: string;
  } | null;
}

export function OrderConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  singleProduct,
  cartItems,
  user,
}: OrderConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [generatedWhatsappUrl, setGeneratedWhatsappUrl] = useState<string | null>(null);

  // Reset local states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setStatusMessage(null);
      setErrorMessage(null);
      setCreatedOrderId(null);
      setGeneratedWhatsappUrl(null);
    }
  }, [isOpen]);

  // Listen for ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const rawWhatsappNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918078565355';
  const isWhatsappAvailable = Boolean(normalizeWhatsAppNumber(rawWhatsappNum));

  // Determine mode & calculate total
  const isSingleProduct = Boolean(singleProduct);
  let totalAmount = 0;

  if (isSingleProduct && singleProduct) {
    totalAmount = singleProduct.price * singleProduct.quantity;
  } else if (cartItems && cartItems.length > 0) {
    totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  const advanceAmount = Math.ceil(totalAmount * 0.5);
  const remainingAmount = totalAmount - advanceAmount;

  const handleConfirmAndContinueWhatsApp = async () => {
    if (!isWhatsappAvailable) {
      setErrorMessage('WhatsApp ordering is currently unavailable. Please contact Malibu2u support.');
      return;
    }

    // Attempt to pre-open popup tab during synchronous click event to bypass browser popup blockers
    let popupWin: Window | null = null;
    try {
      popupWin = window.open('about:blank', '_blank');
    } catch (e) {
      console.warn('Popup window pre-open prevented by browser:', e);
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage('Creating your order in database...');

    try {
      // 1. Prepare items payload
      let itemsPayload: Array<{ productId: string; quantity: number; condition?: string }> = [];

      if (isSingleProduct && singleProduct) {
        itemsPayload = [
          {
            productId: singleProduct.id,
            quantity: singleProduct.quantity,
            condition: singleProduct.condition || 'NEW',
          },
        ];
      } else if (cartItems && cartItems.length > 0) {
        itemsPayload = cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          condition: item.condition || 'NEW',
        }));
      }

      // 2. Call server API to create database order
      const res = await fetch('/api/orders/create-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (popupWin && !popupWin.closed) {
          popupWin.close();
        }
        setIsSubmitting(false);
        setStatusMessage(null);
        setErrorMessage(data.error || "We couldn't create your order right now. Please try again in a moment.");
        return;
      }

      // 3. Order created successfully in DB
      const orderId = data.order.orderId || data.order.trackingNumber || data.order.id;
      setCreatedOrderId(orderId);
      setStatusMessage(`Order ${orderId} created! Preparing WhatsApp...`);

      // 4. Generate WhatsApp URL containing Order ID
      let whatsappUrl: string | null = null;

      if (isSingleProduct && singleProduct) {
        const details: SingleProductOrderDetails = {
          orderId,
          productName: singleProduct.name,
          sku: singleProduct.sku,
          category: singleProduct.category,
          quantity: singleProduct.quantity,
          unitPrice: singleProduct.price,
          userName: user?.name,
          userEmail: user?.email,
        };
        whatsappUrl = getProductOrderWhatsAppUrl(details, rawWhatsappNum);
      } else if (cartItems && cartItems.length > 0) {
        const details: CartOrderDetails = {
          orderId,
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          userName: user?.name,
          userEmail: user?.email,
        };
        whatsappUrl = getCartOrderWhatsAppUrl(details, rawWhatsappNum);
      }

      setGeneratedWhatsappUrl(whatsappUrl);

      // 5. Open WhatsApp or direct location update
      if (whatsappUrl) {
        if (popupWin && !popupWin.closed) {
          popupWin.location.href = whatsappUrl;
        } else {
          try {
            const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            if (!opened) {
              window.location.href = whatsappUrl;
            }
          } catch (e) {
            window.location.href = whatsappUrl;
          }
        }
      }

      if (onSuccess) {
        onSuccess(orderId);
      }

      setIsSubmitting(false);
      setStatusMessage(null);
    } catch (err) {
      if (popupWin && !popupWin.closed) {
        popupWin.close();
      }
      console.error('Order confirmation error:', err);
      setIsSubmitting(false);
      setStatusMessage(null);
      setErrorMessage("We couldn't create your order right now. Please check network connectivity and try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-[#111827] to-cyan-950/60 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> WhatsApp Ordering MVP
            </span>
            <h2 id="order-modal-title" className="text-xl font-extrabold text-white mt-1">
              Confirm Your Order
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Review your order details before continuing on WhatsApp.
            </p>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-800">

          {/* WhatsApp Unconfigured Alert */}
          {!isWhatsappAvailable && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>WhatsApp Ordering Notice</span>
              </div>
              <p>
                WhatsApp ordering is currently unavailable. Please contact Malibu2u support to complete your request.
              </p>
              <Link
                href="/contact"
                onClick={onClose}
                className="inline-flex items-center gap-1 font-bold text-cyan-400 hover:underline"
              >
                Contact Support &rarr;
              </Link>
            </div>
          )}

          {/* Order Creation Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Order Creation Failed</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Success Banner */}
          {createdOrderId && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm">Order Created Successfully!</span>
              </div>
              <p>
                Database Order ID: <strong className="font-mono text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">{createdOrderId}</strong>
              </p>
              {generatedWhatsappUrl && (
                <div className="pt-1">
                  <a
                    href={generatedWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Click Here to Open WhatsApp Chat Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Product / Order Items Display */}
          <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" /> Item Details
            </h3>

            {isSingleProduct && singleProduct ? (
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                  <Image
                    src={singleProduct.image}
                    alt={singleProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-white leading-tight truncate">
                    {singleProduct.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>SKU: <strong className="text-slate-200">{singleProduct.sku || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="text-slate-200">{singleProduct.category || 'Gaming'}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-300 font-semibold font-mono">
                      Quantity: <strong className="text-white">{singleProduct.quantity}</strong>
                    </span>
                    <span className="font-extrabold text-cyan-400 font-mono">
                      {formatPrice(singleProduct.price * singleProduct.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ) : cartItems && cartItems.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-800/80">
                {cartItems.map((item, idx) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <div className="relative w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-[240px]">
                          {idx + 1}. {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white font-mono shrink-0 ml-2">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Payment Summary Box */}
          <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Payment Summary
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>Order Total:</span>
                <span className="font-extrabold text-white text-sm">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span className="font-bold">50% Advance (Payable Now):</span>
                <span className="font-black text-base">{formatPrice(advanceAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span className="font-bold">Remaining Balance (COD):</span>
                <span className="font-black text-base">{formatPrice(remainingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          {user && (
            <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-2 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-cyan-400" /> Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-300">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Name: <strong className="text-white">{user.name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Email: <strong className="text-white">{user.email}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* How Ordering Works Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-2 text-xs text-slate-300">
            <h4 className="font-extrabold text-cyan-300 flex items-center gap-1.5 font-mono">
              <MessageCircle className="w-4 h-4 text-emerald-400" /> How ordering works
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>Click <strong>Confirm & Continue to WhatsApp</strong> to create your database order.</li>
              <li>Your unique Order ID is generated and opened in WhatsApp.</li>
              <li>Malibu2u support shares official payment details.</li>
              <li>Pay the required <strong>50% advance</strong> ({formatPrice(advanceAmount)}).</li>
              <li>Malibu2u verifies payment and dispatches your order.</li>
            </ol>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors disabled:opacity-40"
          >
            {createdOrderId ? 'Close' : 'Cancel'}
          </button>
          {createdOrderId && generatedWhatsappUrl ? (
            <a
              href={generatedWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Open WhatsApp ({createdOrderId})</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleConfirmAndContinueWhatsApp}
              disabled={!isWhatsappAvailable || isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{statusMessage || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
                  <span>Confirm & Continue to WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
