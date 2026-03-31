import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { StatCard } from './components/StatCard'
import { CreateCourseForm } from './components/CreateCourseForm'
import { TimeSlotForm } from './components/TimeSlotForm'
import { ToggleControls } from './components/ToggleControls'
import { signOutAction, deleteSlot, cancelBooking } from './actions'
import { ProfileForm } from './components/ProfileForm'
import { CourseItem } from './components/CourseItem'
import { Marketplace } from './components/Marketplace'
import { StudentSchedule } from './components/StudentSchedule' 

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function DashboardPage(props: { 
  searchParams: Promise<{ tab?: string }>,
  params: Promise<{ locale: string }>
}) {
  const searchParams = await props.searchParams
  const { locale } = await props.params
  const currentTab = searchParams.tab || 'overview'

  await cookies() 
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role === 'pending') redirect(`/${locale}/onboarding`)

  const { data: rawCourses } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
  const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, avatar_url, contact_link');
  const { data: allAvailableSlots } = await supabase.from('availability_slots').select('*').eq('is_booked', false).order('start_time', { ascending: true });
  const { data: allReviews } = await supabase.from('reviews').select('tutor_id, rating');
  
  const { data: myBookings } = await supabase.from('bookings').select(`
    id, status, slot_id, tutor_id, student_id,
    courses(title), 
    availability_slots(start_time, end_time)
  `).eq(profile.role === 'tutor' ? 'tutor_id' : 'student_id', user.id);

  const coursesWithTutors = (rawCourses || []).map(course => {
    const tutorProfile = (allProfiles || []).find(p => p.id === course.tutor_id);
    const tutorReviews = (allReviews || []).filter(r => r.tutor_id === course.tutor_id);
    const avgRating = tutorReviews.length > 0 ? tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length : 0;
    return { ...course, tutors: tutorProfile ? { ...tutorProfile, avgRating, reviewCount: tutorReviews.length } : null }
  });

  const bookingsWithDetails = (myBookings || []).map(booking => {
    const tutorProfile = (allProfiles || []).find(p => p.id === booking.tutor_id);
    return { ...booking, tutor: tutorProfile }
  });

  const myCourses = coursesWithTutors.filter(c => c.tutor_id === user.id);
  const myOwnSlots = (allAvailableSlots || []).filter(s => s.tutor_id === user.id);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

  const t = await getTranslations('Dashboard');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0d0f17] text-slate-900 dark:text-white font-sans overflow-x-hidden">
      
      {/* 🖥️ Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-[#1a1c23] border-r border-slate-200 dark:border-gray-800 flex-col fixed h-full z-20 shadow-sm transition-colors">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0066ff] to-[#00e6a3] tracking-tighter">{t('title')}</h1>
          <div className="mt-6 flex items-center gap-3 bg-slate-50 dark:bg-[#0d0f17] p-3 rounded-2xl border border-slate-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-inner">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-[#0066ff]">{profile.role === 'tutor' ? 'T' : 'S'}</span>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{profile.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{profile.role === 'tutor' ? t('role_tutor') : t('role_student')}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="?tab=overview" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'overview' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}> {profile.role === 'tutor' ? t('overview_tab') : t('my_schedule')} </Link>
          {profile.role === 'tutor' ? (
            <><Link href="?tab=manage" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'manage' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}> {t('manage_tab')} </Link><Link href="?tab=students" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'students' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}> {t('students_tab')} </Link></>
          ) : (
            <Link href="?tab=marketplace" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'marketplace' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}> {t('find_courses')} </Link>
          )}
          <Link href="?tab=profile" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'profile' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}> ⚙️ {locale === 'th' ? 'ตั้งค่าโปรไฟล์' : 'Settings'} </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <ToggleControls currentLocale={locale} />
          <form action={signOutAction}><button type="submit" className="w-full py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"> {t('logout')} </button></form>
        </div>
      </aside>

      {/* 📱 Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1c23] border-t border-slate-200 dark:border-gray-800 z-50 flex items-center justify-around p-2 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link href="?tab=overview" className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'overview' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">หน้าแรก</span>
        </Link>
        {profile.role === 'tutor' ? (
          <Link href="?tab=manage" className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'manage' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            <span className="text-xl">🛠️</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">จัดการ</span>
          </Link>
        ) : (
          <Link href="?tab=marketplace" className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'marketplace' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            <span className="text-xl">🔍</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">หาติวเตอร์</span>
          </Link>
        )}
        <Link href="?tab=profile" className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'profile' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">โปรไฟล์</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-4 md:p-10 pb-28 lg:pb-10 w-full overflow-x-hidden transition-all">
        <div className="max-w-5xl mx-auto">
          
          {/* 📱 Mobile Header */}
          <header className="lg:hidden flex justify-between items-center mb-6 pt-2">
            <h1 className="text-xl font-black text-[#0066ff]">{t('title')}</h1>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-inner">
               {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-[#0066ff]">{profile.role === 'tutor' ? 'T' : 'S'}</span>}
            </div>
          </header>

          {/* 🌟 DYNAMIC PAGE TITLE */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {currentTab === 'overview' && (profile.role === 'tutor' ? t('overview_tab') : t('my_schedule'))}
              {currentTab === 'manage' && t('manage_tab')}
              {currentTab === 'marketplace' && t('find_courses')}
              {currentTab === 'profile' && (locale === 'th' ? 'ตั้งค่าโปรไฟล์' : 'Settings')}
            </h2>
            <p className="text-sm text-slate-500 font-bold mt-1">
              {currentTab === 'overview' && (profile.role === 'tutor' ? (locale === 'th' ? 'สรุปข้อมูลรายได้และสถิติของคุณ' : 'Your revenue and stats') : (locale === 'th' ? 'คลาสเรียนที่คุณจองไว้ทั้งหมด' : 'All your booked classes'))}
              {currentTab === 'manage' && (locale === 'th' ? 'จัดการวิชาที่สอนและเวลาว่างของคุณ' : 'Manage your courses and availability')}
              {currentTab === 'marketplace' && (locale === 'th' ? 'ค้นหาและจองเวลาเรียนกับติวเตอร์' : 'Find and book tutors')}
              {currentTab === 'profile' && (locale === 'th' ? 'จัดการข้อมูลส่วนตัวและระบบแอปพลิเคชัน' : 'Manage your profile and app settings')}
            </p>
          </div>

          {/* 🌟 Tab: Profile */}
          {currentTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl space-y-8">
              <ProfileForm initialData={profile} />
              
              <div className="lg:hidden border-t border-slate-200 dark:border-gray-800 pt-8 space-y-4">
                 <ToggleControls currentLocale={locale} />
                 <form action={signOutAction} className="w-full mt-4">
                   <button type="submit" className="w-full py-4 text-sm font-black text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                     <span>🚪</span> ออกจากระบบ
                   </button>
                 </form>
              </div>
            </div>
          )}

          {/* 🌟 Overview: Tutor (UX Revamped!) */}
          {profile.role === 'tutor' && currentTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* 1. จัด Grid ให้ StatCard มือถืออ่านง่ายขึ้น ไม่เทอะทะ */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-2 lg:col-span-1">
                  <StatCard title={t('revenue')} value="฿0.00" icon="💰" />
                </div>
                <StatCard title={t('total_classes')} value={myBookings?.length.toString() || "0"} icon="⏳" />
                <StatCard title={t('rating')} value="5.0" icon="⭐" />
              </div>

              {/* 2. เปลี่ยนกล่องทื่อๆ ให้เป็น App-like Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <section className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="text-2xl">📚</span>
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">วิชาที่สอน</h3>
                  </div>
                  <div className="space-y-3 flex-1">
                    {myCourses.length > 0 ? myCourses.map((c: any) => (
                      <div key={c.id} className="p-4 bg-slate-50 dark:bg-[#0d0f17] rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-gray-700 transition-all">
                        <p className="font-bold text-[#0066ff] text-sm truncate">{c.title}</p>
                        <span className="text-slate-400 text-xs font-bold">เปิดสอน</span>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
                        <span className="text-4xl mb-2">📝</span>
                        <p className="text-xs text-slate-500 font-bold uppercase">ยังไม่ได้สร้างวิชาเรียน</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white dark:bg-[#1a1c23] p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="text-2xl">⏰</span>
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">เวลาว่างล่าสุด</h3>
                  </div>
                  <div className="space-y-3 flex-1">
                    {myOwnSlots.length > 0 ? myOwnSlots.map((s: any) => (
                      <div key={s.id} className="p-4 bg-slate-50 dark:bg-[#0d0f17] rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 dark:hover:border-gray-700 transition-all">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">📅 {formatDate(s.start_time)}</span>
                        <span className="bg-blue-100 dark:bg-[#0066ff]/20 text-[#0066ff] dark:text-[#66a3ff] px-3 py-1.5 rounded-xl font-black text-xs">
                          {formatTime(s.start_time)}
                        </span>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
                        <span className="text-4xl mb-2">🗓️</span>
                        <p className="text-xs text-slate-500 font-bold uppercase">ยังไม่ได้ลงเวลาว่าง</p>
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </div>
          )}

          {/* Overview: Student */}
          {profile.role === 'student' && currentTab === 'overview' && (
            <StudentSchedule bookings={bookingsWithDetails} locale={locale} translations={{ taught_by: t('taught_by'), btn_cancel: t('btn_cancel'), no_schedule: "ยังไม่มีตาราง", find_courses: "หาคอร์สเรียน →" }} />
          )}
          
          {currentTab === 'marketplace' && ( <Marketplace courses={coursesWithTutors} availableSlots={allAvailableSlots || []} locale={locale} /> )}
          
          {/* 🌟 Manage: Tutor (อัปเกรด List ให้สวยขึ้นด้วย) */}
          {currentTab === 'manage' && (
            <div className="animate-in fade-in space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><CreateCourseForm /><TimeSlotForm /></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* จัดการคอร์ส */}
                <div className="bg-white dark:bg-[#1a1c23] p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-400">จัดการคอร์สเรียน</h3>
                  <div className="space-y-4">
                    {(myCourses || []).length > 0 ? myCourses.map((c: any) => (<CourseItem key={c.id} course={c} />)) : <p className="text-xs text-center text-slate-400 py-4 font-bold">ไม่มีข้อมูล</p>}
                  </div>
                </div>
                
                {/* จัดการเวลา */}
                <div className="bg-white dark:bg-[#1a1c23] p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-400">จัดการเวลาว่าง</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {(myOwnSlots || []).length > 0 ? myOwnSlots.map((s: any) => (
                      <div key={s.id} className="bg-slate-50 dark:bg-[#0d0f17] p-5 rounded-2xl border border-slate-100 dark:border-gray-800 flex justify-between items-center hover:shadow-md transition-all">
                        <div>
                          <p className="font-black text-sm text-slate-800 dark:text-slate-200">📅 {formatDate(s.start_time)}</p>
                          <p className="text-[11px] text-[#0066ff] font-bold uppercase mt-1">เวลา: {formatTime(s.start_time)}</p>
                        </div>
                        <form action={async () => { await deleteSlot(s.id) }}>
                          <button className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            🗑️
                          </button>
                        </form>
                      </div>
                    )) : <p className="text-xs text-center text-slate-400 py-4 font-bold">ไม่มีข้อมูล</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}