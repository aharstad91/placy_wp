'use client'

import { POI } from '@/types/wordpress'
import POICard from './POICard'

interface POICardsGridProps {
  pois: POI[]
  onCardClick: (poiId: string) => void
}

export default function POICardsGrid({ pois, onCardClick }: POICardsGridProps) {
  if (!pois || pois.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      {pois.map((poi) => (
        <POICard 
          key={poi.id} 
          poi={poi} 
          onCardClick={onCardClick} 
        />
      ))}
    </div>
  )
}
