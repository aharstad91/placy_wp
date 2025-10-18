'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { POI } from '@/types/wordpress'

interface RouteMapProps {
  mode: 'preview' | 'fullscreen'
  startLocation: {
    latitude: number
    longitude: number
    name: string
    image?: string
    includeApproachInRoute?: boolean
    showReturnRoute?: boolean
  }
  waypoints: Array<{
    latitude: number
    longitude: number
    name: string
    icon?: string
    image?: string
    estimatedTime?: number
    categoryIcon?: string // FontAwesome class from POI category
  }>
  // Preview mode props
  onMapClick?: () => void
  // Fullscreen mode props
  isOpen?: boolean
  onClose?: () => void
  waypointPois?: POI[] // Major POIs from waypoints (always visible)
  allPois?: POI[] // All POIs within bounds (for Mini-POI filtering)
  selectedPoi?: POI | null
  onPoiSelect?: (poi: POI) => void
  // Route metadata
  routeDuration?: number
  routeDistance?: number
  routeDifficulty?: string
  // Route geometry
  routeGeometrySource?: 'mapbox_directions' | 'custom_drawn'
  routeGeometryJson?: string
  // Map bounds
  mapBounds?: {
    north: number
    south: number
    east: number
    west: number
  }
  // Display settings
  waypointDisplayMode?: 'numbers' | 'icons'
}

// Standardized zoom levels for consistent UX across all routes
const MAP_MIN_ZOOM = 11  // Prevents zooming too far out
const MAP_MAX_ZOOM = 17  // Prevents zooming too close

export default function RouteMap({
  mode,
  startLocation,
  waypoints,
  onMapClick,
  isOpen = true,
  onClose,
  waypointPois = [],
  allPois = [],
  selectedPoi,
  onPoiSelect,
  routeDuration,
  routeDistance,
  routeDifficulty,
  routeGeometrySource = 'mapbox_directions',
  routeGeometryJson,
  mapBounds,
  waypointDisplayMode = 'numbers'
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [localSelectedPoi, setLocalSelectedPoi] = useState<POI | null>(selectedPoi || null)
  
  const [showMiniPois, setShowMiniPois] = useState(() => {
    // Load Mini-POI visibility from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showMiniPois')
      return saved === 'true'
    }
    return false
  })
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const timeBadgeElementsRef = useRef<HTMLElement[]>([])
  const hasSetInitialBounds = useRef(false)

  // Save Mini-POI toggle state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showMiniPois', showMiniPois.toString())
    }
  }, [showMiniPois])

  // Update localSelectedPoi when selectedPoi prop changes
  useEffect(() => {
    if (selectedPoi) {
      setLocalSelectedPoi(selectedPoi)
    }
  }, [selectedPoi])

  // Initialize map
  useEffect(() => {
    // For fullscreen mode, only initialize when open
    if (mode === 'fullscreen' && !isOpen) return undefined
    
    if (!mapContainer.current || map.current) return undefined

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      
      // Calculate initial bounds to avoid jump
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([startLocation.longitude, startLocation.latitude])
      waypoints.forEach(wp => {
        bounds.extend([wp.longitude, wp.latitude])
      })
      
      // Set maxBounds if provided (geographic boundary)
      const maxBounds = mapBounds ? [
        [mapBounds.west, mapBounds.south], // Southwest corner
        [mapBounds.east, mapBounds.north]  // Northeast corner
      ] as [[number, number], [number, number]] : undefined
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        bounds: bounds,
        fitBoundsOptions: {
          padding: mode === 'preview' ? 50 : 80,
          duration: 0 // No animation on initial load
        },
        maxBounds: maxBounds, // Restrict panning outside this area
        minZoom: MAP_MIN_ZOOM,  // Prevent zooming too far out
        maxZoom: MAP_MAX_ZOOM   // Prevent zooming too close
      })

      // Add navigation controls for fullscreen mode
      if (mode === 'fullscreen') {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      }

      let hasLoaded = false

      map.current.on('load', () => {
        hasLoaded = true
        console.log(`🗺️ RouteMap loaded with zoom: ${map.current?.getZoom().toFixed(2)}`)
        
        // Hide all Mapbox POI/label layers to keep map clean
        if (map.current) {
          const style = map.current.getStyle()
          if (style && style.layers) {
            console.log('🗺️ All RouteMap layers:', style.layers.map((l: any) => `${l.id} (${l.type})`))
            
            // Hide all symbol layers (labels, POIs, icons, text)
            style.layers.forEach((layer: any) => {
              if (layer.type === 'symbol') {
                map.current?.setLayoutProperty(layer.id, 'visibility', 'none')
                console.log(`🚫 Hid RouteMap symbol layer: ${layer.id}`)
              }
            })
          }
        }
        
        setMapLoaded(true)
        setMapError(false)
      })

      // Log all zoom changes
      map.current.on('zoom', () => {
        if (map.current) {
          console.log(`🔍 RouteMap zoom: ${map.current.getZoom().toFixed(2)}`)
        }
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
      }, 10000)

      return () => {
        clearTimeout(loadTimeout)
        if (map.current) {
          map.current.remove()
          map.current = null
        }
        markersRef.current = []
        setMapLoaded(false)
      }
    } catch (error) {
      console.error('Failed to initialize map:', error)
      setMapError(true)
      return undefined
    }
  }, [mode, isOpen, startLocation.latitude, startLocation.longitude])

  // Add click handler to close POI modal when clicking on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const handleMapClick = () => {
      // Only close if a POI is selected and click is on map (not on markers)
      if (localSelectedPoi) {
        setLocalSelectedPoi(null)
      }
    }

    map.current.on('click', handleMapClick)

    return () => {
      map.current?.off('click', handleMapClick)
    }
  }, [mapLoaded, localSelectedPoi])

  // Add markers and route when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Store marker elements for dynamic zoom scaling
    const markerElements: Array<{
      type: 'start' | 'waypoint-with-image' | 'waypoint-no-image'
      mainElement: HTMLElement // The main icon/image element
      badgeElement?: HTMLElement // Optional badge element
      svgElement?: HTMLImageElement // Optional SVG img element (for category icons)
      badgeSvgElement?: HTMLImageElement // Optional SVG img element in badge
      baseSizes: {
        main: number
        badge?: number
        fontSize?: number
        svgIcon?: number // Base size for SVG icons
        badgeSvgIcon?: number // Base size for badge SVG icons
      }
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
      
      console.log(`🎯 RouteMap marker scaling | Zoom: ${currentZoom.toFixed(2)} | ScaleFactor: ${scaleFactor} | Markers: ${markerElements.length}`)
      
      markerElements.forEach(({ mainElement, badgeElement, svgElement, badgeSvgElement, baseSizes }) => {
        const adjustedMainSize = baseSizes.main * scaleFactor
        mainElement.style.width = `${adjustedMainSize}px`
        mainElement.style.height = `${adjustedMainSize}px`
        
        // Scale SVG icon in main element (category icon in waypoint circle)
        if (svgElement && baseSizes.svgIcon) {
          const adjustedSvgSize = baseSizes.svgIcon * scaleFactor
          svgElement.style.width = `${adjustedSvgSize}px`
          svgElement.style.height = `${adjustedSvgSize}px`
        }
        
        if (badgeElement && baseSizes.badge) {
          const adjustedBadgeSize = baseSizes.badge * scaleFactor
          badgeElement.style.width = `${adjustedBadgeSize}px`
          badgeElement.style.height = `${adjustedBadgeSize}px`
          badgeElement.style.lineHeight = `${adjustedBadgeSize}px`
          
          // Scale SVG icon in badge
          if (badgeSvgElement && baseSizes.badgeSvgIcon) {
            const adjustedBadgeSvgSize = baseSizes.badgeSvgIcon * scaleFactor
            badgeSvgElement.style.width = `${adjustedBadgeSvgSize}px`
            badgeSvgElement.style.height = `${adjustedBadgeSvgSize}px`
          }
          
          // Update badge font size too
          if (baseSizes.fontSize) {
            const adjustedBadgeFontSize = baseSizes.fontSize * scaleFactor
            badgeElement.style.fontSize = `${adjustedBadgeFontSize}px`
            // Also update any child elements (like FontAwesome icons)
            const badgeIcon = badgeElement.querySelector('i')
            if (badgeIcon) {
              (badgeIcon as HTMLElement).style.fontSize = `${adjustedBadgeFontSize}px`
            }
          }
        }
        
        if (baseSizes.fontSize) {
          const adjustedFontSize = baseSizes.fontSize * scaleFactor
          // Update mainElement fontSize
          mainElement.style.fontSize = `${adjustedFontSize}px`
          // Also update any child elements (like FontAwesome icons in numberCircle/iconCircle)
          const mainIcon = mainElement.querySelector('i')
          if (mainIcon) {
            (mainIcon as HTMLElement).style.fontSize = `${adjustedFontSize}px`
          }
        }
      })
    }

    // Add START LOCATION marker with same design as POI markers
    const startMarkerEl = document.createElement('div')
    startMarkerEl.style.cssText = `
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
    `

    // Start icon - use image if available, otherwise flag emoji
    const startIcon = document.createElement('div')
    if (startLocation.image) {
      startIcon.innerHTML = `<img src="${startLocation.image}" alt="${startLocation.name}" style="width: 100%; height: 100%; object-fit: cover;" />`
      startIcon.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background-color: white;
      `
      // Store for zoom scaling
      markerElements.push({
        type: 'start',
        mainElement: startIcon,
        baseSizes: { main: 40 }
      })
    } else {
      startIcon.innerHTML = '🚩'
      startIcon.style.cssText = `
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      `
      // Store for zoom scaling
      markerElements.push({
        type: 'start',
        mainElement: startIcon,
        baseSizes: { main: 32, fontSize: 28 }
      })
    }
    startMarkerEl.appendChild(startIcon)

    // Horizontal wrapper for badge and label
    const startWrapper = document.createElement('div')
    startWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px 2px 2px;
      background-color: rgba(0,0,0,0.15);
      border-radius: 12px;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    `

    // Start badge with flag icon
    const startBadge = document.createElement('div')
    startBadge.textContent = '⚑'
    startBadge.style.cssText = `
      width: 18px;
      height: 18px;
      background-color: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      flex-shrink: 0;
      line-height: 18px;
    `
    // Update the markerElement to include the badge
    const lastMarker = markerElements[markerElements.length - 1]
    if (lastMarker) {
      lastMarker.badgeElement = startBadge
      lastMarker.baseSizes.badge = 18
      lastMarker.baseSizes.fontSize = 11
    }
    startWrapper.appendChild(startBadge)

    // Start label
    const startLabel = document.createElement('div')
    startLabel.textContent = startLocation.name
    startLabel.style.cssText = `
      font-size: 12px;
      font-weight: 700;
      color: white;
      text-align: left;
      max-width: 100px;
      line-height: 1.3;
      text-shadow: 
        0 1px 2px rgba(0,0,0,0.8),
        0 2px 4px rgba(0,0,0,0.5);
    `
    startWrapper.appendChild(startLabel)
    startMarkerEl.appendChild(startWrapper)
    
    const startMarker = new mapboxgl.Marker({ element: startMarkerEl, anchor: 'bottom' })
      .setLngLat([startLocation.longitude, startLocation.latitude])
      .addTo(map.current!)
    
    markersRef.current.push(startMarker)

    // Add waypoint markers with modern map-style design
    waypoints.forEach((waypoint, index) => {
      // Main container - no background, transparent
      const container = document.createElement('div')
      container.style.cssText = `
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
      `

      let horizontalWrapper: HTMLElement | null = null

      if (waypoint.image) {
        // Circular image container at top (centered)
        const imageContainer = document.createElement('div')
        imageContainer.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
        container.appendChild(imageContainer)
        
        // Store for zoom scaling
        markerElements.push({
          type: 'waypoint-with-image',
          mainElement: imageContainer,
          baseSizes: { main: 32 }
        })

        // Horizontal wrapper for badge and label (below image) - single combined element
        // Show number badge OR category icon based on waypointDisplayMode
        if (waypointDisplayMode === 'numbers') {
          horizontalWrapper = document.createElement('div')
          horizontalWrapper.style.cssText = `
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px 6px 2px 2px;
            background-color: rgba(0,0,0,0.15);
            border-radius: 12px;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          `

          // Number badge to the LEFT of label
          const badge = document.createElement('div')
          badge.textContent = (index + 1).toString()
          badge.style.cssText = `
            width: 18px;
            height: 18px;
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            flex-shrink: 0;
            line-height: 18px;
          `
          // Update the last marker element to include badge
          const lastMarker = markerElements[markerElements.length - 1]
          if (lastMarker) {
            lastMarker.badgeElement = badge
            lastMarker.baseSizes.badge = 18
            lastMarker.baseSizes.fontSize = 10
          }
          horizontalWrapper.appendChild(badge)
        } else if (waypointDisplayMode === 'icons' && waypoint.categoryIcon) {
          // Show category icon badge to the LEFT of label
          horizontalWrapper = document.createElement('div')
          horizontalWrapper.style.cssText = `
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px 6px 2px 2px;
            background-color: rgba(0,0,0,0.15);
            border-radius: 12px;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          `

          // Icon badge to the LEFT of label
          const iconBadge = document.createElement('div')
          
          // Check if categoryIcon is a URL (SVG file) or FontAwesome class
          const isSvgUrl = waypoint.categoryIcon.startsWith('http')
          let badgeSvgImg: HTMLImageElement | undefined
          
          if (isSvgUrl) {
            // Use SVG file as img
            const imgEl = document.createElement('img')
            imgEl.src = waypoint.categoryIcon
            imgEl.alt = 'Category icon'
            imgEl.style.cssText = `
              width: 10px;
              height: 10px;
              filter: brightness(0) invert(1);
            `
            iconBadge.appendChild(imgEl)
            badgeSvgImg = imgEl
          } else {
            // Use FontAwesome icon
            iconBadge.innerHTML = `<i class="fa-solid ${waypoint.categoryIcon}"></i>`
          }
          
          iconBadge.style.cssText = `
            width: 18px;
            height: 18px;
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            flex-shrink: 0;
          `
          // Update the last marker element to include badge
          const lastMarker = markerElements[markerElements.length - 1]
          if (lastMarker) {
            lastMarker.badgeElement = iconBadge
            lastMarker.badgeSvgElement = badgeSvgImg
            lastMarker.baseSizes.badge = 18
            lastMarker.baseSizes.fontSize = 9
            if (isSvgUrl) {
              lastMarker.baseSizes.badgeSvgIcon = 10
            }
          }
          horizontalWrapper.appendChild(iconBadge)
        }
      } else {
        // No image - show numbered circle OR category icon based on waypointDisplayMode
        if (waypointDisplayMode === 'numbers') {
          // Show numbered circle (existing behavior)
          const numberCircle = document.createElement('div')
          numberCircle.innerHTML = waypoint.icon || (index + 1).toString()
          numberCircle.style.cssText = `
            width: 36px;
            height: 36px;
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `
          container.appendChild(numberCircle)
          
          // Store for zoom scaling
          markerElements.push({
            type: 'waypoint-no-image',
            mainElement: numberCircle,
            baseSizes: { main: 36, fontSize: 16 }
          })
        } else if (waypointDisplayMode === 'icons' && waypoint.categoryIcon) {
          // Show category icon instead of number
          const iconCircle = document.createElement('div')
          
          // Check if categoryIcon is a URL (SVG file) or FontAwesome class
          const isSvgUrl = waypoint.categoryIcon.startsWith('http')
          let svgImg: HTMLImageElement | undefined
          
          if (isSvgUrl) {
            // Use SVG file as img
            const imgEl = document.createElement('img')
            imgEl.src = waypoint.categoryIcon
            imgEl.alt = 'Category icon'
            imgEl.style.cssText = `
              width: 16px;
              height: 16px;
              filter: brightness(0) invert(1);
            `
            iconCircle.appendChild(imgEl)
            svgImg = imgEl
          } else {
            // Use FontAwesome icon
            iconCircle.innerHTML = `<i class="fa-solid ${waypoint.categoryIcon}"></i>`
          }
          
          iconCircle.style.cssText = `
            width: 36px;
            height: 36px;
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `
          container.appendChild(iconCircle)
          
          // Store for zoom scaling
          markerElements.push({
            type: 'waypoint-no-image',
            mainElement: iconCircle,
            svgElement: svgImg,
            baseSizes: { 
              main: 36, 
              fontSize: 16,
              svgIcon: isSvgUrl ? 16 : undefined
            }
          })
        }
      }

      // Label text with white color and lighter shadow
      const labelEl = document.createElement('div')
      labelEl.textContent = waypoint.name
      
      if (waypoint.image && horizontalWrapper) {
        // For image markers with badge, label is part of horizontal wrapper (no separate background)
        labelEl.style.cssText = `
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-align: left;
          max-width: 100px;
          line-height: 1.3;
          text-shadow: 
            0 1px 2px rgba(0,0,0,0.8),
            0 2px 4px rgba(0,0,0,0.5);
        `
        horizontalWrapper.appendChild(labelEl)
        container.appendChild(horizontalWrapper)
      } else if (waypoint.image && waypointDisplayMode === 'icons') {
        // For image markers WITHOUT badge (when icons mode is active)
        labelEl.style.cssText = `
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-align: center;
          max-width: 100px;
          line-height: 1.3;
          text-shadow: 
            0 1px 2px rgba(0,0,0,0.8),
            0 2px 4px rgba(0,0,0,0.5);
          padding: 3px 6px;
          background-color: rgba(0,0,0,0.15);
          border-radius: 4px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          margin-top: 2px;
        `
        container.appendChild(labelEl)
      } else if (!waypoint.image && waypointDisplayMode === 'numbers') {
        // For non-image markers with number circle, keep vertical layout with background
        labelEl.style.cssText = `
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-align: center;
          max-width: 100px;
          line-height: 1.3;
          text-shadow: 
            0 1px 2px rgba(0,0,0,0.8),
            0 2px 4px rgba(0,0,0,0.5);
          padding: 3px 6px;
          background-color: rgba(0,0,0,0.15);
          border-radius: 4px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        `
        container.appendChild(labelEl)
      } else if (!waypoint.image && waypointDisplayMode === 'icons') {
        // For non-image markers WITH icon circle (when icons mode is active) - show label
        labelEl.style.cssText = `
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-align: center;
          max-width: 100px;
          line-height: 1.3;
          text-shadow: 
            0 1px 2px rgba(0,0,0,0.8),
            0 2px 4px rgba(0,0,0,0.5);
          padding: 3px 6px;
          background-color: rgba(0,0,0,0.15);
          border-radius: 4px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        `
        container.appendChild(labelEl)
      }

      // Add hover effect - subtle scale on image/circle only
      if (waypoint.image) {
        const imageContainer = container.firstChild as HTMLElement
        container.addEventListener('mouseenter', () => {
          if (imageContainer) {
            imageContainer.style.transform = 'scale(1.1)'
            imageContainer.style.transition = 'transform 0.2s ease'
          }
        })
        container.addEventListener('mouseleave', () => {
          if (imageContainer) {
            imageContainer.style.transform = 'scale(1)'
          }
        })
      }

      // Click handler for fullscreen mode to show POI details
      if (mode === 'fullscreen' && waypointPois[index] && onPoiSelect) {
        const poi = waypointPois[index]
        container.addEventListener('click', (e) => {
          e.stopPropagation() // Prevent map click from triggering
          setLocalSelectedPoi(poi)
          onPoiSelect(poi)
        })
      }

      const marker = new mapboxgl.Marker({ element: container, anchor: 'bottom' })
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .addTo(map.current!)
      
      markersRef.current.push(marker)
    })

    // Apply initial zoom scaling to all markers
    handleZoomChange()

    // Listen to zoom changes globally for marker scaling
    if (map.current) {
      map.current.on('zoom', handleZoomChange)
    }

    // Fetch and draw route in three segments with different styling
    const fetchRoute = async () => {
      // Approach toggle: changes color (dark blue if part of route, light blue if not)
      const approachIsMainRoute = startLocation.includeApproachInRoute === true
      // Return toggle: show/hide (if true, show light blue line; if false, don't show)
      const showReturn = startLocation.showReturnRoute === true

      // Segment 1: Start to first POI (always drawn, style depends on toggle)
      const approachCoords = [
        [startLocation.longitude, startLocation.latitude],
        [waypoints[0].longitude, waypoints[0].latitude]
      ]

      // Segment 2: POI to POI (main route - always solid dark blue)
      // Note: Mapbox Directions API has a 25 waypoint limit per request
      const mainCoords = waypoints.map(wp => [wp.longitude, wp.latitude])
      console.log(`🎯 Total waypoints for main route: ${mainCoords.length}`)

      // Segment 3: Last POI back to start (conditional - only if showReturn is true)
      const returnCoords = showReturn ? [
        [waypoints[waypoints.length - 1].longitude, waypoints[waypoints.length - 1].latitude],
        [startLocation.longitude, startLocation.latitude]
      ] : null

      // Check if custom geometry is provided
      if (routeGeometrySource === 'custom_drawn' && routeGeometryJson) {
        console.log('🎨 Using custom drawn route geometry (skipping Directions API)')
        
        try {
          const customFeature = JSON.parse(routeGeometryJson)
          const customGeometry = customFeature.geometry
          
          if (customGeometry && customGeometry.type === 'LineString') {
            // Use custom geometry for main route
            if (map.current) {
              // Remove old route layers
              const layersToRemove = [
                'route-approach', 'route-approach-border',
                'route-main', 'route-main-border',
                'route-return', 'route-return-border'
              ]
              
              layersToRemove.forEach(layerId => {
                if (map.current?.getLayer(layerId)) {
                  map.current.removeLayer(layerId)
                }
              })
              
              const sourcesToRemove = ['route-approach', 'route-main', 'route-return']
              sourcesToRemove.forEach(sourceId => {
                if (map.current?.getSource(sourceId)) {
                  map.current.removeSource(sourceId)
                }
              })
              
              // Add custom route as main route
              map.current.addSource('route-main', {
                type: 'geojson',
                data: customGeometry
              })
              
              // Add border (white outline)
              map.current.addLayer({
                id: 'route-main-border',
                type: 'line',
                source: 'route-main',
                paint: {
                  'line-color': '#ffffff',
                  'line-width': 8,
                  'line-opacity': 1
                }
              })
              
              // Add main custom route line (dark blue)
              map.current.addLayer({
                id: 'route-main',
                type: 'line',
                source: 'route-main',
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
              
              console.log('✅ Custom route rendered successfully')
            }
          }
        } catch (error) {
          console.error('❌ Failed to parse custom route geometry:', error)
        }
        
        return // Skip Directions API
      }

      // Original Directions API logic (only runs if NOT custom_drawn)
      console.log('🗺️ Using Mapbox Directions API for route')
      
      // Fetch all segments
      const fetchSegment = async (coords: number[][] | null, segmentName: string) => {
        if (!coords) return null
        
        const coordsString = coords.map(c => `${c[0]},${c[1]}`).join(';')
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        
        console.log(`🗺️ Fetching ${segmentName} route:`, coordsString)
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.code !== 'Ok') {
          console.error(`❌ Mapbox Directions API error for ${segmentName}:`, data)
          return null
        }
        
        console.log(`✅ ${segmentName} route fetched successfully`)
        return data.routes?.[0]?.geometry
      }

      try {
        const [approachRoute, mainRoute, returnRoute] = await Promise.all([
          fetchSegment(approachCoords, 'approach'),
          fetchSegment(mainCoords, 'main'),
          fetchSegment(returnCoords, 'return')
        ])

        if (map.current) {
          // Remove old route layers (including borders)
          const layersToRemove = [
            'route-approach', 'route-approach-border',
            'route-main', 'route-main-border',
            'route-return', 'route-return-border'
          ]
          
          layersToRemove.forEach(layerId => {
            if (map.current?.getLayer(layerId)) {
              map.current.removeLayer(layerId)
            }
          })
          
          const sourcesToRemove = ['route-approach', 'route-main', 'route-return']
          sourcesToRemove.forEach(sourceId => {
            if (map.current?.getSource(sourceId)) {
              map.current.removeSource(sourceId)
            }
          })

          // Add approach route (style depends on toggle)
          if (approachRoute) {
            map.current.addSource('route-approach', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: approachRoute
              }
            })

            // Border/outline layer (darker blue, thicker)
            map.current.addLayer({
              id: 'route-approach-border',
              type: 'line',
              source: 'route-approach',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1e40af',
                'line-width': 6,
                'line-opacity': 0.8
              }
            })

            // Main line layer (color depends on toggle: dark blue if part of route, light blue if not)
            map.current.addLayer({
              id: 'route-approach',
              type: 'line',
              source: 'route-approach',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': approachIsMainRoute ? '#3b82f6' : '#bfdbfe',
                'line-width': 4,
                'line-opacity': 0.9
              }
            })
          }

          // Add main route (blue with dark border)
          if (mainRoute) {
            map.current.addSource('route-main', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: mainRoute
              }
            })

            // Border/outline layer (darker blue, thicker)
            map.current.addLayer({
              id: 'route-main-border',
              type: 'line',
              source: 'route-main',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1e40af',
                'line-width': 6,
                'line-opacity': 0.8
              }
            })

            // Main line layer (blue, thinner - on top)
            map.current.addLayer({
              id: 'route-main',
              type: 'line',
              source: 'route-main',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.9
              }
            })
          }

          // Add return route (style depends on toggle)
          if (returnRoute) {
            map.current.addSource('route-return', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: returnRoute
              }
            })

            // Border/outline layer (darker blue, thicker)
            map.current.addLayer({
              id: 'route-return-border',
              type: 'line',
              source: 'route-return',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1e40af',
                'line-width': 6,
                'line-opacity': 0.8
              }
            })

            // Main line layer (always light blue - return is never part of main route)
            map.current.addLayer({
              id: 'route-return',
              type: 'line',
              source: 'route-return',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#bfdbfe',
                'line-width': 4,
                'line-opacity': 0.9
              }
            })
          }

          // Combine all route coordinates for bounds and time badges
          const allRouteCoords = [
            ...(approachRoute?.coordinates || []),
            ...(mainRoute?.coordinates || []),
            ...(returnRoute?.coordinates || [])
          ]
          const route = { coordinates: allRouteCoords }

          // Add time badges only in fullscreen mode
          const routeCoords = route.coordinates
          const allPoints = [
            [startLocation.longitude, startLocation.latitude],
            ...waypoints.map(wp => [wp.longitude, wp.latitude]),
            [startLocation.longitude, startLocation.latitude] // Return to start
          ]
          
          // Clear old time badges from ref
          timeBadgeElementsRef.current = []
          
          // Only create time badges in fullscreen mode
          if (mode === 'fullscreen') {
            for (let i = 1; i < allPoints.length; i++) {
              // Determine if this is the last segment (return to start)
              const isReturnSegment = i === allPoints.length - 1
              
              // Get estimated time: use first waypoint's time for return segment
              let estimatedTime: number | undefined
              if (isReturnSegment) {
                // For return to start, use first waypoint's time as estimate
                estimatedTime = waypoints[0]?.estimatedTime
              } else {
                estimatedTime = waypoints[i - 1]?.estimatedTime
              }
            
            if (!estimatedTime || estimatedTime === 0) continue
            
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
              timeBadge.className = 'route-time-badge'
              
              // Always start hidden, zoom listener will show them if needed
              timeBadge.style.cssText = `
                background-color: #3b82f6;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
                border: 2px solid white;
                cursor: default;
                display: none;
              `
              timeBadge.textContent = `${estimatedTime} min`

              const timeBadgeMarker = new mapboxgl.Marker({ 
                element: timeBadge,
                anchor: 'center'
              })
                .setLngLat([midCoord[0], midCoord[1]])
                .addTo(map.current!)
              
              markersRef.current.push(timeBadgeMarker)
              timeBadgeElementsRef.current.push(timeBadge)
            }
            }
          }

          const bounds = new mapboxgl.LngLatBounds()
          route.coordinates.forEach((coord: [number, number]) => bounds.extend(coord))
          const padding = mode === 'preview' ? 50 : 80
          
          // Only fit bounds on initial load, not when POI is selected
          if (!hasSetInitialBounds.current) {
            map.current.fitBounds(bounds, { 
              padding,
              duration: 800, // Smooth animation
              essential: true // Animation will happen even if user prefers reduced motion
            })
            hasSetInitialBounds.current = true
          }
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
        
        // Fallback: draw straight lines between points
        if (map.current) {
          // Remove old layers (including borders)
          const layersToRemove = [
            'route-approach', 'route-approach-border',
            'route-main', 'route-main-border',
            'route-return', 'route-return-border'
          ]
          
          layersToRemove.forEach(layerId => {
            if (map.current?.getLayer(layerId)) {
              map.current.removeLayer(layerId)
            }
          })
          
          const sourcesToRemove = ['route-approach', 'route-main', 'route-return']
          sourcesToRemove.forEach(sourceId => {
            if (map.current?.getSource(sourceId)) {
              map.current.removeSource(sourceId)
            }
          })

          // Approach route (light blue with border)
          map.current.addSource('route-approach', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [startLocation.longitude, startLocation.latitude],
                  [waypoints[0].longitude, waypoints[0].latitude]
                ]
              }
            }
          })

          map.current.addLayer({
            id: 'route-approach-border',
            type: 'line',
            source: 'route-approach',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1e40af',
              'line-width': 6,
              'line-opacity': 0.8
            }
          })

          map.current.addLayer({
            id: 'route-approach',
            type: 'line',
            source: 'route-approach',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#bfdbfe',
              'line-width': 4,
              'line-opacity': 0.9
            }
          })

          // Main route (blue with border)
          map.current.addSource('route-main', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: waypoints.map(wp => [wp.longitude, wp.latitude])
              }
            }
          })

          map.current.addLayer({
            id: 'route-main-border',
            type: 'line',
            source: 'route-main',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1e40af',
              'line-width': 6,
              'line-opacity': 0.8
            }
          })

          map.current.addLayer({
            id: 'route-main',
            type: 'line',
            source: 'route-main',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.9
            }
          })

          // Return route (light blue with border)
          map.current.addSource('route-return', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [waypoints[waypoints.length - 1].longitude, waypoints[waypoints.length - 1].latitude],
                  [startLocation.longitude, startLocation.latitude]
                ]
              }
            }
          })

          map.current.addLayer({
            id: 'route-return-border',
            type: 'line',
            source: 'route-return',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1e40af',
              'line-width': 6,
              'line-opacity': 0.8
            }
          })

          map.current.addLayer({
            id: 'route-return',
            type: 'line',
            source: 'route-return',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#bfdbfe',
              'line-width': 4,
              'line-opacity': 0.9
            }
          })

          // Fit bounds to all points - only on initial load
          if (!hasSetInitialBounds.current) {
            const bounds = new mapboxgl.LngLatBounds()
            bounds.extend([startLocation.longitude, startLocation.latitude])
            waypoints.forEach(wp => bounds.extend([wp.longitude, wp.latitude]))
            map.current.fitBounds(bounds, { 
              padding: 50,
              duration: 800
            })
            hasSetInitialBounds.current = true
          }
        }
      }
    }

    fetchRoute()
    
    // Cleanup zoom listener
    return () => {
      if (map.current) {
        map.current.off('zoom', handleZoomChange)
      }
    }
  }, [mapLoaded, startLocation, waypoints, mode, waypointPois, onPoiSelect, routeGeometrySource, routeGeometryJson, waypointDisplayMode])

  // Separate effect for handling zoom-based visibility of time badges
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const updateTimeBadgesVisibility = () => {
      const zoom = map.current?.getZoom() || 0
      console.log(`⏱️ Time badges visibility check | Zoom: ${zoom.toFixed(2)} | Visible: ${zoom >= 14}`)
      
      timeBadgeElementsRef.current.forEach(badge => {
        if (zoom >= 14) {
          badge.style.display = 'block'
        } else {
          badge.style.display = 'none'
        }
      })
    }

    // Add zoom listener
    map.current.on('zoom', updateTimeBadgesVisibility)
    
    // Initial check after a short delay to ensure badges are created
    const initialCheck = setTimeout(() => {
      updateTimeBadgesVisibility()
    }, 500)

    // Cleanup
    return () => {
      clearTimeout(initialCheck)
      map.current?.off('zoom', updateTimeBadgesVisibility)
    }
  }, [mapLoaded])

  // Add Mini-POI markers (only in fullscreen mode)
  useEffect(() => {
    if (!map.current || !mapLoaded || mode !== 'fullscreen' || !showMiniPois) return

    const miniPoiMarkersRef: mapboxgl.Marker[] = []

    // Filter Mini-POIs (POI type = "minor")
    const miniPois = allPois.filter(poi => 
      poi.poiTypes?.nodes?.some(type => type.slug === 'minor')
    )

    miniPois.forEach(poi => {
      const lat = poi.poiFields?.poiLatitude
      const lng = poi.poiFields?.poiLongitude
      
      if (!lat || !lng) return

      // Create smaller marker for Mini-POIs
      const el = document.createElement('div')
      el.className = 'mini-poi-marker'
      el.innerHTML = `
        <div class="relative">
          <div class="w-[30px] h-[30px] bg-gray-600/85 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer">
            <span class="text-white text-xs">${poi.poiFields?.poiIcon || '📍'}</span>
          </div>
        </div>
      `
      
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setLocalSelectedPoi(poi)
        onPoiSelect?.(poi)
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map.current!)
      
      miniPoiMarkersRef.push(marker)
    })

    // Cleanup function
    return () => {
      miniPoiMarkersRef.forEach(marker => marker.remove())
    }
  }, [mapLoaded, mode, showMiniPois, allPois, onPoiSelect])

  const handleClose = () => {
    setLocalSelectedPoi(null)
    onClose?.()
  }

  // Preview mode rendering
  if (mode === 'preview') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-[400px] cursor-pointer"
            onClick={onMapClick}
          />
          
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          
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

  // Fullscreen mode rendering
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
          {/* Map Container - 80vh when modal is open, 100vh when POI is selected */}
          <div className={`relative overflow-hidden ${localSelectedPoi ? 'h-[60vh]' : 'h-[80vh]'}`}>
            <div 
              ref={mapContainer} 
              className="w-full h-full absolute inset-0"
            />
          </div>

          {/* Bottom Sheet - Show metadata when no POI selected, POI details when selected */}
          {!localSelectedPoi ? (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl h-[20vh] overflow-y-auto z-10">
              {/* Metadata Bar */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {routeDuration && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">⏱️</span>
                      <span className="font-semibold">{routeDuration} min</span>
                    </div>
                  )}
                  {routeDistance && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">📏</span>
                      <span className="font-semibold">{routeDistance} km</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">📍</span>
                    <span className="font-semibold">{waypoints.length} stops</span>
                  </div>
                  {routeDifficulty && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">⚡</span>
                      <span className="font-semibold capitalize">{routeDifficulty}</span>
                    </div>
                  )}
                  {/* Mini-POI Toggle - Always show if we have map bounds */}
                  {mapBounds && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showMiniPois}
                        onChange={(e) => setShowMiniPois(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Vis detaljer {allPois.length > 0 && `(${allPois.length})`}
                      </span>
                    </label>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors"
                  aria-label="Close map"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Start Full Tour Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    // Build multi-waypoint URL for Google Maps
                    // Format: origin | waypoint1 | waypoint2 | ... | destination
                    const origin = `${startLocation.latitude},${startLocation.longitude}`
                    const destination = `${startLocation.latitude},${startLocation.longitude}` // Return to start
                    const waypointsList = waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypointsList}&travelmode=walking`
                    window.open(mapsUrl, '_blank')
                  }}
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🗺️</span>
                  <span>Start Full Tour in Google Maps</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl h-[40vh] overflow-y-auto z-10">
              {/* Header with title and close button */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {localSelectedPoi.poiFields.poiIcon && (
                      <span className="text-3xl">{localSelectedPoi.poiFields.poiIcon}</span>
                    )}
                    {localSelectedPoi.poiFields.poiCategory && (
                      <span className="text-xs font-medium text-[#76908D] bg-[#D1E5E6] px-3 py-1 rounded-full">
                        {localSelectedPoi.poiFields.poiCategory}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {localSelectedPoi.title}
                  </h3>
                </div>
                <button
                  onClick={() => setLocalSelectedPoi(null)}
                  className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-4"
                  aria-label="Close details"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">

                {localSelectedPoi.poiFields.poiDescription && (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {localSelectedPoi.poiFields.poiDescription}
                  </p>
                )}

                {localSelectedPoi.poiFields.poiImage?.node && (
                  <div className="mt-4 rounded-xl overflow-hidden">
                    <img
                      src={localSelectedPoi.poiFields.poiImage.node.sourceUrl}
                      alt={localSelectedPoi.poiFields.poiImage.node.altText || localSelectedPoi.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  📍 {localSelectedPoi.poiFields.poiLatitude.toFixed(6)}, {localSelectedPoi.poiFields.poiLongitude.toFixed(6)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
