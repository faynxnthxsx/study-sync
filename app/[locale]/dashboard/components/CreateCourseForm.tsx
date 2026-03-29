'use client'

import { useActionState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { SubmitButton } from './SubmitButton'
import { createCourse, ActionResponse } from '../actions'

export function CreateCourseForm() {
  const t = useTranslations('Dashboard')
  const initialState: ActionResponse = { success: false, message: '' }
  
  // 🌟 ใช้ useActionState จัดการฟอร์มเหมือนกับ TimeSlotForm
  const [state, formAction] = useActionState(createCourse, initialState)

  useEffect(() => {
    if (state.timestamp) {
      if (state.success) {
        toast.success(state.message)
        // Reset ฟอร์มเมื่อสำเร็จ
        const form = document.getElementById('create-course-form') as HTMLFormElement
        if (form) form.reset()
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <div className="bg-white dark:bg-[#1a1c23]/80 dark:backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors duration-300">
      <h2 className="text-xl font-bold mb-6 text-[#0066ff] dark:text-[#8a76ff]">{t('create_course')}</h2>
      
      {/* 🌟 เปลี่ยน action={createCourse} มาเป็น action={formAction} */}
      <form id="create-course-form" action={formAction} className="space-y-4">
        <input 
          name="title" 
          placeholder={t('course_name_placeholder')} 
          className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3 rounded-lg text-slate-900 dark:text-white focus:border-[#0066ff] dark:focus:border-[#8a76ff] outline-none transition-colors" 
          required 
        />
        <textarea 
          name="description" 
          placeholder={t('course_desc_placeholder')} 
          className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3 rounded-lg text-slate-900 dark:text-white focus:border-[#0066ff] dark:focus:border-[#8a76ff] outline-none transition-colors" 
          required 
        />
        
        {/* 🌟 เรียกใช้ SubmitButton เพื่อกันสแปมและมีโหลดดิ้งหมุนๆ */}
        <SubmitButton 
          defaultText={t('btn_create_course')} 
          loadingText="กำลังสร้างคอร์ส" 
        />
      </form>
    </div>
  )
}