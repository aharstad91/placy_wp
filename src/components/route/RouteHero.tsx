'use client'

import { useState } from 'react'

interface Waypoint {
  latitude: number
  longitude: number
  name: string
}

interface RouteHeroProps {
  title: string
  subtitle?: string
  heroImage?: {
    node: {
      sourceUrl: string
      altText: string
    }
  }
  videoEmbedUrl?: string
  duration: number // minutes
  distance: number // km
  difficulty: 'easy' | 'moderate' | 'challenging'
  routeType: 'walking' | 'cycling' | 'driving'
  waypointCount: number
  startLatitude: number
  startLongitude: number
  startName: string
  waypoints: Waypoint[]
}

export default function RouteHero({
  title,
  subtitle,
  heroImage,
  videoEmbedUrl,
  duration,
  distance,
  difficulty,
  routeType,
  waypointCount,
  startLatitude,
  startLongitude,
  startName,
  waypoints
}: RouteHeroProps) {
  const [showVideo, setShowVideo] = useState(false)

  const difficultyConfig = {
    easy: { badge: '🟢 Easy', color: 'bg-green-500' },
    moderate: { badge: '🟡 Moderate', color: 'bg-yellow-500' },
    challenging: { badge: '🔴 Challenging', color: 'bg-red-500' }
  }

  // Detect user platform for Maps deep linking
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const handleStartFullTour = () => {
    if (waypoints.length === 0) return

    if (isIOS) {
      // iOS Apple Maps - multi-stop route
      const waypointParams = waypoints
        .map(wp => `daddr=${wp.latitude},${wp.longitude}`)
        .join('&')
      const url = `maps://?saddr=${startLatitude},${startLongitude}&${waypointParams}`
      window.location.href = url
    } else {
      // Android Google Maps - multi-stop route
      const waypointList = waypoints
        .slice(0, -1) // Last one is destination
        .map(wp => `${wp.latitude},${wp.longitude}`)
        .join('|')
      const lastWaypoint = waypoints[waypoints.length - 1]
      const url = `https://www.google.com/maps/dir/?api=1&origin=${startLatitude},${startLongitude}&destination=${lastWaypoint.latitude},${lastWaypoint.longitude}${waypointList ? `&waypoints=${waypointList}` : ''}`
      window.open(url, '_blank')
    }
  }

  return (
    <>
      {/* Light gradient hero */}
      <section className="relative w-full bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-8">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Hero Image */}
            <div className="relative w-full md:w-64 h-64 flex-shrink-0 rounded-lg overflow-hidden shadow-xl">
              {heroImage ? (
                <img 
                  src={heroImage.node.sourceUrl}
                  alt={heroImage.node.altText || title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-6xl">🗺️</span>
                </div>
              )}
              {/* Video Play Overlay */}
              {videoEmbedUrl && (
                <button 
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group"
                  aria-label="Play route preview video"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl transform group-hover:scale-110">
                    <span className="text-2xl ml-1">▶️</span>
                  </div>
                </button>
              )}
            </div>

            {/* Route Info */}
            <div className="flex-1 pb-4">
              {/* Difficulty Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${difficultyConfig[difficulty].color}`}>
                  {difficultyConfig[difficulty].badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-gray-900">
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-lg md:text-xl text-gray-700 mb-6">
                  {subtitle}
                </p>
              )}

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{startName}</span>
                </span>
                <span>•</span>
                <span>{waypointCount} stops</span>
                <span>•</span>
                <span>⏱️ {duration} min</span>
                <span>•</span>
                <span>📏 {distance} km</span>
              </div>

              {/* Start Tour Button - Clear and labeled */}
              <button
                onClick={handleStartFullTour}
                disabled={waypoints.length === 0}
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#059669] hover:bg-[#047857] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Start Full Tour in Maps</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && videoEmbedUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-all"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={videoEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}
