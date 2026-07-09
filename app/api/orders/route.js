import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/api/auth-helper.js';
import { createOrder, getUserOrders } from '../../../lib/api/orders.js';

export async function GET(request) {
  const { user, error } = await getUserFromRequest(request);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const orders = await getUserOrders(user.id);
  return NextResponse.json(orders);
}

export async function POST(request) {
  const { user, error } = await getUserFromRequest(request);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, total, shippingName, shippingEmail, shippingAddress } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items debe ser un array no vacío' }, { status: 400 });
    }

    const hasInvalidItem = items.some(item => !item.product_id || !(item.quantity > 0));
    if (hasInvalidItem) {
      return NextResponse.json({ error: 'Cada item debe tener product_id y quantity > 0' }, { status: 400 });
    }

    const { order, error: createError } = await createOrder({
      userId: user.id,
      items,
      total,
      shippingName,
      shippingEmail,
      shippingAddress,
    });

    if (createError) {
      return NextResponse.json({ error: createError }, { status: 500 });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar la orden' }, { status: 500 });
  }
}
