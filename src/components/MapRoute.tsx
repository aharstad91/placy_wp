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
  geometrySource?: 'mapbox_directions' | 'custom_drawn'
  customGeometry?: string // GeoJSON LineString as string
  onRouteLoaded?: (data: RouteData) => void
}

export default function MapRoute({ 
  map, 
  from, 
  to, 
  profile = 'walking',
  geometrySource = 'mapbox_directions',
  customGeometry,
  onRouteLoaded 
}: MapRouteProps) {
  const [, setRouteData] = useState<RouteData | null>(null)
  const [, setIsLoading] = useState(false)
  const [, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!map) return

    // Handle custom drawn geometry
    if (geometrySource === 'custom_drawn' && customGeometry) {
      try {
        const feature = JSON.parse(customGeometry)
        const geometry = feature.geometry

        if (!geometry || geometry.type !== 'LineString') {
          console.error('Invalid custom geometry: must be GeoJSON LineString')
          return
        }

        // Calculate approximate distance and duration from coordinates
        const coords = geometry.coordinates
        let totalDistance = 0
        
        for (let i = 0; i < coords.length - 1; i++) {
          const from = coords[i]
          const to = coords[i + 1]
          // Simple distance calculation (Haversine would be more accurate)
          const dx = to[0] - from[0]
          const dy = to[1] - from[1]
          totalDistance += Math.sqrt(dx * dx + dy * dy) * 111000 // rough meters conversion
        }

        const routeInfo: RouteData = {
          distance: totalDistance,
          duration: totalDistance / 1.4, // Rough walking speed estimate (1.4 m/s)
          geometry: geometry
        }

        setRouteData(routeInfo)
        onRouteLoaded?.(routeInfo)

        // Add custom route to map
        if (map.getSource('route')) {
          (map.getSource('route') as mapboxgl.GeoJSONSource).setData(geometry)
        } else {
          map.addSource('route', {
            type: 'geojson',
            data: geometry
          })

          // Add white border/outline
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

          // Add main custom route line (dark blue for custom routes)
          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#1e40af', // Dark blue for custom routes
              'line-width': 5,
              'line-opacity': 0.95
            }
          })
        }

        // Fit map to custom route bounds
        const coordinates = geometry.coordinates
        const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
        
        map.fitBounds(bounds, { padding: 50 })

      } catch (err) {
        console.error('Error parsing custom geometry:', err)
        setError('Invalid custom route geometry')
      }
      
      return
    }

    // Original Mapbox Directions API logic
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
  }, [map, from, to, profile, geometrySource, customGeometry])

  // No UI rendering - all handled in parent component via callback
  return null
}
