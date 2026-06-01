import { getUserOrders } from '../../../../lib/api/orders';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const orders = await getUserOrders(params.userId);
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}
