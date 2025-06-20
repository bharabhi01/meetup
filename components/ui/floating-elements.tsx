"use client"

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Hot air balloons */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-16 h-20">
          <div className="w-12 h-12 bg-white rounded-full mx-auto mb-2 shadow-lg"></div>
          <div className="w-8 h-6 bg-amber-600 rounded-sm mx-auto"></div>
          <div className="w-px h-4 bg-gray-400 mx-auto"></div>
        </div>
      </div>

      <div className="absolute top-32 right-20 animate-float-delayed">
        <div className="w-12 h-16">
          <div className="w-8 h-8 bg-pink-200 rounded-full mx-auto mb-2 shadow-lg"></div>
          <div className="w-6 h-4 bg-amber-600 rounded-sm mx-auto"></div>
          <div className="w-px h-3 bg-gray-400 mx-auto"></div>
        </div>
      </div>

      {/* Clouds */}
      <div className="absolute top-16 right-32 animate-float">
        <div className="flex items-center">
          <div className="w-8 h-6 bg-white rounded-full"></div>
          <div className="w-10 h-8 bg-white rounded-full -ml-2"></div>
          <div className="w-8 h-6 bg-white rounded-full -ml-2"></div>
        </div>
      </div>

      <div className="absolute top-40 left-1/3 animate-float-delayed">
        <div className="flex items-center">
          <div className="w-6 h-4 bg-white rounded-full"></div>
          <div className="w-8 h-6 bg-white rounded-full -ml-1"></div>
          <div className="w-6 h-4 bg-white rounded-full -ml-1"></div>
        </div>
      </div>

      {/* Clock */}
      <div className="absolute top-24 left-32 animate-float">
        <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-px h-2 bg-coral"></div>
          </div>
        </div>
      </div>

      {/* Grid icon */}
      <div className="absolute top-28 right-16 animate-float-delayed">
        <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center shadow-lg">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-1 h-1 bg-white rounded-sm"></div>
            <div className="w-1 h-1 bg-white rounded-sm"></div>
            <div className="w-1 h-1 bg-white rounded-sm"></div>
            <div className="w-1 h-1 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
