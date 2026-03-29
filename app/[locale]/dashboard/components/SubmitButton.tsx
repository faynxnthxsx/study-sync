'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  defaultText: string
  loadingText: string
  disabled?: boolean
}

export function SubmitButton({ defaultText, loadingText, disabled }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit"
      disabled={pending || disabled}
      className="w-full mt-4 bg-[#0066ff] dark:bg-[#00e6a3] text-white dark:text-black py-3.5 rounded-xl font-bold hover:bg-[#0052cc] dark:hover:bg-[#00c28a] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}...
        </>
      ) : (
        defaultText
      )}
    </button>
  )
}