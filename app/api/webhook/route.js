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
      if (!paymentId) return NextResponse.json({ ok: true });

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });

      if (!mpResponse.ok) return NextResponse.json({ ok: true });

      const payment = await mpResponse.json();
      const orderId = payment.external_reference;

      if (orderId) {
        const { data: existingOrder } = await supabaseAdmin
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (payment.status === 'approved') {
          if (existingOrder?.status !== 'approved') {
            await supabaseAdmin.from('orders').update({ status: 'approved' }).eq('id', orderId);

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
            await supabaseAdmin.from('orders').update({ status: 'rejected' }).eq('id', orderId);
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
