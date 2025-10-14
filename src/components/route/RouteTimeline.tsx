'use client'

import { RouteWaypoint, POI } from '@/types/wordpress'
import SingleWaypointButton from './SingleWaypointButton'

interface RouteTimelineProps {
  waypoints: RouteWaypoint[]
  onWaypointClick?: (poi: POI) => void
}

export default function RouteTimeline({ waypoints, onWaypointClick }: RouteTimelineProps) {
  const sortedWaypoints = [...waypoints].sort((a, b) => a.waypointOrder - b.waypointOrder)

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Route Stops</h2>
          <p className="text-gray-600 text-sm">{sortedWaypoints.length} waypoints on this route</p>
        </div>
        
        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedWaypoints.map((waypoint, index) => {
            const poi = waypoint.relatedPoi.nodes[0]
            
            if (!poi) return null

            return (
              <div 
                key={index} 
                className="relative bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all border border-gray-200 cursor-pointer"
                onClick={() => onWaypointClick && onWaypointClick(poi)}
              >
                {/* POI Thumbnail with number badge */}
                <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                  {poi.poiFields?.poiImage?.node ? (
                    <img 
                      src={poi.poiFields.poiImage.node.sourceUrl}
                      alt={poi.poiFields.poiImage.node.altText || poi.title}
                      className="w-full h-full object-cover"
                    />
                  ) : poi.poiFields?.poiIcon ? (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
                      {poi.poiFields.poiIcon}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                      📍
                    </div>
                  )}
                  
                  {/* Number badge - bottom right */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {waypoint.waypointOrder}
                  </div>
                </div>
                
                {/* POI Info */}
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {poi.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {waypoint.description || poi.poiFields?.poiDescription || 'Waypoint on route'}
                  </p>
                </div>
                
                {/* Controls Row - Always Visible */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {/* Duration */}
                    {waypoint.estimatedTime && (
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <span>⏱️</span>
                        <span>{waypoint.estimatedTime} min</span>
                      </div>
                    )}
                    
                    {/* Audio Guide */}
                    {waypoint.audioGuideUrl && (
                      <a
                        href={waypoint.audioGuideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#059669] transition-colors"
                        title="Audio guide available"
                      >
                        <span className="text-xl">🎧</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Navigate Button - Always Visible */}
                  {poi.poiFields?.poiLatitude && poi.poiFields?.poiLongitude && (
                    <SingleWaypointButton
                      latitude={poi.poiFields.poiLatitude}
                      longitude={poi.poiFields.poiLongitude}
                      name={poi.title}
                      className="!bg-[#059669] hover:!bg-[#047857] !text-white"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
