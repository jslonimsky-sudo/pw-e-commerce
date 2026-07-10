import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/api/auth-helper.js';
import { updateOrderStatus } from '../../../../../lib/api/orders.js';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'failed', 'cancelled'];

export async function PATCH(request, { params }) {
  const { user, error } = await getAdminFromRequest(request);

  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const { error: updateError } = await updateOrderStatus(id, status);

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
