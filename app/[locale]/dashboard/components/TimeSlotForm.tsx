'use client'

import { useState, useEffect, useActionState } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { SubmitButton } from './SubmitButton'

// 🌟 Import Action เข้ามาตรงๆ จากไฟล์ actions.ts
import { ActionResponse, addAvailabilitySlot } from '../actions'

// 🌟 ลบ Props ออก ไม่รับผ่านพารามิเตอร์แล้ว
export function TimeSlotForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const t = useTranslations('Dashboard')

  const initialState: ActionResponse = { success: false, message: '' }
  
  // 🌟 ผูกกับ Action ที่ Import มา
  const [state, formAction] = useActionState(addAvailabilitySlot, initialState)

  useEffect(() => {
    if (state.timestamp) {
      if (state.success) {
        toast.success(state.message) 
        setSelectedDate(null)
        setStartTime(null)
        setEndTime(null)
      } else {
        toast.error(state.message) 
      }
    }
  }, [state])

  return (
    <div className="bg-white dark:bg-[#1a1c23]/80 dark:backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors duration-300 relative">
      <h2 className="text-xl font-bold mb-6 text-[#0066ff] dark:text-[#00e6a3]">⏰ {t('set_time')}</h2>
      
      <form action={formAction} className="space-y-5">
        
        {/* Hidden inputs เพื่อส่งค่าวันที่และเวลาที่ผ่านการ Format แล้วเข้า formData */}
        <input type="hidden" name="date" value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} required />
        <input type="hidden" name="startTime" value={startTime ? format(startTime, 'HH:mm') : ''} required />
        <input type="hidden" name="endTime" value={endTime ? format(endTime, 'HH:mm') : ''} required />

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t('select_date')}</label>
          <div className="relative">
            <DatePicker 
              selected={selectedDate} 
              onChange={(date: Date | null) => setSelectedDate(date)} 
              dateFormat="dd MMMM yyyy" 
              placeholderText={t('date_placeholder')} 
              className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3.5 pl-10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#0066ff] dark:focus:border-[#00e6a3] transition-colors cursor-pointer" 
            />
            <span className="absolute left-3.5 top-3.5 text-slate-400">📅</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t('start_time')}</label>
            <div className="relative">
              <DatePicker 
                selected={startTime} 
                onChange={(date: Date | null) => setStartTime(date)} 
                showTimeSelect 
                showTimeSelectOnly 
                timeIntervals={30} 
                timeCaption="เวลา" 
                dateFormat="HH:mm" 
                placeholderText="00:00" 
                className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3.5 pl-10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#0066ff] dark:focus:border-[#00e6a3] transition-colors cursor-pointer" 
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400">⏰</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t('end_time')}</label>
            <div className="relative">
              <DatePicker 
                selected={endTime} 
                onChange={(date: Date | null) => setEndTime(date)} 
                showTimeSelect 
                showTimeSelectOnly 
                timeIntervals={30} 
                timeCaption="เวลา" 
                dateFormat="HH:mm" 
                placeholderText="00:00" 
                className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-gray-700 p-3.5 pl-10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#0066ff] dark:focus:border-[#00e6a3] transition-colors cursor-pointer" 
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400">⏰</span>
            </div>
          </div>
        </div>

        <SubmitButton 
          defaultText={t('btn_save_slot')} 
          loadingText="กำลังบันทึก" 
          disabled={!selectedDate || !startTime || !endTime} 
        />
      </form>
    </div>
  )
}