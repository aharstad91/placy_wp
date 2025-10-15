'use client'

import { RouteWaypoint, POI } from '@/types/wordpress'

interface RouteTimelineProps {
  waypoints: RouteWaypoint[]
  onWaypointClick?: (poi: POI) => void
  onMapClick?: () => void
}

export default function RouteTimeline({ waypoints, onWaypointClick, onMapClick }: RouteTimelineProps) {
  const sortedWaypoints = [...waypoints].sort((a, b) => a.waypointOrder - b.waypointOrder)

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Route Stops</h2>
          <p className="text-gray-600 text-sm mb-4">{sortedWaypoints.length} waypoints on this route</p>
          
          {/* Map Button */}
          {onMapClick && (
            <button
              onClick={onMapClick}
              className="w-full bg-gray-800 hover:bg-black text-white py-3 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">🗺️</span>
              <span>Open Interactive Route Map</span>
            </button>
          )}
        </div>
        
        {/* Compact List Layout */}
        <div className="space-y-2">
          {sortedWaypoints.map((waypoint, index) => {
            const poi = waypoint.relatedPoi.nodes[0]
            
            if (!poi) return null

            return (
              <div 
                key={index} 
                className="group relative bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 cursor-pointer"
                onClick={() => onWaypointClick && onWaypointClick(poi)}
              >
                {/* Single row layout with image and content */}
                <div className="flex items-center gap-3 p-3">
                  {/* Left: Image with badge */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-14 h-14 bg-gray-200 rounded-lg overflow-hidden">
                      {poi.poiFields?.poiImage?.node ? (
                        <img 
                          src={poi.poiFields.poiImage.node.sourceUrl}
                          alt={poi.poiFields.poiImage.node.altText || poi.title}
                          className="w-full h-full object-cover"
                        />
                      ) : poi.poiFields?.poiIcon ? (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                          {poi.poiFields.poiIcon}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-gray-100 to-gray-200">
                          📍
                        </div>
                      )}
                      
                      {/* Number badge - blue to match map markers */}
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                        {waypoint.waypointOrder}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Content - full width */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                      {poi.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {waypoint.description || poi.poiFields?.poiDescription || 'Waypoint on route'}
                    </p>
                    
                    {/* Metadata row with click indicator */}
                    <div className="flex items-center gap-3 justify-between">
                      {waypoint.estimatedTime && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <span>⏱️</span>
                          <span>{waypoint.estimatedTime} min</span>
                        </div>
                      )}
                      
                      {/* Subtle click indicator */}
                      <div className="flex items-center gap-1 text-gray-400 text-xs group-hover:text-[#3b82f6] transition-colors">
                        <span className="text-[10px]">Tap for details</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
