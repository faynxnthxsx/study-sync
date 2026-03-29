import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
// เช็ค Path ตรงนี้ให้ตรงกับโฟลเดอร์ที่คุณเก็บ ThemeProvider ไว้จริงๆ ด้วยนะครับ
import { ThemeProvider } from './dashboard/components/ThemeProvider'; 
import "./globals.css";
import { Toaster } from 'sonner';

const locales = ['en', 'th'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    messages = {}; 
  }

 return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className="transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
          
          {/* 🌟 2. วาง Toaster ไว้ล่างสุดก่อนปิด ThemeProvider */}
          <Toaster position="top-center" richColors theme="system" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}