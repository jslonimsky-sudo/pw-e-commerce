import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createOrder({ userId, items, total, shippingName, shippingEmail, shippingAddress }) {
  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total,
        status: 'pending',
        shipping_name: shippingName,
        shipping_email: shippingEmail,
        shipping_address: shippingAddress,
      })
      .select()
      .single();
    if (orderError) {
      return { order: null, error: orderError };
    }
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
    if (itemsError) {
      return { order: null, error: itemsError };
    }
    return { order, error: null };
  } catch (err) {
    console.error(err);
    return { order: null, error: err };
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error(error);
      return { error };
    }
    return { error: null };
  } catch (err) {
    console.error(err);
    return { error: err };
  }
}

export async function getUserOrders(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}
