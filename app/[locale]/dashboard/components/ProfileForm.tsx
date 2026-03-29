'use client'

import { useState, useEffect, useActionState } from 'react'
import { toast } from 'sonner'
import { SubmitButton } from './SubmitButton'
import { updateProfile, ActionResponse } from '../actions'

interface ProfileFormProps {
  initialData: {
    full_name: string | null
    bio: string | null
    avatar_url: string | null
    contact_link: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  // 🌟 เพิ่ม State สำหรับคุมโหมดการแสดงผล
  const [isEditing, setIsEditing] = useState(false)
  
  const [state, formAction] = useActionState(updateProfile, { success: false, message: '' } as ActionResponse)

  useEffect(() => {
    if (state.timestamp) {
      if (state.success) {
        toast.success(state.message)
        setIsEditing(false) // 🌟 บันทึกเสร็จแล้วให้เด้งกลับไปหน้า View Mode
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  // --- 1. หน้า View Mode (ดูอย่างเดียว) ---
  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm animate-in fade-in duration-500">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-2xl font-bold tracking-tight">โปรไฟล์ของคุณ</h2>
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-bold text-[#0066ff] bg-[#0066ff]/10 rounded-xl hover:bg-[#0066ff]/20 transition-all"
          >
            ✏️ แก้ไขโปรไฟล์
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-[#0d0f17] border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
              {initialData.avatar_url ? (
                <img src={initialData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
              )}
            </div>
            <div>
              <p className="text-xl font-bold">{initialData.full_name || 'ไม่ได้ระบุชื่อ'}</p>
              <p className="text-sm text-slate-500">{initialData.contact_link || 'ไม่มีลิงก์ติดต่อ'}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-gray-800">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">เกี่ยวกับฉัน</label>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              {initialData.bio || 'ยังไม่มีข้อมูลแนะนำตัว...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- 2. หน้า Edit Mode (โหมดแก้ไข) ---
  return (
    <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-3xl border border-blue-200 dark:border-blue-900 shadow-xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">แก้ไขข้อมูลส่วนตัว</h2>
        <button 
          onClick={() => setIsEditing(false)}
          className="text-sm font-bold text-slate-400 hover:text-slate-600"
        >
          ยกเลิก
        </button>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">รูปโปรไฟล์</label>
          <input type="file" name="avatar" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">ชื่อ-นามสกุล</label>
          <input type="text" name="full_name" defaultValue={initialData.full_name || ''} className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3 rounded-xl outline-none focus:border-[#0066ff]" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">ลิงก์ติดต่อ (เช่น LINE, FB)</label>
          <input type="url" name="contact_link" defaultValue={initialData.contact_link || ''} placeholder="https://..." className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3 rounded-xl outline-none focus:border-[#0066ff]" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">แนะนำตัวสั้นๆ</label>
          <textarea name="bio" defaultValue={initialData.bio || ''} rows={4} className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3 rounded-xl outline-none focus:border-[#0066ff] resize-none" />
        </div>

        <div className="flex gap-3 pt-4">
          <SubmitButton defaultText="💾 บันทึกการเปลี่ยนแปลง" loadingText="กำลังบันทึก..." />
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
          >
            ย้อนกลับ
          </button>
        </div>
      </form>
    </div>
  )
}