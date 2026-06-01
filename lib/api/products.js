import { supabase } from '../supabase.js';

export async function createProduct(data) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();
    if (error) {
      console.error(error);
      return { product: null, error };
    }
    return { product, error: null };
  } catch (err) {
    console.error(err);
    return { product: null, error: err };
  }
}

export async function updateProduct(id, data) {
  try {
    const { error } = await supabase
      .from('products')
      .update(data)
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

export async function deleteProduct(id) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
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

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });
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

export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
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

export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
