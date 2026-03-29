export function StatCard({ title, value, icon }: { title: string, value: string | number, icon: string }) {
  return (
    <div className="bg-white dark:bg-[#1a1c23]/80 dark:backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors duration-300 flex flex-col justify-center">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-[#0d0f17] rounded-xl text-xl border border-slate-100 dark:border-gray-700 transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-3xl font-black text-slate-800 dark:text-white mt-1 transition-colors duration-300">
        {value}
      </p>
    </div>
  )
}