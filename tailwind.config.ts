import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // 🌟 เพิ่มบรรทัดนี้ เพื่อบอกให้ Tailwind ฟังคำสั่งจากปุ่ม Toggle ของเรา
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;