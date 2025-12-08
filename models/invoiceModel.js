import supabase from './supabaseServerClient.js';

const table = 'invoice';


export async function listInvoices() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('InvoiceID');

  if (error) throw error;
  return data;
}


export async function getInvoice(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('InvoiceID', id)
    .single();

  if (error) throw error;
  return data;
}


export async function createInvoice(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}


export async function updateInvoice(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('InvoiceID', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}


export async function deleteInvoice(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('InvoiceID', id);

  if (error) throw error;
  return true;
}
