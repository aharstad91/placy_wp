'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface RoutePreviewMapProps {
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
    image?: string // POI image URL
    estimatedTime?: number // Travel time to this waypoint in minutes
  }>
  onMapClick?: () => void // Callback when map is clicked to open overlay
}

export default function RoutePreviewMap({ startLocation, waypoints, onMapClick }: RoutePreviewMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return undefined

    try {
      // Initialize map
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [startLocation.longitude, startLocation.latitude],
        zoom: 13
      })

      let hasLoaded = false

      map.current.on('load', () => {
        hasLoaded = true
        setMapLoaded(true)
        setMapError(false)
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setMapError(true)
      })

      // Add timeout to prevent infinite loading
      const loadTimeout = setTimeout(() => {
        if (!hasLoaded) {
          console.warn('Map loading timeout')
          setMapError(true)
        }
      }, 10000) // 10 seconds timeout

      return () => {
        clearTimeout(loadTimeout)
        map.current?.remove()
      }
    } catch (error) {
      console.error('Failed to initialize map:', error)
      setMapError(true)
      return undefined
    }
  }, [startLocation.latitude, startLocation.longitude])

  useEffect(() => {
    if (!map.current || !mapLoaded) return undefined

    // Start marker removed - only showing waypoints now
    
    // Add waypoint markers with integrated image and label
    waypoints.forEach((waypoint, index) => {
      // Main container with white background containing both image and label
      const container = document.createElement('div')
      container.style.cssText = `
        background-color: white;
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transition: transform 0.2s, box-shadow 0.2s;
      `

      if (waypoint.image) {
        // Image container with number badge overlay
        const imageContainer = document.createElement('div')
        imageContainer.style.cssText = `
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
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
        imageContainer.appendChild(img)

        // Number badge on top of image with high z-index
        const badge = document.createElement('div')
        badge.textContent = (index + 1).toString()
        badge.style.cssText = `
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 10;
        `
        imageContainer.appendChild(badge)
        
        container.appendChild(imageContainer)
      } else {
        // No image, show numbered circle
        const numberCircle = document.createElement('div')
        numberCircle.innerHTML = waypoint.icon || (index + 1).toString()
        numberCircle.style.cssText = `
          width: 60px;
          height: 60px;
          background-color: #3b82f6;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 24px;
        `
        container.appendChild(numberCircle)
      }

      // Label text inside the white container
      const labelEl = document.createElement('div')
      labelEl.textContent = waypoint.name
      labelEl.style.cssText = `
        font-size: 11px;
        font-weight: 600;
        color: #374151;
        text-align: center;
        max-width: 80px;
        line-height: 1.2;
      `

      container.appendChild(labelEl)

      // Add hover effect
      container.addEventListener('mouseenter', () => {
        container.style.transform = 'scale(1.05) translateY(-2px)'
        container.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
      })
      container.addEventListener('mouseleave', () => {
        container.style.transform = 'scale(1) translateY(0)'
        container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      })

      new mapboxgl.Marker({ element: container, anchor: 'bottom' })
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .addTo(map.current!)
    })

    // Fetch route from Mapbox Directions API
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

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry

          // Remove old route if exists
          if (map.current?.getSource('route')) {
            map.current.removeLayer('route')
            map.current.removeSource('route')
          }

          // Add new route
          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          })

          map.current?.addLayer({
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

          // Add time badges between waypoints along the actual route
          const routeCoords = route.coordinates
          
          // Build array of waypoint coordinates including start location
          const allPoints = [
            [startLocation.longitude, startLocation.latitude],
            ...waypoints.map(wp => [wp.longitude, wp.latitude])
          ]
          
          // For each waypoint, find corresponding time badge position
          for (let i = 1; i < allPoints.length; i++) {
            const waypoint = waypoints[i - 1]
            
            if (!waypoint.estimatedTime || waypoint.estimatedTime === 0) {
              continue
            }
            
            const startCoord = allPoints[i - 1]
            const endCoord = allPoints[i]
            
            // Skip if start and end are identical
            const distanceThreshold = 0.0001
            if (Math.abs(startCoord[0] - endCoord[0]) < distanceThreshold && 
                Math.abs(startCoord[1] - endCoord[1]) < distanceThreshold) {
              continue
            }
            
            // Find closest point in route to start coordinate
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
            
            // Find closest point in route to end coordinate
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
            
            // Only create badge if we have a valid segment
            if (endIdx > startIdx) {
              // Calculate actual distance along the route to find true midpoint
              const segmentCoords = routeCoords.slice(startIdx, endIdx + 1)
              let totalDistance = 0
              const distances = [0] // cumulative distances
              
              for (let k = 1; k < segmentCoords.length; k++) {
                const [lon1, lat1] = segmentCoords[k - 1]
                const [lon2, lat2] = segmentCoords[k]
                const segDist = Math.sqrt(
                  Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2)
                )
                totalDistance += segDist
                distances.push(totalDistance)
              }
              
              // Find coordinate at half the total distance
              const halfDistance = totalDistance / 2
              let midIdx = startIdx
              
              for (let k = 0; k < distances.length - 1; k++) {
                if (distances[k] <= halfDistance && distances[k + 1] >= halfDistance) {
                  midIdx = startIdx + k
                  break
                }
              }
              
              const midCoord = routeCoords[midIdx]
              
              // Create time badge element
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

              // Add time badge as marker
              new mapboxgl.Marker({ 
                element: timeBadge,
                anchor: 'center'
              })
                .setLngLat([midCoord[0], midCoord[1]])
                .addTo(map.current!)
            }
          }

          // Fit map to show route
          const bounds = new mapboxgl.LngLatBounds()
          route.coordinates.forEach((coord: [number, number]) => bounds.extend(coord))
          map.current?.fitBounds(bounds, { padding: 50 })
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
        // Fallback to straight lines if API fails
        const coordinates = [
          [startLocation.longitude, startLocation.latitude],
          ...waypoints.map(wp => [wp.longitude, wp.latitude])
        ]

        if (map.current?.getSource('route')) {
          map.current.removeLayer('route')
          map.current.removeSource('route')
        }

        map.current?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        })

        map.current?.addLayer({
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

        const bounds = new mapboxgl.LngLatBounds()
        coordinates.forEach(coord => bounds.extend(coord as [number, number]))
        map.current?.fitBounds(bounds, { padding: 50 })
      }
    }

    fetchRoute()

  }, [mapLoaded, startLocation, waypoints])

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🗺️</span>
          <span>Route Preview</span>
        </h2>
      </div>
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-[400px] cursor-pointer"
          onClick={onMapClick}
        />
        
        {/* Loading overlay */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="text-6xl mb-4">📍</div>
              <p className="text-gray-600">Map preview unavailable</p>
              <p className="text-sm text-gray-500 mt-2">The route will still work in navigation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
