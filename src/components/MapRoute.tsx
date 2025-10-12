'use client'

import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface RouteData {
  distance: number // meters
  duration: number // seconds
  geometry: any
}

interface MapRouteProps {
  map: mapboxgl.Map | null
  from: [number, number] // [lng, lat]
  to: [number, number]   // [lng, lat]
  profile?: 'walking' | 'driving' | 'cycling'
  onRouteLoaded?: (data: RouteData) => void
}

export default function MapRoute({ 
  map, 
  from, 
  to, 
  profile = 'walking',
  onRouteLoaded 
}: MapRouteProps) {
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!map) return

    const fetchRoute = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!token) {
          throw new Error('Mapbox token not found')
        }

        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&access_token=${token}`
        
        const response = await fetch(url)
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const routeInfo: RouteData = {
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry
          }
          
          setRouteData(routeInfo)
          onRouteLoaded?.(routeInfo)

          // Add route to map
          if (map.getSource('route')) {
            (map.getSource('route') as mapboxgl.GeoJSONSource).setData(route.geometry)
          } else {
            map.addSource('route', {
              type: 'geojson',
              data: route.geometry
            })

            // Add white border/outline (drawn first, behind the blue line)
            map.addLayer({
              id: 'route-outline',
              type: 'line',
              source: 'route',
              paint: {
                'line-color': '#ffffff',
                'line-width': 8,
                'line-opacity': 1
              }
            })

            // Add main blue route line (Google Maps style)
            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              paint: {
                'line-color': '#4285F4', // Google Maps blue
                'line-width': 5,
                'line-opacity': 0.95
              }
            })
          }
        } else {
          setError('Kunne ikke finne rute')
        }
      } catch (err) {
        setError('Feil ved henting av rute')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching route:', err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoute()

    // Cleanup
    return () => {
      // Check if map still exists and is not removed
      if (!map || !map.getStyle()) return
      
      try {
        if (map.getLayer('route')) map.removeLayer('route')
        if (map.getLayer('route-outline')) map.removeLayer('route-outline')
        if (map.getSource('route')) map.removeSource('route')
      } catch (err) {
        // Map may have been removed already - silently ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, from, to, profile])

  // No UI rendering - all handled in parent component via callback
  return null
}
