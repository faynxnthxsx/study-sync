export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0d0f17] p-8 animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-gray-800 rounded-lg"></div>
            <div className="h-4 w-32 bg-gray-800 rounded-lg"></div>
          </div>
          <div className="h-10 w-24 bg-gray-800 rounded-xl"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#1a1c23] border border-gray-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}