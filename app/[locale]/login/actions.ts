'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", status: 'error' }

  revalidatePath('/', 'layout')
  redirect('/th/dashboard') // หรือไป Path ที่ต้องการ
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message, status: 'error' }

  return { error: "ลงทะเบียนสำเร็จ! โปรดตรวจสอบอีเมลของคุณ", status: 'success' }
}

// 🌟 แก้ไข: รับ locale เข้ามาเป็น Parameter
export async function loginWithGoogle(locale: string = 'th') {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 🌟 บังคับใส่ Locale ใน Redirect URI
      redirectTo: `${origin}/${locale}/auth/callback`,
    },
  })

  if (error) {
    console.error('OAuth Error:', error.message)
    return redirect(`/${locale}/login?error=oauth_failed`)
  }

  if (data.url) {
    redirect(data.url) 
  }
}