export default function TennisBallDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center my-16 ${className}`}>
      <div className="relative">
        {/* Tennis court line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 md:w-32 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
        
        {/* Proper tennis ball */}
        <div className="relative mx-24 md:mx-36">
          <div className="w-10 h-10 md:w-12 md:h-12 tennis-ball animate-gentle-float"></div>
        </div>
        
        {/* Tennis court line */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 md:w-32 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
      </div>
    </div>
  )
}

export function TennisNetDivider({ className = "" }) {
  return (
    <div className={`relative h-24 ${className}`}>
      {/* Tennis net */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-4xl h-16 relative">
          {/* Net posts */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gray-400 rounded-full"></div>
          <div className="absolute right-0 top-0 w-1 h-full bg-gray-400 rounded-full"></div>
          
          {/* Net mesh */}
          <div className="absolute inset-0 mx-1 tennis-net-pattern opacity-20"></div>
          
          {/* Top tape */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white shadow-sm"></div>
          
          {/* Center strap with small tennis ball */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-full flex items-center justify-center">
            <div className="w-4 h-4 tennis-ball opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CourtLinesDivider({ className = "" }) {
  return (
    <div className={`relative h-1 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -top-1">
        <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
      </div>
    </div>
  )
}