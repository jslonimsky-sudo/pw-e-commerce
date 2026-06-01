import { createOrder } from '../../../lib/api/orders';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items, total } = body;

    if (!userId || !items || !total) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: userId, items, total' },
        { status: 400 }
      );
    }

    const { order, error } = await createOrder({ userId, items, total });

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear la orden' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
