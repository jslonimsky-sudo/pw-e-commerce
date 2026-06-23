import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      console.log('[WEBHOOK DEBUG] paymentId:', paymentId);
      if (!paymentId) return NextResponse.json({ ok: true });

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      console.log('[WEBHOOK DEBUG] mpResponse.ok:', mpResponse.ok, 'mpResponse.status:', mpResponse.status);

      if (!mpResponse.ok) return NextResponse.json({ ok: true });

      const payment = await mpResponse.json();
      console.log('[WEBHOOK DEBUG] payment.status:', payment.status, 'payment.external_reference:', payment.external_reference);

      const orderId = payment.external_reference;
      console.log('[WEBHOOK DEBUG] orderId:', orderId);

      if (orderId) {
        const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();
        console.log('[WEBHOOK DEBUG] existingOrder:', existingOrder, 'existingOrderError:', existingOrderError);

        if (payment.status === 'approved') {
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
        } else if (payment.status === 'rejected') {
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
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
