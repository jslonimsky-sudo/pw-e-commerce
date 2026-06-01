import { getProductById } from '../../../../lib/api/products';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}
