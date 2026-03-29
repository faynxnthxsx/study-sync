'use client'

import { useTransition, useEffect } from 'react'
import { updateRole } from './actions'

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition()

  // 1. เพิ่ม useEffect เพื่อเช็คว่า Client-side JS ทำงานหรือไม่
  useEffect(() => {
    console.log("Onboarding Page Mounted - JS is alive");
  }, []);

  const handleSelect = (role: 'student' | 'tutor') => {
    alert("คลิกทำงานแล้ว!"); // <--- ถ้า Alert นี้ไม่เด้ง แปลว่าหน้าเว็บคุณ Error จน JS ไม่รัน
    console.log("Role selected:", role);
    
    startTransition(async () => {
      try {
        await updateRole(role);
      } catch (e) {
        console.error(e);
      }
    });
  };
  return (
    <div className="min-h-screen bg-[#0d0f17] flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-block p-3 bg-[#8a76ff]/10 rounded-2xl mb-6">
          <span className="text-4xl">🚀</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          ยินดีต้อนรับ! เลือกบทบาทของคุณ
        </h1>
        <p className="text-gray-400 mb-12 text-lg">
          ข้อมูลนี้จะช่วยให้เราปรับแต่งประสบการณ์ที่เหมาะสมที่สุดให้กับคุณ
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            type="button" // ระบุ type ให้ชัดเจน
            disabled={isPending}
            onClick={() => handleSelect('student')}
            className="group relative p-8 bg-[#1a1c23] border-2 border-gray-800 rounded-3xl hover:border-[#8a76ff] hover:bg-[#1f212a] transition-all duration-300 text-left disabled:opacity-50 cursor-pointer"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h2 className="text-2xl font-bold mb-3">ฉันคือผู้เรียน (Student)</h2>
            <p className="text-gray-500 leading-relaxed">
              ต้องการหาติวเตอร์เก่งๆ เข้าเรียนในวิชาที่สนใจ และพัฒนาทักษะของตนเอง
            </p>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSelect('tutor')}
            className="group relative p-8 bg-[#1a1c23] border-2 border-gray-800 rounded-3xl hover:border-[#8a76ff] hover:bg-[#1f212a] transition-all duration-300 text-left disabled:opacity-50 cursor-pointer"
          >
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
              👨‍🏫
            </div>
            <h2 className="text-2xl font-bold mb-3">ฉันคือผู้สอน (Tutor)</h2>
            <p className="text-gray-500 leading-relaxed">
              ต้องการแบ่งปันความรู้ สร้างคอร์สเรียน และสร้างรายได้จากการสอน
            </p>
          </button>
        </div>

        {isPending && (
          <p className="mt-8 text-[#8a76ff] animate-pulse font-medium">
            กำลังบันทึกข้อมูลของคุณ...
          </p>
        )}
      </div>
    </div>
  )
}