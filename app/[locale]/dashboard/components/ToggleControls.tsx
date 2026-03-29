'use client'

import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ToggleControls({ currentLocale }: { currentLocale: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // 🌟 ป้องกัน Hydration Mismatch (รอให้ Client เรนเดอร์เสร็จก่อนค่อยโชว์ปุ่ม)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-10 w-full animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl"></div>

  // 🌟 Logic สลับภาษา (ใช้ท่า window.location.href เพื่อบังคับ Request ใหม่จาก Server)
  const toggleLanguage = () => {
    const newLocale = currentLocale === 'th' ? 'en' : 'th'
    
    // ดึง URL ปัจจุบันมา แล้วสลับ /th เป็น /en (หรือสลับกลับ)
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    
    // บังคับเบราว์เซอร์วิ่งไป URL ใหม่แบบ Hard Navigate ดึง JSON โหลดใหม่ 100%
    window.location.href = newPath
  }

  return (
    <div className="flex gap-2 w-full">
      {/* ปุ่มสลับ Theme */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0d0f17] text-slate-700 dark:text-gray-300 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-[#1a1c23] shadow-sm flex items-center justify-center gap-2"
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ปุ่มสลับภาษา */}
      <button
        onClick={toggleLanguage}
        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0d0f17] text-[#0066ff] dark:text-[#00e6a3] text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-[#1a1c23] shadow-sm flex items-center justify-center gap-2"
      >
        {currentLocale === 'th' ? '🇹🇭 TH' : '🇬🇧 EN'}
      </button>
    </div>
  )
}