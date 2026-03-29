'use client'

import { useState, useActionState, useEffect } from 'react'
import { submitReview, ActionResponse } from '../actions'
import { toast } from 'sonner'

interface ReviewFormProps {
  booking: any
  onClose: () => void
}

// ✅ ต้องเป็น Named Export เพื่อให้ไฟล์อื่นเรียก { ReviewForm } ได้
export function ReviewForm({ booking, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  
  const [state, formAction, isPending] = useActionState(submitReview, { 
    success: false, 
    message: '', 
    timestamp: 0 
  } as ActionResponse)

  useEffect(() => {
    if (state.timestamp && state.timestamp > 0) {
      if (state.success) {
        toast.success(state.message)
        onClose()
      } else {
        toast.error(state.message)
      }
    }
  }, [state, onClose])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1c23] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
        <h3 className="text-xl font-black mb-1 text-slate-800 dark:text-white">ให้คะแนนการสอน ⭐</h3>
        <p className="text-xs text-slate-400 font-bold mb-6">วิชา: {booking.courses?.title}</p>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="booking_id" value={booking.id} />
          <input type="hidden" name="tutor_id" value={booking.tutor_id} />
          <input type="hidden" name="rating" value={rating} />

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="text-4xl transition-all transform active:scale-75 hover:scale-110"
              >
                <span className={(hover || rating) >= star ? "text-orange-400" : "text-slate-200 dark:text-gray-700"}>
                  ★
                </span>
              </button>
            ))}
          </div>

          <textarea
            name="comment"
            placeholder="เขียนรีวิวสั้นๆ เพื่อเป็นกำลังใจให้ติวเตอร์..."
            className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-100 dark:border-gray-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-sm transition-all"
            rows={3}
          />

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={isPending || rating === 0}
              className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isPending ? 'กำลังส่ง...' : 'ส่งรีวิว'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-all text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}