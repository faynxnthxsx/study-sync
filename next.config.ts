import createNextIntlPlugin from 'next-intl/plugin';

// ระบุ Path ไปที่ไฟล์ที่เราเพิ่งสร้าง
const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);