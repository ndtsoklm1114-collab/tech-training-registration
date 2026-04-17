import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  const adminKey = process.env.ADMIN_KEY || 'ptrc2026';
  if (key !== adminKey) {
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('training_registrations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase select error:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // Map to match the original API response format
    const result = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      unit: row.unit,
      title: row.title,
      phone: row.phone,
      email: row.email || '',
      session: row.session,
      notes: row.notes || '',
      submitted_at: row.created_at,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error('Submissions error:', e);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
