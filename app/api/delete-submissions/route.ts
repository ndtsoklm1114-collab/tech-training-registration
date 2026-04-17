import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, ids } = body;

    const adminKey = process.env.ADMIN_KEY || 'ptrc2026';
    if (key !== adminKey) {
      return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '請提供要刪除的 ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('training_registrations')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (e) {
    console.error('Delete error:', e);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
