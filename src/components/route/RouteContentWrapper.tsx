'use client'

import { useState } from 'react'
import RouteMap from './RouteMap'
import RouteTimeline from './RouteTimeline'
import { RouteWaypoint, POI } from '@/types/wordpress'

interface RouteContentWrapperProps {
  startLocation: {
    latitude: number
    longitude: number
    name: string
  }
  waypoints: RouteWaypoint[]
}

export default function RouteContentWrapper({
  startLocation,
  waypoints
}: RouteContentWrapperProps) {
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)

  // Transform waypoints to POIs for MapboxMap
  const pois: POI[] = waypoints
    .filter(wp => wp.relatedPoi.nodes.length > 0)
    .map(wp => wp.relatedPoi.nodes[0])

  const handleMapClick = () => {
    setIsMapOverlayOpen(true)
    setSelectedPoi(null)
  }

  const handleWaypointClick = (poi: POI) => {
    setSelectedPoi(poi)
    setIsMapOverlayOpen(true)
  }

  const handleCloseOverlay = () => {
    setIsMapOverlayOpen(false)
    setSelectedPoi(null)
  }

  return (
    <>
      {/* Route Preview Map */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Route Overview</h2>
          <RouteMap
            mode="preview"
            startLocation={startLocation}
            waypoints={waypoints
              .filter(wp => wp.relatedPoi.nodes.length > 0)
              .map(wp => {
                const poi = wp.relatedPoi.nodes[0]
                return {
                  latitude: poi.poiFields?.poiLatitude || 0,
                  longitude: poi.poiFields?.poiLongitude || 0,
                  name: poi.title,
                  icon: poi.poiFields?.poiIcon,
                  image: poi.poiFields?.poiImage?.node?.sourceUrl,
                  estimatedTime: wp.estimatedTime
                }
              })}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* Route Stops List */}
      <RouteTimeline 
        waypoints={waypoints}
        onWaypointClick={handleWaypointClick}
      />

      {/* Map Overlay Modal */}
      <RouteMap
        mode="fullscreen"
        isOpen={isMapOverlayOpen}
        onClose={handleCloseOverlay}
        pois={pois}
        selectedPoi={selectedPoi}
        onPoiSelect={setSelectedPoi}
        startLocation={startLocation}
        waypoints={waypoints
          .filter(wp => wp.relatedPoi.nodes.length > 0)
          .map(wp => {
            const poi = wp.relatedPoi.nodes[0]
            return {
              latitude: poi.poiFields?.poiLatitude || 0,
              longitude: poi.poiFields?.poiLongitude || 0,
              name: poi.title,
              icon: poi.poiFields?.poiIcon,
              image: poi.poiFields?.poiImage?.node?.sourceUrl,
              estimatedTime: wp.estimatedTime
            }
          })}
      />
    </>
  )
}
