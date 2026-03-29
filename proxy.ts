import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// สร้าง Instance เอาไว้ด้านนอก function เพื่อไม่ให้มัน Re-create ทุกครั้งที่มี Request
const intlProxy = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const response = intlProxy(request);
  const { supabase, supabaseResponse, user } = await updateSession(request);

  // ดึง Cookie จาก Supabase
  const setCookieHeaders = supabaseResponse.headers.getSetCookie();
  
  // 🌟 แก้ TS Error 7006: บังคับ Type ให้ cookie เป็น string
  setCookieHeaders.forEach((cookie: string) => {
    response.headers.append('Set-Cookie', cookie);
  });

  const path = request.nextUrl.pathname;
  const currentLocale = path.split('/')[1] || 'th';
  const isDashboard = path.includes('/dashboard');
  
  // Logic ป้องกัน Route
  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = `/${currentLocale}/login`;
    
    const redirectResponse = NextResponse.redirect(url);
    setCookieHeaders.forEach((cookie: string) => {
      redirectResponse.headers.append('Set-Cookie', cookie);
    });
    return redirectResponse;
  }

  if (user && isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'pending') {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/onboarding`;
      
      const redirectResponse = NextResponse.redirect(url);
      setCookieHeaders.forEach((cookie: string) => {
        redirectResponse.headers.append('Set-Cookie', cookie);
      });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};