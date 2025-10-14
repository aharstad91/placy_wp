'use client'

import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { POI } from '@/types/wordpress'

interface RouteMapOverlayProps {
  isOpen: boolean
  onClose: () => void
  pois: POI[]
  selectedPoi?: POI | null
  onPoiSelect?: (poi: POI) => void
  startLocation: {
    latitude: number
    longitude: number
    name: string
  }
  waypoints: Array<{
    latitude: number
    longitude: number
    name: string
    icon?: string
    image?: string
    estimatedTime?: number
  }>
}

export default function RouteMapOverlay({
  isOpen,
  onClose,
  pois,
  selectedPoi,
  onPoiSelect,
  startLocation,
  waypoints
}: RouteMapOverlayProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [localSelectedPoi, setLocalSelectedPoi] = useState<POI | null>(selectedPoi || null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Update localSelectedPoi when selectedPoi prop changes
  useEffect(() => {
    if (selectedPoi) {
      setLocalSelectedPoi(selectedPoi)
    }
  }, [selectedPoi])

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return undefined

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [startLocation.longitude, startLocation.latitude],
        zoom: 13
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.current.on('load', () => {
        setMapLoaded(true)
      })

      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
        markersRef.current = []
        setMapLoaded(false)
      }
    } catch (error) {
      console.error('Failed to initialize map:', error)
      return undefined
    }
  }, [isOpen, startLocation.latitude, startLocation.longitude])

  // Add markers and route when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Create start marker
    const startContainer = document.createElement('div')
    startContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    `

    const startEl = document.createElement('div')
    startEl.style.cssText = `
      width: 40px;
      height: 40px;
      background-color: #10b981;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    `
    startEl.innerHTML = '🚩'

    const startLabel = document.createElement('div')
    startLabel.textContent = startLocation.name
    startLabel.style.cssText = `
      margin-top: 8px;
      padding: 4px 8px;
      background-color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `

    startContainer.appendChild(startEl)
    startContainer.appendChild(startLabel)

    const startMarker = new mapboxgl.Marker({ element: startContainer, anchor: 'bottom' })
      .setLngLat([startLocation.longitude, startLocation.latitude])
      .addTo(map.current)
    
    markersRef.current.push(startMarker)

    // Add waypoint markers
    waypoints.forEach((waypoint, index) => {
      const container = document.createElement('div')
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      `

      const markerEl = document.createElement('div')
      
      if (waypoint.image) {
        markerEl.style.cssText = `
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid #3b82f6;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          overflow: hidden;
          background-color: white;
          position: relative;
        `
        
        const img = document.createElement('img')
        img.src = waypoint.image
        img.alt = waypoint.name
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `
        markerEl.appendChild(img)

        const badge = document.createElement('div')
        badge.textContent = (index + 1).toString()
        badge.style.cssText = `
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `
        markerEl.appendChild(badge)
      } else {
        markerEl.innerHTML = waypoint.icon || (index + 1).toString()
        markerEl.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `
      }

      const labelEl = document.createElement('div')
      labelEl.textContent = waypoint.name
      labelEl.style.cssText = `
        margin-top: 8px;
        padding: 4px 8px;
        background-color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `

      container.appendChild(markerEl)
      container.appendChild(labelEl)

      container.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.1)'
        labelEl.style.fontWeight = '700'
      })
      container.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)'
        labelEl.style.fontWeight = '600'
      })

      // Click handler to show POI details
      const poi = pois[index]
      container.addEventListener('click', () => {
        if (poi && onPoiSelect) {
          setLocalSelectedPoi(poi)
          onPoiSelect(poi)
        }
      })

      const marker = new mapboxgl.Marker({ element: container, anchor: 'bottom' })
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .addTo(map.current!)
      
      markersRef.current.push(marker)
    })

    // Fetch and draw route
    const fetchRoute = async () => {
      const coordinates = [
        [startLocation.longitude, startLocation.latitude],
        ...waypoints.map(wp => [wp.longitude, wp.latitude])
      ]

      const coordinatesString = coordinates.map(c => `${c[0]},${c[1]}`).join(';')
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinatesString}?geometries=geojson&access_token=${mapboxgl.accessToken}`

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.routes && data.routes.length > 0 && map.current) {
          const route = data.routes[0].geometry

          if (map.current.getSource('route')) {
            map.current.removeLayer('route')
            map.current.removeSource('route')
          }

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          })

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.8
            }
          })

          // Add time badges
          const routeCoords = route.coordinates
          const allPoints = [
            [startLocation.longitude, startLocation.latitude],
            ...waypoints.map(wp => [wp.longitude, wp.latitude])
          ]
          
          for (let i = 1; i < allPoints.length; i++) {
            const waypoint = waypoints[i - 1]
            
            if (!waypoint.estimatedTime || waypoint.estimatedTime === 0) continue
            
            const startCoord = allPoints[i - 1]
            const endCoord = allPoints[i]
            
            const distanceThreshold = 0.0001
            if (Math.abs(startCoord[0] - endCoord[0]) < distanceThreshold && 
                Math.abs(startCoord[1] - endCoord[1]) < distanceThreshold) continue
            
            let startIdx = 0
            let minStartDist = Infinity
            for (let j = 0; j < routeCoords.length; j++) {
              const coord = routeCoords[j]
              const dist = Math.sqrt(
                Math.pow(coord[0] - startCoord[0], 2) + 
                Math.pow(coord[1] - startCoord[1], 2)
              )
              if (dist < minStartDist) {
                minStartDist = dist
                startIdx = j
              }
            }
            
            let endIdx = startIdx
            let minEndDist = Infinity
            for (let j = startIdx; j < routeCoords.length; j++) {
              const coord = routeCoords[j]
              const dist = Math.sqrt(
                Math.pow(coord[0] - endCoord[0], 2) + 
                Math.pow(coord[1] - endCoord[1], 2)
              )
              if (dist < minEndDist) {
                minEndDist = dist
                endIdx = j
              }
            }
            
            if (endIdx > startIdx) {
              const segmentCoords = routeCoords.slice(startIdx, endIdx + 1)
              let totalDistance = 0
              const distances = [0]
              
              for (let k = 1; k < segmentCoords.length; k++) {
                const [lon1, lat1] = segmentCoords[k - 1]
                const [lon2, lat2] = segmentCoords[k]
                const segDist = Math.sqrt(
                  Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2)
                )
                totalDistance += segDist
                distances.push(totalDistance)
              }
              
              const halfDistance = totalDistance / 2
              let midIdx = startIdx
              
              for (let k = 0; k < distances.length - 1; k++) {
                if (distances[k] <= halfDistance && distances[k + 1] >= halfDistance) {
                  midIdx = startIdx + k
                  break
                }
              }
              
              const midCoord = routeCoords[midIdx]
              
              const timeBadge = document.createElement('div')
              timeBadge.style.cssText = `
                background-color: #3b82f6;
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                border: 2px solid white;
                cursor: default;
              `
              timeBadge.textContent = `${waypoint.estimatedTime} min`

              const timeBadgeMarker = new mapboxgl.Marker({ 
                element: timeBadge,
                anchor: 'center'
              })
                .setLngLat([midCoord[0], midCoord[1]])
                .addTo(map.current!)
              
              markersRef.current.push(timeBadgeMarker)
            }
          }

          const bounds = new mapboxgl.LngLatBounds()
          route.coordinates.forEach((coord: [number, number]) => bounds.extend(coord))
          map.current.fitBounds(bounds, { padding: 80 })
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
      }
    }

    fetchRoute()
  }, [mapLoaded, startLocation, waypoints, pois, onPoiSelect])

  const handleClose = () => {
    setLocalSelectedPoi(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center">
        <div className="bg-white w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🗺️ Interactive Route Map</h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on markers to view details • {pois.length} waypoints
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close map"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative overflow-hidden">
            <div 
              ref={mapContainer} 
              className="w-full h-full absolute inset-0"
            />
          </div>

          {/* Bottom Sheet for Selected POI */}
          {localSelectedPoi && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl max-h-[40vh] overflow-y-auto z-10">
              <div className="p-6">
                {/* Close button for bottom sheet */}
                <button
                  onClick={() => setLocalSelectedPoi(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* POI Details */}
                <div className="pr-12">
                  {/* Icon and Category */}
                  <div className="flex items-center gap-2 mb-3">
                    {localSelectedPoi.poiFields.poiIcon && (
                      <span className="text-3xl">{localSelectedPoi.poiFields.poiIcon}</span>
                    )}
                    {localSelectedPoi.poiFields.poiCategory && (
                      <span className="text-xs font-medium text-[#76908D] bg-[#D1E5E6] px-3 py-1 rounded-full">
                        {localSelectedPoi.poiFields.poiCategory}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {localSelectedPoi.title}
                  </h3>

                  {/* Description */}
                  {localSelectedPoi.poiFields.poiDescription && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {localSelectedPoi.poiFields.poiDescription}
                    </p>
                  )}

                  {/* Image if available */}
                  {localSelectedPoi.poiFields.poiImage?.node && (
                    <div className="mt-4 rounded-xl overflow-hidden">
                      <img
                        src={localSelectedPoi.poiFields.poiImage.node.sourceUrl}
                        alt={localSelectedPoi.poiFields.poiImage.node.altText || localSelectedPoi.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Coordinates */}
                  <div className="mt-4 text-sm text-gray-500">
                    📍 {localSelectedPoi.poiFields.poiLatitude.toFixed(6)}, {localSelectedPoi.poiFields.poiLongitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
