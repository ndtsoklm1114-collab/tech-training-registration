import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, unit, title, phone, email, session, notes } = body;

    if (!name || !unit || !title || !phone || !session) {
      return NextResponse.json({ error: '缺少必填欄位' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('training_registrations')
      .insert([{ name, unit, title, phone, email: email || null, session, notes: notes || null }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: '報名失敗，請稍後再試' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
