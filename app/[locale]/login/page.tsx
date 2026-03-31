'use client'

import { useActionState, use } from 'react';
import { useTranslations } from 'next-intl';
import { login, signup, loginWithGoogle } from './actions';
import Link from 'next/link';

export default function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations('Login');

  // ใช้ useActionState แยกกันเพื่อดัก Error ของแต่ละ Action
  const [loginState, loginAction, isLoginPending] = useActionState(login, null);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, null);

  const isPending = isLoginPending || isSignupPending;
  const serverError = loginState?.error || signupState?.error;
  const isSuccess = signupState?.status === 'success';

  return (
    <div className="min-h-screen bg-[#0d0f17] flex flex-col font-sans text-white relative overflow-hidden">
      
      {/* Background Glow Effect (เพื่อให้ดูมีมิติเหมือนหน้า Landing) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8a76ff]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00e6a3]/5 blur-[120px] rounded-full"></div>
      </div>

      {/* 1. Language Selector (มุมขวาบน) */}
      <div className="absolute top-6 right-6 text-xs text-gray-500 z-10 font-bold bg-[#1a1c23] px-3 py-1.5 rounded-full border border-gray-800">
        Language: <span className="text-[#8a76ff] uppercase">{locale}</span>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 pt-20 relative z-10"> 
        <div className="bg-[#1a1c23]/80 backdrop-blur-xl w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-gray-800/50 transition-all">
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#0066ff] to-[#00e6a3] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-3xl font-black text-white tracking-tighter">TP.</span>
            </div>
          </div>

          {/* ปรับแก้ให้ถ้าหาคำแปลไม่เจอ จะใช้ Default Text ไปก่อน */}
          <h2 className="text-center text-2xl text-white font-black mb-2 tracking-tight">
            {t('title') || 'Welcome Back'}
          </h2>
          <p className="text-center text-sm text-gray-400 mb-8 font-bold">
            {t('subtitle') || 'Sign in to access your dashboard'}
          </p>

          {/* --- Google Login Button --- */}
         <form action={async () => { await loginWithGoogle(locale); }}>
            <button 
              type="submit"
              disabled={isPending}
              className="w-full h-14 mb-6 bg-white text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {locale === 'th' ? 'เข้าสู่ระบบด้วย Google' : 'Continue with Google'}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-[#1a1c23] px-4 text-gray-500">Or use email</span></div>
          </div>

          {/* Status Message */}
          {serverError && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold text-center border ${isSuccess ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {serverError}
            </div>
          )}

          {/* --- Email Login Form --- */}
          <form className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">{t('emailLabel') || 'Email'}</label>
              <input 
                name="email" type="email" required disabled={isPending}
                className="w-full h-14 px-5 rounded-2xl bg-[#0d0f17] border border-gray-800 text-white font-bold focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff] focus:outline-none transition-all text-sm disabled:opacity-50 placeholder:text-gray-600 placeholder:font-normal" 
                placeholder={t('emailPlaceholder') || 'hello@example.com'}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">{t('passwordLabel') || 'Password'}</label>
              <input 
                name="password" type="password" required disabled={isPending}
                className="w-full h-14 px-5 rounded-2xl bg-[#0d0f17] border border-gray-800 text-white font-bold focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff] focus:outline-none transition-all text-sm disabled:opacity-50 placeholder:text-gray-600 placeholder:font-normal"
                placeholder={t('passwordPlaceholder') || '••••••••'} 
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {/* Login Button */}
              <button 
                formAction={loginAction} disabled={isPending}
                className={`w-full h-14 rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_0_rgba(0,102,255,0.3)]
                  ${isLoginPending ? 'bg-gray-800 text-gray-500 shadow-none' : 'bg-[#0066ff] text-white hover:bg-[#0052cc] hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isLoginPending ? 'Checking credentials...' : (t('loginBtn') || 'Sign In')}
              </button>

              {/* Signup Button */}
              <button 
                formAction={signupAction} disabled={isPending}
                className="w-full h-14 bg-transparent border-2 border-gray-800 text-gray-400 rounded-2xl font-bold text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isSignupPending ? 'Registering...' : (locale === 'th' ? 'สร้างบัญชีใหม่' : 'Create New Account')}
              </button>
            </div>
          </form>

        </div>

        {/* กลับหน้าแรก */}
        <div className="absolute bottom-10 w-full text-center">
           <Link href={`/${locale}`} className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
             ← {locale === 'th' ? 'กลับไปหน้าแรก' : 'Back to Home'}
           </Link>
        </div>
      </main>
    </div>
  );
}