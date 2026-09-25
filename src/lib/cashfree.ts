/**
 * Cashfree Payments Server SDK Integration Helper
 * Official API v3: https://www.cashfree.com/docs/payments/online/
 */

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || 'TEST_APP_ID_PLACEHOLDER';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'TEST_SECRET_KEY_PLACEHOLDER';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST'; // TEST or PRODUCTION

const BASE_URL =
  CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export interface CreateCashfreeOrderPayload {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}

export async function createCashfreeOrder(payload: CreateCashfreeOrderPayload) {
  // If API credentials are not set, return simulated sandbox payload for local development preview
  if (!process.env.CASHFREE_APP_ID || process.env.CASHFREE_APP_ID === 'TEST_APP_ID_PLACEHOLDER') {
    return {
      isDevPlaceholder: true,
      payment_session_id: `session_sandbox_${payload.orderId}`,
      cf_order_id: `cf_order_${payload.orderId}`,
      order_status: 'ACTIVE',
    };
  }

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: payload.orderId,
      order_amount: payload.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: payload.orderId,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail || 'customer@malibu2u.com',
        customer_phone: payload.customerPhone.replace(/[^0-9]/g, '').slice(-10) || '9876543210',
      },
      order_meta: {
        return_url: payload.returnUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Cashfree order creation error:', errorBody);
    throw new Error(`Cashfree order creation failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function verifyCashfreeOrder(cfOrderId: string) {
  // Dev placeholder check
  if (cfOrderId.startsWith('cf_order_') && (!process.env.CASHFREE_APP_ID || process.env.CASHFREE_APP_ID === 'TEST_APP_ID_PLACEHOLDER')) {
    return {
      isDevPlaceholder: true,
      order_id: cfOrderId,
      order_status: 'PAID',
      order_amount: 0,
      payment_session_id: `session_${cfOrderId}`,
    };
  }

  const response = await fetch(`${BASE_URL}/orders/${cfOrderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Cashfree verification error: ${response.statusText}`);
  }

  return await response.json();
}
