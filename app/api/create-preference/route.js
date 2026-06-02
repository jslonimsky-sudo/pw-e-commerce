import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
  try {
    const { items, userId, orderId } = await request.json();

    if (!items || !userId || !orderId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const preferenceClient = new Preference(client);
    const response = await preferenceClient.create({
      body: {
        items: items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${appUrl}/pago/exitoso`,
          failure: `${appUrl}/pago/fallido`,
          pending: `${appUrl}/pago/pendiente`,
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${appUrl}/api/webhook`,
      },
    });

    const init_point = response.sandbox_init_point || response.init_point;
    console.log('MP preference created. init_point:', init_point);
    return NextResponse.json({ init_point });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    return NextResponse.json({ error: 'Error al crear la preferencia de pago' }, { status: 500 });
  }
}
