import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. สร้าง Initial Response
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // อัปเดตฝั่ง Request Cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // สร้าง Response ใหม่เพื่อส่ง Cookies กลับไปที่ Browser
          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ดึงข้อมูล User (ต้องทำหลังจากสร้าง Client)
  const { data: { user } } = await supabase.auth.getUser()

  // Return ออกไปให้ตรงชื่อที่ proxy.ts รอรับ
  return { supabase, supabaseResponse, user }
}