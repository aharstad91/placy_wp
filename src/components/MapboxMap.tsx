'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { POI } from '@/types/wordpress'
import MapRoute from './MapRoute'

interface MapboxMapProps {
  pois: POI[]
  center?: [number, number] // [longitude, latitude]
  zoom?: number
  className?: string
  onPoiClick?: (poi: POI) => void
  selectedPoi?: POI | null // POI that should be centered when set
  showRoute?: boolean // Whether to show route from routeFrom to selectedPoi
  routeFrom?: [number, number] // Starting point for route [lng, lat]
  routeProfile?: 'walking' | 'driving' | 'cycling' // Route type
  onRouteLoaded?: (data: { distance: number; duration: number }) => void // Callback when route is loaded
}

export default function MapboxMap({ 
  pois, 
  center = [10.3951, 63.4305], // Default: Trondheim/Ranheim
  zoom = 12,
  className = '',
  onPoiClick,
  selectedPoi,
  showRoute = false,
  routeFrom,
  routeProfile = 'walking',
  onRouteLoaded
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const hasInitializedBounds = useRef(false)
  const [showMiniPois, setShowMiniPois] = useState(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showMiniPois') === 'true'
    }
    return false
  })

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
      style: 'mapbox://styles/mapbox/outdoors-v12', // Outdoor/terrain style with contour lines
      center: center,
      zoom: zoom,
      maxZoom: 17, // Maximum zoom level
      attributionControl: false
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      console.log(`🗺️ Map loaded with initial zoom: ${map.current?.getZoom().toFixed(2)}`)
      
      // Log all layers to see what we're working with
      if (map.current) {
        const style = map.current.getStyle()
        if (style && style.layers) {
          console.log('🗺️ All map layers:', style.layers.map((l: any) => `${l.id} (${l.type})`))
          
          // Hide all symbol layers (labels, POIs, icons, text)
          style.layers.forEach((layer: any) => {
            if (layer.type === 'symbol') {
              map.current?.setLayoutProperty(layer.id, 'visibility', 'none')
              console.log(`🚫 Hid symbol layer: ${layer.id}`)
            }
          })
        }
      }
      
      setIsMapLoaded(true)
    })

    // Log zoom changes
    map.current.on('zoom', () => {
      if (map.current) {
        console.log(`🔍 Zoom changed to: ${map.current.getZoom().toFixed(2)}`)
      }
    })

    return () => {
      // Cleanup markers
      markers.current.forEach((marker: mapboxgl.Marker) => marker.remove())
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
    markers.current.forEach((marker: mapboxgl.Marker) => marker.remove())
    markers.current = []

    // Store marker elements and their metadata for zoom updates
    const markerElements: Array<{
      el: HTMLElement
      iconEl: HTMLElement | null
      baseMarkerSize: number
      baseBorderWidth: number
      baseIconFontSize: number
      markerOpacity: number
    }> = []

    // Global zoom handler for all markers
    const handleZoomChange = () => {
      if (!map.current) return
      
      const currentZoom = map.current.getZoom()
      // Progressive scaling: 1x below 15, 2x at 15-16, 3x at 16+
      let scaleFactor = 1.0
      if (currentZoom >= 16) {
        scaleFactor = 3.0
      } else if (currentZoom >= 15) {
        scaleFactor = 2.0
      }
      
      console.log(`🎯 MapboxMap POI scaling | Zoom: ${currentZoom.toFixed(2)} | ScaleFactor: ${scaleFactor} | Markers: ${markerElements.length}`)
      
      markerElements.forEach(({ el, iconEl, baseMarkerSize, baseBorderWidth, baseIconFontSize }) => {
        const adjustedMarkerSize = baseMarkerSize * scaleFactor
        const adjustedBorderWidth = baseBorderWidth * scaleFactor
        const adjustedIconFontSize = baseIconFontSize * scaleFactor
        
        el.style.width = `${adjustedMarkerSize}px`
        el.style.height = `${adjustedMarkerSize}px`
        el.style.borderWidth = `${adjustedBorderWidth}px`
        
        if (iconEl) {
          iconEl.style.fontSize = `${adjustedIconFontSize}px`
        }
      })
    }

    // Add markers for each POI
    pois.forEach((poi) => {
      const { poiLatitude, poiLongitude } = poi.poiFields
      
      if (!poiLatitude || !poiLongitude) return

      // Check if this is a Mini-POI
      const isMiniPoi = poi.poiTypes?.nodes?.some(type => type.slug === 'minor') || false
      
      // Skip Mini-POIs if toggle is off
      if (isMiniPoi && !showMiniPois) return

      // Get category icon (SVG file) - prioritize first category
      const categoryIcon = poi.poiCategories?.nodes?.[0]?.categoryFields?.categoryIcon?.node?.sourceUrl || null

      // Create container for marker + label
      const container = document.createElement('div')
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      `
      container.dataset.poiType = isMiniPoi ? 'minor' : 'major'

      // Base sizes for POI types
      const baseMarkerSize = isMiniPoi ? 30 : 40
      const baseBorderWidth = isMiniPoi ? 2 : 3
      const baseIconFontSize = isMiniPoi ? 16 : 20
      const markerOpacity = isMiniPoi ? 0.85 : 1

      // Create custom marker element (pin)
      const el = document.createElement('div')
      el.className = 'poi-marker'
      el.style.cssText = `
        width: ${baseMarkerSize}px;
        height: ${baseMarkerSize}px;
        background-color: #10b981;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${baseBorderWidth}px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
        opacity: ${markerOpacity};
      `
      
      // Add icon from category (SVG file)
      let iconEl: HTMLElement | null = null
      if (categoryIcon) {
        // categoryIcon is now a URL to the SVG file
        const iconUrl = categoryIcon
        
        // Create container for SVG using img tag (simpler and more reliable)
        const imgEl = document.createElement('img')
        imgEl.src = iconUrl
        iconEl = imgEl
        iconEl.style.cssText = `
          transform: rotate(45deg);
          width: ${baseIconFontSize}px;
          height: ${baseIconFontSize}px;
          filter: brightness(0) invert(1);
          display: block;
        `
        
        el.appendChild(iconEl)
      }
      
      // Store marker element data for zoom updates
      markerElements.push({
        el,
        iconEl,
        baseMarkerSize,
        baseBorderWidth,
        baseIconFontSize,
        markerOpacity
      })

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
          console.log(`🔍 Zoom level: ${zoom.toFixed(2)} | Labels visible: ${zoom >= 13}`)
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
          const targetZoom = Math.max(currentZoom, 14.5)
          console.log(`📍 POI clicked: "${poi.title}" | Current zoom: ${currentZoom.toFixed(2)} | Target zoom: ${targetZoom.toFixed(2)}`)
          map.current.easeTo({
            center: [poiLongitude, poiLatitude],
            zoom: targetZoom, // Zoom in to at least 14.5
            offset: [0, -200], // Offset upwards by 200px to center above bottom sheet
            duration: 500,
            essential: true // This animation is essential and will not be interrupted
          })
          
          onPoiClick(poi)
        }
      })

      markers.current.push(marker)
    })

    // Apply initial zoom scaling to all markers
    handleZoomChange()

    // Listen to zoom changes globally
    if (map.current) {
      map.current.on('zoom', handleZoomChange)
    }

    // Cleanup zoom listener
    return () => {
      if (map.current) {
        map.current.off('zoom', handleZoomChange)
      }
    }

    // Update Mini-POI visibility based on zoom level
    const updateMiniPoiVisibility = () => {
      if (!map.current) return
      const currentZoom = map.current.getZoom()
      console.log(`🗺️ Zoom level: ${currentZoom.toFixed(2)} | Mini-POIs visible at zoom 12+`)
      
      markers.current.forEach((marker: mapboxgl.Marker) => {
        const element = marker.getElement()
        if (element.dataset.poiType === 'minor') {
          // Show Mini-POIs only at zoom 12+
          element.style.display = currentZoom >= 12 ? 'flex' : 'none'
        }
      })
    }

    // Set initial visibility for Mini-POIs
    updateMiniPoiVisibility()

    // Listen to zoom changes for Mini-POI visibility
    if (map.current) {
      map.current.on('zoom', updateMiniPoiVisibility)
    }

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
  }, [pois, isMapLoaded, showMiniPois])

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

  // Memoize route coordinates to prevent infinite re-renders
  const routeTo = useMemo(() => {
    if (!selectedPoi) return null
    return [
      typeof selectedPoi.poiFields.poiLongitude === 'string' 
        ? parseFloat(selectedPoi.poiFields.poiLongitude)
        : selectedPoi.poiFields.poiLongitude,
      typeof selectedPoi.poiFields.poiLatitude === 'string'
        ? parseFloat(selectedPoi.poiFields.poiLatitude)
        : selectedPoi.poiFields.poiLatitude
    ] as [number, number]
  }, [selectedPoi])

  // Handle toggle change
  const handleToggleMiniPois = () => {
    const newValue = !showMiniPois
    setShowMiniPois(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem('showMiniPois', String(newValue))
    }
  }

  return (
    <>
      <div 
        ref={mapContainer} 
        className={`w-full h-full ${className}`}
        style={{ minHeight: '400px' }}
      />
      
      {/* Mini-POI Toggle Control */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMiniPois}
            onChange={handleToggleMiniPois}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Vis detaljer
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Benker, lekeplasser, volleyball
        </p>
      </div>
      
      {/* Show route if enabled and we have all required data */}
      {showRoute && routeFrom && routeTo && isMapLoaded && (
        <MapRoute
          map={map.current}
          from={routeFrom}
          to={routeTo}
          profile={routeProfile}
          onRouteLoaded={onRouteLoaded}
        />
      )}
    </>
  )
}
