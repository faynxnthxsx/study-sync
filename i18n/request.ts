import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. ดึง locale ที่ user รีเควสมา
  let locale = await requestLocale;

  // 2. ถ้าไม่มี หรือ ส่งภาษาแปลกๆ มา ให้ fallback กลับไปหา defaultLocale (เช่น 'th')
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 🌟 3. จุดชี้เป็นชี้ตาย: สั่งให้อ่านไฟล์ JSON จากโฟลเดอร์ messages 
    // สังเกตว่าใช้ `../messages/` เพราะเราต้องถอยออกจากโฟลเดอร์ i18n ก่อน 1 ก้าว
    messages: (await import(`../messages/${locale}.json`)).default
  };
});