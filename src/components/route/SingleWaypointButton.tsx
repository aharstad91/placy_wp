'use client'

interface SingleWaypointButtonProps {
  latitude: number
  longitude: number
  name: string
  className?: string
}

export default function SingleWaypointButton({
  latitude,
  longitude,
  name,
  className = ''
}: SingleWaypointButtonProps) {
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const handleNavigate = () => {
    if (isIOS) {
      // iOS Apple Maps - single destination
      const url = `maps://?daddr=${latitude},${longitude}`
      window.location.href = url
    } else {
      // Android Google Maps - single destination
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      window.open(url, '_blank')
    }
  }

  return (
    <button
      onClick={handleNavigate}
      className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 hover:bg-[#059669] flex items-center justify-center transition-all group ${className}`}
      aria-label={`Navigate to ${name}`}
      title={`Navigate to ${name}`}
    >
      <svg 
        className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>
    </button>
  )
}
