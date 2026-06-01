import { supabase } from '../supabase.js';

export async function createOrder({ userId, items, total }) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userId, total, status: 'pending' })
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
    const { error: itemsError } = await supabase
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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
