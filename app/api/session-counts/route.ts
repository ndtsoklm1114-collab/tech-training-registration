import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SESSIONS, MAX_PER_SESSION } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('training_registrations')
      .select('session');

    if (error) {
      console.error('Supabase select error:', error);
      return NextResponse.json({}, { status: 500 });
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row: { session: string }) => {
      counts[row.session] = (counts[row.session] || 0) + 1;
    });

    const result: Record<string, { count: number; remaining: number }> = {};
    SESSIONS.forEach((s) => {
      const count = counts[s.value] || 0;
      result[s.value] = { count, remaining: MAX_PER_SESSION - count };
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error('Session counts error:', e);
    return NextResponse.json({}, { status: 500 });
  }
}
