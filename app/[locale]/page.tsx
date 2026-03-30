import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient()

  // 1. เช็คสถานะการล็อกอินก่อนเรนเดอร์หน้าเว็บ
  const { data: { user } } = await supabase.auth.getUser()

  // 2. กำหนด Path เป้าหมาย (ถ้าล็อกอินแล้วให้ไป Dashboard เลย ถ้ายังให้ไป Login)
  const targetPath = user ? `/${locale}/dashboard` : `/${locale}/login`

  return (
    <div className="min-h-screen bg-[#0d0f17] text-white font-sans overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8a76ff]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00e6a3]/5 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-3xl">
          <h2 className="text-[#8a76ff] font-bold tracking-[0.2em] uppercase text-sm mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">Future of Learning</h2>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            ค้นหาติวเตอร์ที่ใช่ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">เรียนรู้ได้ทุกที่</span>
          </h1>
          
          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            {/* ปุ่มเดียวจบ: ถ้ายังไม่ล็อกอินจะไปหน้า Login/Register รวมกัน ถ้าล็อกอินแล้วเข้า Dashboard เลย */}
            <Link 
              href={targetPath}
              className="px-10 py-5 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-xl shadow-blue-500/20 active:scale-95"
            >
              {user ? 'เข้าสู่ Dashboard ของคุณ' : 'เริ่มต้นใช้งานฟรี'}
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {[
            { t: 'นัดหมายง่าย', d: 'เลือกระบุวันเวลาที่สะดวกผ่านระบบปฏิทินอัจฉริยะ', i: '📅' },
            { t: 'จ่ายเงินปลอดภัย', d: 'มั่นใจทุกธุรกรรมด้วยระบบชำระเงินมาตรฐาน (เร็วๆ นี้)', i: '🔒' },
            { t: 'เรียนรู้ได้จริง', d: 'เน้นการเรียนแบบตัวต่อตัวเพื่อประสิทธิภาพสูงสุด', i: '🚀' }
          ].map((item, idx) => (
            <div key={idx} className="p-8 bg-[#1a1c23]/50 border border-gray-800 rounded-[2.5rem] hover:bg-[#1a1c23] transition-all hover:-translate-y-2 group shadow-2xl shadow-black/20">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{item.i}</div>
              <h3 className="text-2xl font-black mb-3">{item.t}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-bold">{item.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}