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
  console.log('[WEBHOOK DEBUG] mpResponse.ok:', mpResponse.ok, 'mpResponse.status:', mpResponse.status);

  if (!mpResponse.ok) return null;

  const payment = await mpResponse.json();
  console.log('[WEBHOOK DEBUG] payment.status:', payment.status, 'payment.external_reference:', payment.external_reference);

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

    console.log(
      '[WEBHOOK DEBUG] formato detectado:',
      body?.type ? 'JSON body' : (topic ? 'query params' : 'desconocido'),
      '- topic/type:', body?.type || topic
    );

    let orderId = null;
    let paymentStatus = null;

    if (body?.type === 'payment') {
      const paymentId = body.data?.id;
      console.log('[WEBHOOK DEBUG] paymentId:', paymentId);
      if (!paymentId) return NextResponse.json({ ok: true });

      const result = await fetchPaymentByPaymentId(paymentId);
      if (!result) return NextResponse.json({ ok: true });
      ({ orderId, paymentStatus } = result);
    } else if (topic === 'payment') {
      const paymentId = queryId;
      console.log('[WEBHOOK DEBUG] paymentId:', paymentId);
      if (!paymentId) return NextResponse.json({ ok: true });

      const result = await fetchPaymentByPaymentId(paymentId);
      if (!result) return NextResponse.json({ ok: true });
      ({ orderId, paymentStatus } = result);
    } else if (topic === 'merchant_order') {
      const merchantOrderId = queryId;
      console.log('[WEBHOOK DEBUG] merchantOrderId:', merchantOrderId);
      if (!merchantOrderId) return NextResponse.json({ ok: true });

      const moResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      console.log('[WEBHOOK DEBUG] moResponse.ok:', moResponse.ok, 'moResponse.status:', moResponse.status);

      if (!moResponse.ok) return NextResponse.json({ ok: true });

      const merchantOrder = await moResponse.json();
      console.log('[WEBHOOK DEBUG] merchantOrder.external_reference:', merchantOrder.external_reference);

      orderId = merchantOrder.external_reference;

      if (orderId) {
        const searchResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}`,
          { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } }
        );
        console.log('[WEBHOOK DEBUG] searchResponse.ok:', searchResponse.ok, 'searchResponse.status:', searchResponse.status);

        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          console.log('[WEBHOOK DEBUG] payments/search results:', JSON.stringify(searchResult));

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

    console.log('[WEBHOOK DEBUG] orderId:', orderId);

    if (orderId) {
      const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      console.log('[WEBHOOK DEBUG] existingOrder:', existingOrder, 'existingOrderError:', existingOrderError);

      if (paymentStatus === 'approved') {
        if (existingOrder?.status !== 'approved') {
          const { data: approvedUpdateData, error: approvedUpdateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'approved' })
            .eq('id', orderId)
            .select();
          console.log('[WEBHOOK DEBUG] update approved -> data:', approvedUpdateData, 'error:', approvedUpdateError);

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
          const { data: rejectedUpdateData, error: rejectedUpdateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'rejected' })
            .eq('id', orderId)
            .select();
          console.log('[WEBHOOK DEBUG] update rejected -> data:', rejectedUpdateData, 'error:', rejectedUpdateError);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
