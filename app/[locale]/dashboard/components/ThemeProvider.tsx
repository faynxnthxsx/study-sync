'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// next-themes แทรก <script> ตรงๆ เพื่อกันหน้ากะพริบก่อน hydrate (ทำงานถูกต้องจริงตอน SSR)
// แต่ React 19 ออก warning ใหม่ดัก <script> ทุกจุดแบบไม่แยกเคสนี้ — เป็น false positive ที่รู้กันแล้ว
// (next-themes ไม่อัปเดตแล้วตั้งแต่ มี.ค. 2025) filter เฉพาะข้อความนี้ทิ้งเฉพาะตอน dev
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return
    originalError.apply(console, args)
  }
}

// ใช้ React.ComponentProps แทนการ import type ตรงๆ
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}