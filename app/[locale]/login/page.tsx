'use client'

import { useActionState, use } from 'react';
import { useTranslations } from 'next-intl';
import { login, signup, loginWithGoogle } from './actions';

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
    <div className="min-h-screen bg-[#0d0f17] flex flex-col font-sans text-white relative">
      
      {/* 1. Language Selector */}
      <div className="absolute top-4 right-6 text-sm text-gray-400 z-10">
        Language: <span className="text-[#8a76ff] uppercase font-bold">{locale}</span>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 pt-20"> 
        <div className="bg-[#1a1c23] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-800 transition-all z-0">
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#8a76ff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8a76ff]/20">
              <span className="text-3xl text-white">⚡</span>
            </div>
          </div>

          <h2 className="text-center text-xl text-white font-bold mb-2 tracking-tight">{t('title')}</h2>
          <p className="text-center text-sm text-gray-400 mb-8 leading-relaxed">{t('subtitle')}</p>

          {/* --- Google Login Button --- */}
          <button 
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full h-12 mb-6 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-200 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1c23] px-2 text-gray-500">Or use email</span></div>
          </div>

          {/* Status Message */}
          {serverError && (
            <div className={`mb-6 p-3 border rounded-xl text-xs text-center ${isSuccess ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
              {serverError}
            </div>
          )}

          <form className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">{t('emailLabel')}</label>
              <input 
                name="email" type="email" required disabled={isPending}
                className="w-full h-12 px-4 rounded-xl bg-[#0f1118] border border-gray-800 text-white focus:border-[#8a76ff] focus:outline-none transition text-sm disabled:opacity-50" 
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">{t('passwordLabel')}</label>
              <input 
                name="password" type="password" required disabled={isPending}
                className="w-full h-12 px-4 rounded-xl bg-[#0f1118] border border-gray-800 text-white focus:border-[#8a76ff] focus:outline-none transition text-sm disabled:opacity-50"
                placeholder={t('passwordPlaceholder')} 
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {/* Login Button */}
              <button 
                formAction={loginAction} disabled={isPending}
                className={`w-full h-12 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_1px_rgba(138,118,255,0.4)]
                  ${isLoginPending ? 'bg-gray-700 opacity-50' : 'bg-[#8a76ff] hover:bg-[#7a66ff]'}`}
              >
                {isLoginPending ? 'Checking...' : t('loginBtn')}
              </button>

              {/* Signup Button */}
              <button 
                formAction={signupAction} disabled={isPending}
                className="w-full h-12 bg-transparent border border-gray-700 text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {isSignupPending ? 'Registering...' : 'Create New Account'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full max-w-2xl px-6 py-10 mt-auto mx-auto text-center border-t border-gray-800/30 mb-8">
          <h3 className="text-xl text-white font-bold mb-3 tracking-wide">{t('footerTitle')}</h3>
          <p className="text-sm leading-relaxed text-gray-400 max-w-md mx-auto">{t('footerDesc')}</p>
      </footer>
    </div>
  );
}