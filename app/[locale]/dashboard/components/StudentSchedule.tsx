'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewForm } from './ReviewForm'
import { cancelBooking } from '../actions'
import { toast } from 'sonner'

// ✅ ต้องมีคำว่า export เพื่อให้ไฟล์อื่นเรียกใช้แบบ { StudentSchedule } ได้
export function StudentSchedule({ bookings, locale, translations }: any) {
  const [reviewingBooking, setReviewingBooking] = useState<any>(null)

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

  const handleCancel = async (bookingId: string, slotId: string) => {
    if (confirm('ยืนยันการยกเลิกจองเรียน?')) {
      const res = await cancelBooking(bookingId, slotId)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {bookings.map((b: any) => {
          // Logic: เช็คว่าเวลาสอนจบไปหรือยัง
          const isFinished = new Date() > new Date(b.availability_slots?.end_time);

          return (
            <div key={b.id} className="bg-white dark:bg-[#1a1c23] p-8 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-1">
                   <h3 className="text-lg font-black leading-tight text-slate-800 dark:text-white">{b.courses?.title}</h3>
                   {isFinished && (
                     <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md font-bold text-blue-500 uppercase">Completed</span>
                   )}
                </div>
                
                {/* ข้อมูลติวเตอร์ */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    {b.tutor?.avatar_url ? (
                      <img src={b.tutor.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="bg-slate-200 w-full h-full flex items-center justify-center text-[10px]">👤</div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold">{translations.taught_by} {b.tutor?.full_name || 'Tutor'}</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-[#0d0f17] p-4 rounded-2xl text-sm mb-4 border border-slate-50 dark:border-gray-800">
                  <p className="font-bold text-xs text-slate-600 dark:text-gray-300">📅 {formatDate(b.availability_slots?.start_time)}</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">
                    ⏰ {formatTime(b.availability_slots?.start_time)} - {formatTime(b.availability_slots?.end_time)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {isFinished ? (
                  /* 🌟 ปุ่มรีวิว เมื่อเรียนจบแล้ว */
                  <button 
                    onClick={() => setReviewingBooking(b)}
                    className="w-full py-3 text-xs font-black text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50 hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                  >
                    ⭐ ให้คะแนนการสอน
                  </button>
                ) : (
                  /* 🗑️ ปุ่มยกเลิก เมื่อยังไม่ถึงเวลาเรียน */
                  <button 
                    onClick={() => handleCancel(b.id, b.slot_id)}
                    className="w-full py-3 text-xs font-black text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-[#0d0f17] rounded-xl transition-all border border-transparent hover:border-red-100"
                  >
                    {translations.btn_cancel}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {bookings.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white dark:bg-[#1a1c23] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
            <p className="text-slate-400 italic font-bold tracking-tight text-lg">{translations.no_schedule}</p>
            <Link href="?tab=marketplace" className="text-[#0066ff] text-sm font-black mt-4 inline-block hover:underline">
              {translations.find_courses}
            </Link>
          </div>
        )}
      </div>

      {/* Modal รีวิว (เด้งขึ้นมาเมื่อมีข้อมูลใน state) */}
      {reviewingBooking && (
        <ReviewForm 
          booking={reviewingBooking} 
          onClose={() => setReviewingBooking(null)} 
        />
      )}
    </>
  )
}