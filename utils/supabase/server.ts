import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // โค้ดส่วนนี้จะทำงานถ้ามีการพยายาม set cookie จาก Server Component 
            // ซึ่งปกติ Next.js จะไม่อนุญาตให้ทำตรงๆ แต่เราใส่ดัก Error ไว้ตามมาตรฐานของ Supabase
          }
        },
      },
    }
  )
}