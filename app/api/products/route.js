import { NextResponse } from 'next/server';
import { getProducts } from '../../../lib/api/products.js';

export async function GET() {
  try {
    const products = await getProducts();
    if (!products) {
      return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 });
    }
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 });
  }
}
