'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { POI } from '@/types/wordpress'

interface MapboxMapProps {
  pois: POI[]
  center?: [number, number] // [longitude, latitude]
  zoom?: number
  className?: string
  onPoiClick?: (poi: POI) => void
  selectedPoi?: POI | null // POI that should be centered when set
}

export default function MapboxMap({ 
  pois, 
  center = [10.3951, 63.4305], // Default: Trondheim/Ranheim
  zoom = 12,
  className = '',
  onPoiClick,
  selectedPoi
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const hasInitializedBounds = useRef(false)

  // Initialize map
  useEffect(() => {
    if (map.current) return // Initialize map only once
    if (!mapContainer.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      console.error('Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local')
      return
    }

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Clean, light style
      center: center,
      zoom: zoom,
      attributionControl: false
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setIsMapLoaded(true)
    })

    return () => {
      // Cleanup markers
      markers.current.forEach(marker => marker.remove())
      markers.current = []
      
      // Cleanup map
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, []) // Only run once on mount

  // Update markers when POIs change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return

    // Remove existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add markers for each POI
    pois.forEach((poi) => {
      const { poiLatitude, poiLongitude, poiIcon, poiDescription } = poi.poiFields
      
      if (!poiLatitude || !poiLongitude) return

      // Create container for marker + label
      const container = document.createElement('div')
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      `

      // Create custom marker element (pin)
      const el = document.createElement('div')
      el.className = 'poi-marker'
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #10b981;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
        position: relative;
      `
      
      // Add icon if available
      if (poiIcon) {
        const iconEl = document.createElement('span')
        iconEl.textContent = poiIcon
        iconEl.style.cssText = `
          transform: rotate(45deg);
          font-size: 20px;
        `
        el.appendChild(iconEl)
      }

      // Create label element
      const labelEl = document.createElement('div')
      labelEl.textContent = poi.title
      labelEl.className = 'poi-label'
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
        pointer-events: none;
        transition: opacity 0.2s;
        opacity: 0;
      `

      // Append pin and label to container
      container.appendChild(el)
      container.appendChild(labelEl)

      // Update label visibility based on zoom level
      const updateLabelVisibility = () => {
        if (map.current) {
          const zoom = map.current.getZoom()
          // Show labels when zoom level is 13 or higher (adjust this threshold as needed)
          labelEl.style.opacity = zoom >= 13 ? '1' : '0'
        }
      }

      // Set initial visibility
      updateLabelVisibility()

      // Listen to zoom changes
      if (map.current) {
        map.current.on('zoom', updateLabelVisibility)
      }

      // Add hover effect
      container.addEventListener('mouseenter', () => {
        el.style.transform = 'rotate(-45deg) scale(1.1)'
        labelEl.style.fontWeight = '700'
      })
      container.addEventListener('mouseleave', () => {
        el.style.transform = 'rotate(-45deg) scale(1)'
        labelEl.style.fontWeight = '600'
      })

      // Create marker - use bottom anchor since we now have label below
      // No popup needed - we use bottom sheet instead
      const marker = new mapboxgl.Marker({ 
        element: container,
        anchor: 'bottom'
      })
        .setLngLat([poiLongitude, poiLatitude])
        .addTo(map.current!)

      // Add click handler to container
      container.addEventListener('click', () => {
        if (onPoiClick && map.current) {
          // Center map on this POI when clicked with offset for bottom sheet
          const currentZoom = map.current.getZoom()
          map.current.easeTo({
            center: [poiLongitude, poiLatitude],
            zoom: Math.max(currentZoom, 14.5), // Zoom in to at least 14.5
            offset: [0, -200], // Offset upwards by 200px to center above bottom sheet
            duration: 500,
            essential: true // This animation is essential and will not be interrupted
          })
          
          onPoiClick(poi)
        }
      })

      markers.current.push(marker)
    })

    // Fit bounds to show all markers ONLY on initial load (not when selectedPoi changes)
    if (!hasInitializedBounds.current && map.current) {
      if (pois.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        pois.forEach(poi => {
          const { poiLatitude, poiLongitude } = poi.poiFields
          if (poiLatitude && poiLongitude) {
            bounds.extend([poiLongitude, poiLatitude])
          }
        })
        // Use setTimeout to ensure this happens after markers are added
        setTimeout(() => {
          if (map.current) {
            map.current.fitBounds(bounds, { padding: 80, maxZoom: 13 })
            hasInitializedBounds.current = true
          }
        }, 100)
      } else if (pois.length === 1) {
        // If only one POI, center on it
        const poi = pois[0]
        map.current.setCenter([poi.poiFields.poiLongitude, poi.poiFields.poiLatitude])
        map.current.setZoom(14)
        hasInitializedBounds.current = true
      }
    }
  }, [pois, isMapLoaded])

  // Center map on selected POI when it changes
  useEffect(() => {
    if (!map.current || !isMapLoaded || !selectedPoi) return

    const { poiLatitude, poiLongitude } = selectedPoi.poiFields
    if (!poiLatitude || !poiLongitude) return

    // Center map on selected POI with offset for bottom sheet
    const currentZoom = map.current.getZoom()
    map.current.easeTo({
      center: [poiLongitude, poiLatitude],
      zoom: Math.max(currentZoom, 14.5),
      offset: [0, -200],
      duration: 500,
      essential: true
    })
  }, [selectedPoi, isMapLoaded])

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}
