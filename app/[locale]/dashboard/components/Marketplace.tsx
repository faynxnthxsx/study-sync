'use client'

import { useState, useMemo } from 'react'
import { bookSession } from '../actions'
import { toast } from 'sonner'

interface MarketplaceProps {
  courses: any[]
  availableSlots: any[]
  locale: string
}

export function Marketplace({ courses, availableSlots, locale }: MarketplaceProps) {
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Grouping Logic: 1 ติวเตอร์ = 1 การ์ด
  const groupedTutors = useMemo(() => {
    const groups: Record<string, any> = {}
    courses.forEach(course => {
      const tutorId = course.tutor_id
      if (!groups[tutorId]) {
        groups[tutorId] = { tutorInfo: course.tutors, courses: [] }
      }
      groups[tutorId].courses.push(course)
    })
    return Object.values(groups)
  }, [courses])

  // 2. Multi-field Search: ค้นหาชื่อครู, ชื่อวิชา และรายละเอียด
  const filteredTutors = groupedTutors.filter(item => {
    const q = searchQuery.toLowerCase()
    const tutorMatch = item.tutorInfo?.full_name?.toLowerCase().includes(q)
    const courseMatch = item.courses.some((c: any) => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    )
    return tutorMatch || courseMatch
  })

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

  // --- View: หน้าเลือกเวลาจอง ---
  if (selectedCourse) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedCourse(null)} className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">← ย้อนกลับ</button>
        <div className="bg-gradient-to-r from-slate-900 to-blue-600 text-white p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                <img src={selectedCourse.tutors?.avatar_url} className="w-full h-full object-cover" />
             </div>
             <div>
                <h3 className="font-black text-2xl leading-tight">{selectedCourse.title}</h3>
                <p className="opacity-80 text-sm font-bold">ตารางเวลาว่างของ {selectedCourse.tutors?.full_name}</p>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableSlots.filter(s => s.tutor_id === selectedCourse.tutor_id).map(slot => (
            <button key={slot.id} onClick={async () => {
              setLoading(true);
              const res = await bookSession(selectedCourse.id, selectedCourse.tutor_id, slot.id);
              res.success ? (toast.success(res.message), setSelectedCourse(null)) : toast.error(res.message);
              setLoading(false);
            }} disabled={loading} className="p-5 bg-white dark:bg-[#1a1c23] border border-slate-100 dark:border-gray-800 rounded-3xl text-left hover:border-blue-500 transition-all group hover:shadow-lg">
              <p className="text-sm font-bold group-hover:text-blue-600">📅 {formatDate(slot.start_time)}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">⏰ {formatTime(slot.start_time)} - {formatTime(slot.end_time)}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // --- View: หน้า Marketplace หลัก ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative max-w-xl">
        <input 
          type="text"
          placeholder="ค้นหาติวเตอร์ หรือรายวิชา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 shadow-sm transition-all"
        />
        <span className="absolute left-4 top-4 text-xl opacity-30">🔍</span>
      </div>

      <div className="space-y-6">
        {filteredTutors.map((item: any) => (
          <div key={item.tutorInfo?.id || Math.random()} className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start hover:shadow-xl transition-all">
            
            {/* 🌟 ซ้าย: Tutor Profile (ดึงรูปกลับมาแล้ว!) */}
            <div className="w-full md:w-52 flex md:flex-col items-center md:items-start text-left gap-4 flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-100 dark:bg-gray-800 overflow-hidden shadow-inner border border-slate-50 dark:border-gray-700 flex-shrink-0">
                {item.tutorInfo?.avatar_url ? (
                  <img src={item.tutorInfo.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-white leading-tight">{item.tutorInfo?.full_name}</h3>
                
                {/* แสดงดาวจริง */}
                <div className="mt-2 flex items-center gap-2">
                  {item.tutorInfo?.avgRating > 0 ? (
                    <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-800/50">
                      <span className="text-orange-500 text-xs">★</span>
                      <span className="text-xs font-black text-orange-600">{item.tutorInfo.avgRating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 font-bold">({item.tutorInfo.reviewCount})</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">New Tutor</span>
                  )}
                </div>
              </div>
            </div>

            {/* ขวา: Available Courses */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-gray-800/50 pb-2.5">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Courses</p>
                 <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase">Term 1/2026</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {item.courses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900 hover:bg-white dark:hover:bg-[#1a1c23] transition-all group shadow-sm">
                    <div className="flex-1 pr-4">
                       <h4 className="text-sm font-bold text-slate-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h4>
                       <p className="text-[11px] md:text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1 leading-snug">{course.description}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="flex-shrink-0 px-5 py-2.5 bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-gray-700 text-[#0066ff] text-[11px] md:text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white hover:border-transparent transition-all shadow-sm active:scale-95"
                    >
                      จองเรียน
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}