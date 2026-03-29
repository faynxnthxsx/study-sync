'use client'

import { useState } from 'react'
import { updateCourseAction, deleteCourse } from '../actions'
import { toast } from 'sonner'

export function CourseItem({ course }: { course: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(course.title)
  const [desc, setDesc] = useState(course.description)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    const res = await updateCourseAction(course.id, title, desc)
    if (res.success) {
      toast.success(res.message)
      setIsEditing(false)
    } else {
      toast.error(res.message || 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  if (isEditing) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-3 animate-in fade-in zoom-in-95">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded-lg border border-blue-300 dark:bg-[#0d0f17] outline-none text-sm font-bold"
        />
        <textarea 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)}
          className="w-full p-2 rounded-lg border border-blue-300 dark:bg-[#0d0f17] outline-none text-xs min-h-[80px]"
        />
        <div className="flex gap-2">
          <button onClick={handleUpdate} disabled={loading} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-slate-200 dark:bg-gray-700 text-xs font-bold rounded-lg">
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1a1c23] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md group">
      <h4 className="font-bold text-[#0066ff] dark:text-[#8a76ff]">{course.title}</h4>
      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{course.description}</p>
      <div className="mt-4 flex gap-2 border-t border-slate-100 dark:border-gray-800 pt-3">
        <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">✏️ แก้ไข</button>
        <button onClick={async () => { if(confirm('ต้องการลบวิชานี้ใช่ไหม?')) await deleteCourse(course.id) }} className="ml-auto text-xs font-bold text-red-400 hover:text-red-600 transition-colors">🗑️ ลบ</button>
      </div>
    </div>
  )
}