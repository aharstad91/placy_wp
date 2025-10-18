'use client'

import { useState } from 'react'
import RouteMap from './RouteMap'
import RouteTimeline from './RouteTimeline'
import { RouteWaypoint, POI } from '@/types/wordpress'
import { useQuery } from '@apollo/client'
import { GET_POIS } from '@/queries/wordpress'

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
  mapBounds?: {
    north: number
    south: number
    east: number
    west: number
  }
  waypointDisplayMode?: 'numbers' | 'icons'
}

export default function RouteContentWrapper({
  startLocation,
  waypoints,
  routeDuration,
  routeDistance,
  routeDifficulty,
  routeGeometrySource = 'mapbox_directions',
  routeGeometryJson,
  mapBounds,
  waypointDisplayMode = 'numbers'
}: RouteContentWrapperProps) {
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)

  // Fetch all POIs for Mini-POI filtering
  const { data: poisData } = useQuery(GET_POIS, {
    variables: { first: 100 }
  })

  // Filter POIs within map bounds (for Mini-POIs)
  const allPois: POI[] = poisData?.pois?.nodes || []
  const boundedPois = mapBounds 
    ? allPois.filter(poi => {
        const lat = poi.poiFields?.poiLatitude
        const lng = poi.poiFields?.poiLongitude
        if (!lat || !lng) return false
        return (
          lat >= mapBounds.south &&
          lat <= mapBounds.north &&
          lng >= mapBounds.west &&
          lng <= mapBounds.east
        )
      })
    : []

  // Transform waypoints to POIs for MapboxMap (Hoved-POIs)
  // ⚠️ CRITICAL: Only include waypoints that have POI data for POI markers
  const waypointPois: POI[] = waypoints
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
        waypointPois={waypointPois}
        allPois={boundedPois}
        selectedPoi={selectedPoi}
        onPoiSelect={setSelectedPoi}
        startLocation={startLocation}
        waypoints={waypoints.map(wp => {
          // ⚠️ CRITICAL: ALL waypoints must be mapped, not filtered
          if (wp.relatedPoi.nodes.length > 0) {
            // Waypoint with POI - use POI data
            const poi = wp.relatedPoi.nodes[0]
            // Get category icon SVG URL from first category (if exists)
            const categoryIconUrl = poi.poiCategories?.nodes?.[0]?.categoryFields?.categoryIcon?.node?.sourceUrl
            
            return {
              latitude: poi.poiFields?.poiLatitude || 0,
              longitude: poi.poiFields?.poiLongitude || 0,
              name: poi.title,
              icon: poi.poiFields?.poiIcon,
              image: poi.poiFields?.poiImage?.node?.sourceUrl,
              estimatedTime: wp.estimatedTime,
              categoryIcon: categoryIconUrl
            }
          } else {
            // Waypoint without POI - use waypoint's own coordinates
            return {
              latitude: wp.waypointLatitude || 0,
              longitude: wp.waypointLongitude || 0,
              name: `Waypoint ${wp.waypointOrder}`,
              estimatedTime: wp.estimatedTime
            }
          }
        })}
        routeDuration={routeDuration}
        routeDistance={routeDistance}
        routeDifficulty={routeDifficulty}
        routeGeometrySource={routeGeometrySource}
        routeGeometryJson={routeGeometryJson}
        mapBounds={mapBounds}
        waypointDisplayMode={waypointDisplayMode}
      />
    </>
  )
}
