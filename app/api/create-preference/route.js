import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('API llamada con:', body);

    const { items, userId, orderId } = body;

    if (!items || !userId || !orderId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const productIds = items.map(item => item.product_id).filter(Boolean);

    if (productIds.length > 0) {
      const { data: products, error: stockError } = await supabase
        .from('products')
        .select('id, name, stock')
        .in('id', productIds);

      if (stockError) {
        return NextResponse.json({ error: 'Error al verificar stock' }, { status: 500 });
      }

      const insufficient = items
        .filter(item => item.product_id)
        .map(item => {
          const product = products.find(p => p.id === item.product_id);
          if (!product || item.quantity <= product.stock) return null;
          return {
            product_id: product.id,
            name: product.name,
            solicitado: item.quantity,
            disponible: product.stock,
          };
        })
        .filter(Boolean);

      if (insufficient.length > 0) {
        return NextResponse.json(
          { error: 'stock_insuficiente', items: insufficient },
          { status: 409 }
        );
      }
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

    console.log('Preferencia:', response);
    return NextResponse.json({
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    return NextResponse.json({ error: 'Error al crear la preferencia de pago' }, { status: 500 });
  }
}
