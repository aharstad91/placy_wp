'use client'

import { POI } from '@/types/wordpress'

interface POICardProps {
  poi: POI
  onCardClick: (poiId: string) => void
}

export default function POICard({ poi, onCardClick }: POICardProps) {
  const { title, poiFields } = poi
  const { poiDescription, poiCategory, poiIcon } = poiFields

  return (
    <div
      onClick={() => onCardClick(poi.id)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[#76908D] hover:-translate-y-1 flex flex-col"
      style={{ maxHeight: '25vh', minHeight: '180px' }}
    >
      {/* Image Placeholder */}
      <div className="relative w-full h-24 bg-gray-100 flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg 
            className="w-12 h-12" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {/* Header with icon and category */}
        <div className="flex items-center gap-2 mb-2">
          {poiIcon && (
            <span className="text-xl flex-shrink-0">{poiIcon}</span>
          )}
          {poiCategory && (
            <span className="text-xs font-medium text-[#76908D] bg-[#D1E5E6] px-2 py-1 rounded-full">
              {poiCategory}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2">
          {title}
        </h3>

        {/* Description - truncated */}
        {poiDescription && (
          <p className="text-sm text-gray-600 line-clamp-2 flex-1">
            {poiDescription}
          </p>
        )}
      </div>
    </div>
  )
}
