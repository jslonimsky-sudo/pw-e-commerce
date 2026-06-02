import { NextResponse } from 'next/server';
import { updateOrderStatus } from '../../../lib/api/orders';

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
        if (payment.status === 'approved') {
          await updateOrderStatus(orderId, 'approved');
        } else if (payment.status === 'rejected') {
          await updateOrderStatus(orderId, 'rejected');
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
