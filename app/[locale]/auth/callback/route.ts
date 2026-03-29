import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // เช็ค Path ให้ตรงกับโปรเจกต์คุณ

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> } 
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // 1. Await params เสมอ ป้องกัน /undefined/
  const { locale } = await context.params;

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=missing_code`);
  }

  // 2. Exchange Code for Session
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth Callback Error:', error.message);
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`);
  }
  
  // 3. ถ้าสำเร็จ ให้เด้งไป Dashboard พร้อม Locale ที่ถูกต้อง
  return NextResponse.redirect(`${origin}/${locale}/dashboard`);
}