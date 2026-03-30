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

  // 1. ดึงข้อมูลพื้นฐาน
  const { data: rawCourses } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
  const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, avatar_url, contact_link');
  const { data: allAvailableSlots } = await supabase.from('availability_slots').select('*').eq('is_booked', false).order('start_time', { ascending: true });
  const { data: allReviews } = await supabase.from('reviews').select('tutor_id, rating');
  
  const { data: myBookings } = await supabase.from('bookings').select(`
    id, status, slot_id, tutor_id, student_id,
    courses(title), 
    availability_slots(start_time, end_time)
  `).eq(profile.role === 'tutor' ? 'tutor_id' : 'student_id', user.id);

  // 🌟 2. ประกอบร่างข้อมูลสำหรับ Marketplace
  const coursesWithTutors = (rawCourses || []).map(course => {
    const tutorProfile = (allProfiles || []).find(p => p.id === course.tutor_id);
    const tutorReviews = (allReviews || []).filter(r => r.tutor_id === course.tutor_id);
    const avgRating = tutorReviews.length > 0 
      ? tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length 
      : 0;

    return {
      ...course,
      tutors: tutorProfile ? {
        ...tutorProfile,
        avgRating,
        reviewCount: tutorReviews.length
      } : null
    }
  });

  // 🌟 3. ประกอบร่างข้อมูลสำหรับหน้าตารางเรียน
  const bookingsWithDetails = (myBookings || []).map(booking => {
    const tutorProfile = (allProfiles || []).find(p => p.id === booking.tutor_id);
    return {
      ...booking,
      tutor: tutorProfile
    }
  });

  const myCourses = coursesWithTutors.filter(c => c.tutor_id === user.id);
  const myOwnSlots = (allAvailableSlots || []).filter(s => s.tutor_id === user.id);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })

  const t = await getTranslations('Dashboard');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0d0f17] text-slate-900 dark:text-white font-sans transition-colors duration-300">
      
      {/* Sidebar: ซ่อนในมือถือ (hidden) และโชว์ในจอคอม (md:flex) */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-[#1a1c23] border-r border-slate-200 dark:border-gray-800 flex-col fixed h-full z-20 shadow-sm transition-colors">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0066ff] to-[#00e6a3] dark:from-[#8a76ff] dark:to-[#00e6a3] tracking-tighter">{t('title')}</h1>
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
          <Link href="?tab=overview" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'overview' ? 'bg-[#0066ff] text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'}`}> {profile.role === 'tutor' ? t('overview_tab') : t('my_schedule')} </Link>
          {profile.role === 'tutor' ? (
            <><Link href="?tab=manage" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'manage' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'}`}> {t('manage_tab')} </Link><Link href="?tab=students" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'students' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'}`}> {t('students_tab')} </Link></>
          ) : (
            <Link href="?tab=marketplace" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'marketplace' ? 'bg-[#0066ff] text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'}`}> {t('find_courses')} </Link>
          )}
          <Link href="?tab=profile" className={`block px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'profile' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'}`}> ⚙️ {locale === 'th' ? 'ตั้งค่าโปรไฟล์' : 'Settings'} </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-gray-800 flex flex-col gap-3">
          <ToggleControls currentLocale={locale} />
          <form action={signOutAction}><button type="submit" className="w-full py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"> {t('logout')} </button></form>
        </div>
      </aside>

      {/* Main: ปรับ ml-0 ในมือถือ และ ml-72 ในจอคอม */}
      <main className="flex-1 ml-0 md:ml-72 p-4 md:p-10 w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {currentTab === 'profile' && (<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl"><ProfileForm initialData={profile} /></div>)}

          {/* Overview: Tutor */}
          {profile.role === 'tutor' && currentTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              {/* ปรับ Grid เป็น 1 คอลัมน์ในมือถือ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t('revenue')} value="฿0.00" icon="💰" />
                <StatCard title={t('total_classes')} value={myBookings?.length.toString() || "0"} icon="⏳" />
                <StatCard title={t('rating')} value="5.0" icon="⭐" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                <section className="bg-white dark:bg-[#1a1c23] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-sm md:text-lg font-black mb-6 uppercase tracking-widest text-slate-400">{locale === 'th' ? 'วิชาที่สอน' : 'My Courses'}</h3>
                  <div className="space-y-3">
                    {myCourses.length > 0 ? myCourses.map((c: any) => (<div key={c.id} className="p-4 bg-slate-50 dark:bg-[#0d0f17] rounded-2xl border border-slate-100 font-bold text-[#0066ff]">{c.title}</div>)) : <p className="text-sm text-slate-400 italic text-center py-10">ยังไม่มีวิชาเรียน</p>}
                  </div>
                </section>
                <section className="bg-white dark:bg-[#1a1c23] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-sm md:text-lg font-black mb-6 uppercase tracking-widest text-slate-400">{locale === 'th' ? 'เวลาว่าง' : 'Availability'}</h3>
                  <div className="space-y-3">
                    {myOwnSlots.length > 0 ? myOwnSlots.map((s: any) => (<div key={s.id} className="p-4 bg-slate-50 dark:bg-[#0d0f17] rounded-2xl flex flex-wrap justify-between items-center gap-2"><span className="text-sm font-bold">📅 {formatDate(s.start_time)}</span><span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold">{formatTime(s.start_time)}</span></div>)) : <p className="text-sm text-slate-400 italic text-center py-10">ยังไม่ได้ลงเวลาว่าง</p>}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Overview: Student */}
          {profile.role === 'student' && currentTab === 'overview' && (
            <StudentSchedule 
              bookings={bookingsWithDetails} 
              locale={locale} 
              translations={{
                taught_by: t('taught_by'),
                btn_cancel: t('btn_cancel'),
                no_schedule: locale === 'th' ? "ยังไม่มีตารางเรียน" : "No schedule yet",
                find_courses: locale === 'th' ? "ค้นหาคอร์สเรียน →" : "Find courses →"
              }}
            />
          )}

          {/* Marketplace: Student */}
          {currentTab === 'marketplace' && (
            <Marketplace courses={coursesWithTutors} availableSlots={allAvailableSlots || []} locale={locale} />
          )}

          {/* Manage: Tutor */}
          {currentTab === 'manage' && (
            <div className="animate-in fade-in space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><CreateCourseForm /><TimeSlotForm /></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                <div><h3 className="text-lg font-black mb-6 uppercase text-slate-400">{locale === 'th' ? 'จัดการคอร์ส' : 'Manage Courses'}</h3><div className="space-y-4">{(myCourses || []).map((c: any) => (<CourseItem key={c.id} course={c} />))}</div></div>
                <div><h3 className="text-lg font-black mb-6 uppercase text-slate-400">{locale === 'th' ? 'จัดการเวลา' : 'Manage Time Slots'}</h3><div className="space-y-4 max-h-[500px] overflow-y-auto">{(myOwnSlots || []).map((s: any) => (<div key={s.id} className="bg-white dark:bg-[#1a1c23] p-5 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 flex justify-between items-center shadow-sm"><div><p className="font-black text-sm">📅 {formatDate(s.start_time)}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{formatTime(s.start_time)}</p></div><form action={async () => { await deleteSlot(s.id) }}><button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all">🗑️</button></form></div>))}</div></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}