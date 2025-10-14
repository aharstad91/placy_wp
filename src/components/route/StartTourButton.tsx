'use client'

import { useState, useEffect } from 'react'

interface StartTourButtonProps {
  startLatitude: number
  startLongitude: number
  startName: string
  waypoints?: Array<{
    latitude: number
    longitude: number
    name: string
  }>
}

export default function StartTourButton({ 
  startLatitude, 
  startLongitude, 
  startName,
  waypoints = []
}: StartTourButtonProps) {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS
    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent))
  }, [])

  const handleStartTour = () => {
    if (isIOS) {
      // Apple Maps (iOS)
      // Format: maps://maps.apple.com/?daddr=lat,lng&dirflg=w (w=walking, d=driving, r=transit)
      const directionType = 'w' // walking by default
      let url = `maps://maps.apple.com/?daddr=${startLatitude},${startLongitude}&dirflg=${directionType}`
      
      // Add waypoints if available
      if (waypoints.length > 0) {
        const waypointParam = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|')
        url += `&waypoints=${waypointParam}`
      }
      
      window.location.href = url
    } else {
      // Google Maps (Android/Desktop)
      // Format: https://www.google.com/maps/dir/?api=1&destination=lat,lng&travelmode=walking
      let url = `https://www.google.com/maps/dir/?api=1&destination=${startLatitude},${startLongitude}&travelmode=walking`
      
      // Add waypoints if available
      if (waypoints.length > 0) {
        const waypointParam = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|')
        url += `&waypoints=${waypointParam}`
      }
      
      window.open(url, '_blank')
    }
  }

  return (
    <div className="sticky bottom-20 z-10 px-4">
      <button
        onClick={handleStartTour}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <span className="text-2xl">🧭</span>
        <div className="text-left">
          <div className="font-bold">Start Tour in Maps</div>
          <div className="text-xs text-blue-100">
            {isIOS ? 'Opens in Apple Maps' : 'Opens in Google Maps'}
          </div>
        </div>
      </button>
      
      {/* Info text */}
      <p className="text-center text-xs text-gray-500 mt-3">
        Tap to navigate to <strong>{startName}</strong>
      </p>
    </div>
  )
}
