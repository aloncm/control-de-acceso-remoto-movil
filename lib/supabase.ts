import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cwcadrsyuhurwavinsgh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Y2FkcnN5dWh1cndhdmluc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Nzg4MDYsImV4cCI6MjA2MTU1NDgwNn0.ORS872DKQV24jR_VsORfoXc8tmD44l-I6Uwl008Ik5U';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: number;
  name: string;
  vehicle_type: string;
  plate: string;
  qr_path?: string;
  created_at: string;
}

export interface AccessLog {
  id: number;
  user_id: number;
  event: 'entrada' | 'salida';
  timestamp: string;
  users?: {
    name: string;
  };
}

export async function registerUser(name: string, vehicleType: string, plate: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          vehicle_type: vehicleType,
          plate: plate.toUpperCase(),
          qr_path: `qr_${plate.toUpperCase()}.png`
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserByPlate(plate: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('plate', plate.toUpperCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logAccess(userId: number, event: 'entrada' | 'salida') {
  try {
    const { data, error } = await supabase
      .from('access_log')
      .insert([
        {
          user_id: userId,
          event
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLastUserEvent(userId: number) {
  try {
    const { data, error } = await supabase
      .from('access_log')
      .select('event')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAccessLogs() {
  try {
    const { data, error } = await supabase
      .from('access_log')
      .select(`
        id,
        event,
        timestamp,
        users (
          name
        )
      `)
      .order('id', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId: number) {
  try {
    // First delete access logs
    await supabase
      .from('access_log')
      .delete()
      .eq('user_id', userId);

    // Then delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}