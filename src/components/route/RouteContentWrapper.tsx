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
    image?: string
    includeApproachInRoute?: boolean
    showReturnRoute?: boolean
  }
  waypoints: RouteWaypoint[]
  routeDuration?: number
  routeDistance?: number
  routeDifficulty?: string
  routeGeometrySource?: 'mapbox_directions' | 'custom_drawn'
  routeGeometryJson?: string
}

export default function RouteContentWrapper({
  startLocation,
  waypoints,
  routeDuration,
  routeDistance,
  routeDifficulty,
  routeGeometrySource = 'mapbox_directions',
  routeGeometryJson
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
      {/* Route Preview Map - Hidden for now */}
      {/* <div className="bg-gray-100 py-8">
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
          
          <button
            onClick={handleMapClick}
            className="w-full bg-gray-800 hover:bg-black text-white py-3 px-4 rounded-lg font-bold text-sm transition-colors mt-4"
          >
            <span className="block w-full text-center">Open Interactive Route Map</span>
          </button>
        </div>
      </div> */}

      {/* Route Stops List */}
      <RouteTimeline 
        waypoints={waypoints}
        onWaypointClick={handleWaypointClick}
        onMapClick={handleMapClick}
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
        routeDuration={routeDuration}
        routeDistance={routeDistance}
        routeDifficulty={routeDifficulty}
        routeGeometrySource={routeGeometrySource}
        routeGeometryJson={routeGeometryJson}
      />
    </>
  )
}
