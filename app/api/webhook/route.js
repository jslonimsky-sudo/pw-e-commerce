import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchPaymentByPaymentId(paymentId) {
  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });

  if (!mpResponse.ok) return null;

  const payment = await mpResponse.json();

  return { orderId: payment.external_reference, paymentStatus: payment.status };
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const queryId = searchParams.get('id');

    let body = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    let orderId = null;
    let paymentStatus = null;

    if (body?.type === 'payment') {
      const paymentId = body.data?.id;
      if (!paymentId) return NextResponse.json({ ok: true });

      const result = await fetchPaymentByPaymentId(paymentId);
      if (!result) return NextResponse.json({ ok: true });
      ({ orderId, paymentStatus } = result);
    } else if (topic === 'payment') {
      const paymentId = queryId;
      if (!paymentId) return NextResponse.json({ ok: true });

      const result = await fetchPaymentByPaymentId(paymentId);
      if (!result) return NextResponse.json({ ok: true });
      ({ orderId, paymentStatus } = result);
    } else if (topic === 'merchant_order') {
      const merchantOrderId = queryId;
      if (!merchantOrderId) return NextResponse.json({ ok: true });

      const moResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });

      if (!moResponse.ok) return NextResponse.json({ ok: true });

      const merchantOrder = await moResponse.json();

      orderId = merchantOrder.external_reference;

      if (orderId) {
        const searchResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}`,
          { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } }
        );

        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();

          const results = searchResult.results || [];
          if (results.length > 0) {
            const mostRecent = [...results].sort(
              (a, b) => new Date(b.date_created) - new Date(a.date_created)
            )[0];
            paymentStatus = mostRecent.status;
          }
        }
      }
    }

    if (orderId) {
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (paymentStatus === 'approved') {
        if (existingOrder?.status !== 'approved') {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'approved' })
            .eq('id', orderId)
            .select();

          const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId);

          for (const item of items || []) {
            await supabaseAdmin.rpc('decrement_stock', {
              product_id: item.product_id,
              amount: item.quantity,
            });
          }
        }
      } else if (paymentStatus === 'rejected') {
        if (existingOrder?.status !== 'rejected') {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'rejected' })
            .eq('id', orderId)
            .select();
        }
      }
    }

    if (orderId && !paymentStatus) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
