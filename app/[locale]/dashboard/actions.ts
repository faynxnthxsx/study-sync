'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResponse = {
  success: boolean
  message: string
  timestamp?: number
}

// 1. สร้างคอร์สเรียน (Tutor)
export async function createCourse(prevState: any, formData: FormData): Promise<ActionResponse> {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  if (!title || !description) return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน', timestamp: Date.now() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized', timestamp: Date.now() }

  const { error } = await supabase.from('courses').insert({ tutor_id: user.id, title, description })
  if (error) return { success: false, message: error.message, timestamp: Date.now() }
  
  revalidatePath('/', 'layout')
  return { success: true, message: '✨ สร้างคอร์สเรียนสำเร็จ!', timestamp: Date.now() }
}

// 2. ลงเวลาว่าง (Tutor)
export async function addAvailabilitySlot(prevState: any, formData: FormData): Promise<ActionResponse> {
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  if (!date || !startTime || !endTime) return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน', timestamp: Date.now() }

  const startDateTime = new Date(`${date}T${startTime}:00+07:00`).toISOString()
  const endDateTime = new Date(`${date}T${endTime}:00+07:00`).toISOString()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized', timestamp: Date.now() }

  const { error } = await supabase.from('availability_slots').insert({ tutor_id: user.id, start_time: startDateTime, end_time: endDateTime, is_booked: false })
  if (error) return { success: false, message: error.message, timestamp: Date.now() }
  
  revalidatePath('/', 'layout')
  return { success: true, message: '⏰ บันทึกเวลาว่างสำเร็จ!', timestamp: Date.now() }
}

// 3. แก้ไขคอร์สเรียน (Tutor)
export async function updateCourseAction(courseId: string, title: string, description: string): Promise<ActionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { error } = await supabase.from('courses').update({ title, description }).eq('id', courseId).eq('tutor_id', user.id)
  if (error) return { success: false, message: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true, message: '✅ อัปเดตข้อมูลสำเร็จ!', timestamp: Date.now() }
}

// 4. ลบคอร์สเรียน (Tutor)
export async function deleteCourse(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('courses').delete().eq('id', courseId).eq('tutor_id', user.id)
  revalidatePath('/', 'layout')
}

// 5. ลบเวลาว่าง (Tutor)
export async function deleteSlot(slotId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('availability_slots').delete().eq('id', slotId).eq('tutor_id', user.id).eq('is_booked', false)
  revalidatePath('/', 'layout')
}

// 6. อัปเดตโปรไฟล์
export async function updateProfile(prevState: any, formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized', timestamp: Date.now() }

  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const contactLink = formData.get('contact_link') as string
  const avatarFile = formData.get('avatar') as File | null

  if (!fullName) return { success: false, message: 'กรุณากรอกชื่อ-นามสกุล', timestamp: Date.now() }

  let avatarUrl = undefined
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true })
    if (uploadError) return { success: false, message: 'อัปโหลดรูปไม่สำเร็จ: ' + uploadError.message, timestamp: Date.now() }
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    avatarUrl = publicUrlData.publicUrl
  }

  const updateData: any = { full_name: fullName, bio, contact_link: contactLink }
  if (avatarUrl) updateData.avatar_url = avatarUrl

  const { error: updateError } = await supabase.from('profiles').update(updateData).eq('id', user.id)
  if (updateError) return { success: false, message: 'อัปเดตโปรไฟล์ไม่สำเร็จ: ' + updateError.message, timestamp: Date.now() }

  revalidatePath('/', 'layout')
  return { success: true, message: '✅ อัปเดตโปรไฟล์เรียบร้อย!', timestamp: Date.now() }
}

// 7. จองเรียน (Student)
export async function bookSession(courseId: string, tutorId: string, slotId: string): Promise<ActionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาล็อกอินก่อนจอง', timestamp: Date.now() }

  const { data: updatedSlot, error: updateError } = await supabase.from('availability_slots').update({ is_booked: true }).eq('id', slotId).eq('is_booked', false).select().single()
  if (updateError || !updatedSlot) return { success: false, message: 'แย่งไม่ทัน! เวลานี้เพิ่งถูกจองไปเมื่อกี้เลย', timestamp: Date.now() }

  const { error: bookingError } = await supabase.from('bookings').insert({ student_id: user.id, tutor_id: tutorId, course_id: courseId, slot_id: slotId, status: 'confirmed' })
  if (bookingError) {
    await supabase.from('availability_slots').update({ is_booked: false }).eq('id', slotId)
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + bookingError.message, timestamp: Date.now() }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: '🎉 จองคลาสเรียนสำเร็จ!', timestamp: Date.now() }
}

// 8. ยกเลิกการจอง (Student)
export async function cancelBooking(bookingId: string, slotId: string): Promise<ActionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized', timestamp: Date.now() }

  const { error: deleteError } = await supabase.from('bookings').delete().eq('id', bookingId)
  if (deleteError) return { success: false, message: 'ไม่สามารถยกเลิกได้', timestamp: Date.now() }

  await supabase.from('availability_slots').update({ is_booked: false }).eq('id', slotId)
  revalidatePath('/', 'layout')
  return { success: true, message: '🗑️ ยกเลิกการจองเรียบร้อย', timestamp: Date.now() }
}

// 9. ส่งรีวิว (Student - รองรับ useActionState)
export async function submitReview(prevState: any, formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาล็อกอินก่อนรีวิว', timestamp: Date.now() }

  const booking_id = formData.get('booking_id') as string
  const tutor_id = formData.get('tutor_id') as string
  const rating = Number(formData.get('rating'))
  const comment = formData.get('comment') as string

  if (!rating || rating < 1) return { success: false, message: 'กรุณาให้คะแนนอย่างน้อย 1 ดาว', timestamp: Date.now() }

  const { error } = await supabase.from('reviews').insert({
    student_id: user.id,
    tutor_id,
    booking_id,
    rating,
    comment
  })

  if (error) {
    if (error.code === '23505') return { success: false, message: 'คุณเคยรีวิวคลาสนี้ไปแล้ว', timestamp: Date.now() }
    return { success: false, message: 'รีวิวไม่สำเร็จ: ' + error.message, timestamp: Date.now() }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'ขอบคุณสำหรับคะแนนรีวิวครับ! ✨', timestamp: Date.now() }
}

// 10. ออกจากระบบ
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return redirect('/')
}