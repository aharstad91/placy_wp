'use client'

import Image from 'next/image'
import { useState, useCallback, useMemo } from 'react'
import { StorySection as StorySectionType, POI } from '@/types/wordpress'
import MapboxMap from '@/components/MapboxMap'
import POICardsGrid from './POICardsGrid'

interface StorySectionProps {
  section: StorySectionType
  prosjektLocation?: {
    latitude: string
    longitude: string
    adresse?: string
  }
}

export default function StorySection({ section, prosjektLocation }: StorySectionProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [showRoute, setShowRoute] = useState(false)
  const [sheetState, setSheetState] = useState<'full' | 'collapsed'>('full')
  const [routeData, setRouteData] = useState<{ distance: number; duration: number } | null>(null)

  // Memoize the route loaded callback to prevent infinite loops
  const handleRouteLoaded = useCallback((data: { distance: number; duration: number }) => {
    setRouteData(data)
    setSheetState('collapsed')
  }, [])

  // Memoize routeFrom coordinates to prevent infinite loop
  const routeFrom = useMemo(() => {
    if (prosjektLocation?.latitude && prosjektLocation?.longitude) {
      return [parseFloat(prosjektLocation.longitude), parseFloat(prosjektLocation.latitude)] as [number, number]
    }
    return undefined
  }, [prosjektLocation?.latitude, prosjektLocation?.longitude])

  return (
    <section id={section.sectionId} className="section px-6 py-6 mb-16">
      {/* Section Header Image */}
      {section.headerImage?.node && (
        <div className="relative bg-gray-200 rounded-lg mb-6 overflow-hidden" style={{ height: 'calc(var(--viewport-height, 100vh) * 0.33)' }}>
          <Image
            src={section.headerImage.node.sourceUrl}
            alt={section.headerImage.node.altText || section.title}
            fill
            className="object-cover"
          />
          {/* Icon overlay */}
          <div className="absolute top-4 left-4 w-8 h-8 text-[#78908E] bg-white rounded-full p-2 shadow-md flex items-center justify-center">
            <span className="text-base">{section.sectionIcon}</span>
          </div>
        </div>
      )}
      
      {/* Section Header */}
      <header className="section-header">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 w-full text-left">{section.title}</h1>
        </div>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          {section.description}
        </p>
      </header>

      {/* POI Section - Conditional Rendering based on Display Mode */}
      {section.relatedPois?.nodes && section.relatedPois.nodes.length > 0 && (
        <>
          {/* Individual POI Cards Mode */}
          {section.poiDisplayMode === 'individual_cards' && (
            <POICardsGrid 
              pois={section.relatedPois.nodes}
              onCardClick={(poiId) => {
                const poi = section.relatedPois?.nodes.find(p => p.id === poiId)
                if (poi) {
                  setIsMapOpen(true)
                  setTimeout(() => setSelectedPoi(poi), 600)
                }
              }}
            />
          )}

          {/* Collection Map Mode (default/existing behavior) */}
          {(!section.poiDisplayMode || section.poiDisplayMode === 'collection_map') && section.showMap && (
            <div className="section-content">
              {/* Map Placeholder/Trigger */}
              <div 
                className="bg-gray-200 rounded-lg relative mb-6 transition-all hover:bg-gray-300 cursor-pointer bg-cover bg-center border border-gray-300" 
                style={{ height: 'calc(var(--viewport-height, 100vh) * 0.4)' }}
                onClick={() => setIsMapOpen(true)}
              >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-gray-600 text-2xl font-medium mb-2">
                {section.mapType === 'idrett' ? 'Idrett & Trening' : 'Kart'}
              </div>
              <div className="text-gray-500 text-lg">Klikk for å aktivere kart</div>
              {section.mapType && section.mapType !== 'none' && (
                <div className="mt-2 px-4 py-2 bg-white rounded-full text-sm text-gray-600 shadow">
                  {section.mapType}
                </div>
              )}
            </div>

            {/* POI Tags/Buttons - Inside Map Container */}
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="poi-tags-container overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-3">
                  {section.relatedPois.nodes.map((poi) => (
                    <button
                      key={poi.id}
                      className="poi-tag flex-shrink-0"
                      title={poi.title}
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering parent click
                        setIsMapOpen(true)
                        // Set selected POI after map is loaded and initialized
                        setTimeout(() => setSelectedPoi(poi), 600)
                      }}
                    >
                      {poi.poiFields.poiIcon && (
                        <span className="mr-2">{poi.poiFields.poiIcon}</span>
                      )}
                      <span className="poi-tag-text font-medium">{poi.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
            </div>
          )}

          {/* Fullscreen Map Modal - Shared by both display modes */}
          {isMapOpen && section.relatedPois?.nodes && (
            <div 
              className="fixed inset-0 z-50 bg-white"
              style={{ height: '100vh', width: '100vw' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsMapOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Lukk kart"
              >
                <svg 
                  className="w-6 h-6 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>

              {/* Mapbox Map */}
              <MapboxMap 
                pois={section.relatedPois.nodes}
                className="w-full h-full"
                onPoiClick={(poi) => setSelectedPoi(poi)}
                selectedPoi={selectedPoi}
                showRoute={showRoute}
                routeFrom={routeFrom}
                routeProfile="walking"
                onRouteLoaded={handleRouteLoaded}
              />

              {/* POI Detail Bottom Sheet */}
              {selectedPoi && (
                <>
                  {/* Backdrop - Only show when full height */}
                  {sheetState === 'full' && (
                    <div 
                      className="absolute inset-0 bg-black/20 z-15 animate-in fade-in duration-300"
                      onClick={() => {
                        setSelectedPoi(null)
                        setShowRoute(false)
                        setRouteData(null)
                        setSheetState('full')
                      }}
                    />
                  )}
                  
                  {/* Bottom Sheet Drawer */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 z-20 bg-white shadow-2xl transition-all duration-300"
                    style={{ 
                      height: sheetState === 'collapsed' ? 'auto' : '60vh',
                      maxHeight: sheetState === 'collapsed' ? '180px' : '60vh',
                      borderRadius: '16px 16px 0 0',
                      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                  {/* Sheet Header - Compact mode when route is shown */}
                  {sheetState === 'collapsed' && routeData ? (
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSheetState('full')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {selectedPoi.poiFields.poiIcon && (
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                              {selectedPoi.poiFields.poiIcon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {selectedPoi.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
                              <span>🚶</span>
                              <span className="font-medium">{(routeData.distance / 1000).toFixed(1)} km</span>
                              <span>·</span>
                              <span>{Math.round(routeData.duration / 60)} min</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowRoute(false)
                              setRouteData(null)
                              // Keep sheet open, just go back to full mode
                              setSheetState('full')
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            Tilbake
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPoi(null)
                              setShowRoute(false)
                              setRouteData(null)
                              setSheetState('full')
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Lukk"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>Trykk for detaljer</span>
                      </div>
                    </div>
                  ) : (
                    /* Full height header */
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        {selectedPoi.poiFields.poiIcon && (
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                            {selectedPoi.poiFields.poiIcon}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedPoi.title}
                          </h3>
                          {selectedPoi.poiFields.poiCategory && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              {selectedPoi.poiFields.poiCategory}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedPoi(null)
                          setShowRoute(false)
                          setRouteData(null)
                          setSheetState('full')
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                        aria-label="Lukk"
                      >
                        <svg 
                          className="w-4 h-4 text-gray-600" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Sheet Content */}
                  <div className="overflow-y-auto" style={{ height: 'calc(60vh - 73px)' }}>
                    <div className="p-5">
                      {selectedPoi.poiFields.poiDescription && (
                        <div className="mb-6">
                          <p className="text-gray-700 leading-relaxed text-base">
                            {selectedPoi.poiFields.poiDescription}
                          </p>
                        </div>
                      )}

                      {/* Coordinates */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Koordinater</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Latitude:</span>
                            <span className="font-mono text-gray-900">
                              {selectedPoi.poiFields.poiLatitude}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Longitude:</span>
                            <span className="font-mono text-gray-900">
                              {selectedPoi.poiFields.poiLongitude}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {/* Show route button - only if prosjekt location exists */}
                        {prosjektLocation?.latitude && prosjektLocation?.longitude && (
                          <button
                            onClick={() => setShowRoute(!showRoute)}
                            className={`w-full px-4 py-3 ${
                              showRoute 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-blue-500 hover:bg-blue-600'
                            } text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2`}
                          >
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                              />
                            </svg>
                            {showRoute ? 'Skjul rute' : 'Vis rute fra prosjekt'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            const lat = selectedPoi.poiFields.poiLatitude
                            const lng = selectedPoi.poiFields.poiLongitude
                            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
                          }}
                          className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                          </svg>
                          Åpne i Google Maps
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .poi-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          min-height: 64px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .poi-tag:hover {
          background: white;
          border-color: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
