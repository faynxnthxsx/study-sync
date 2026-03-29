'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateRole(role: string) {
  if (!role || (role !== 'student' && role !== 'tutor')) {
    throw new Error('Role ไม่ถูกต้อง')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. อัปเดตตาราง profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      role: role,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (profileError) throw new Error('Update failed')

  // 2. ถ้าเป็นติวเตอร์ สร้าง record รอไว้เลย
  if (role === 'tutor') {
    await supabase.from('tutors').upsert({ id: user.id, price_per_hour: 0 })
  }

  // 3. 🌟 สำคัญมาก: ล้างแคชหน้า Dashboard โดยตรงก่อนดีดไป
  revalidatePath('/[locale]/dashboard', 'layout')
  revalidatePath('/[locale]/onboarding', 'layout')
  revalidatePath('/', 'layout')

  // 4. ดีดไป Dashboard
  redirect('/th/dashboard')
}