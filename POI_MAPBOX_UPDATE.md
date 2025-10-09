# POI Mapbox Update - Oppdateringsoversikt

## 🗑️ Fjernede felter

Følgende POI-felter er fjernet:

1. **metadata** (repeater med tags) - Brukes ikke lenger
2. **poi_position_top** - Erstattet med latitude
3. **poi_position_left** - Erstattet med longitude
4. **coming_soon** (true/false) - Ikke lenger nødvendig
5. **poi_icon** (emoji) - Fjernet fra POI-felter

## ✅ Nye felter (Mapbox-klare)

POI har nå følgende felter:

1. **poi_description** (textarea) - Beskrivelse av stedet
2. **poi_latitude** (number) - Breddegrad (required)
3. **poi_longitude** (number) - Lengdegrad (required)

### Eksempel koordinater for Trondheim-området:

- **Ranheim IL**: Lat: `63.4305`, Lng: `10.5511`
- **Ranheim sentrum**: Lat: `63.4326`, Lng: `10.5493`
- **Trondheim sentrum**: Lat: `63.4305`, Lng: `10.3951`

## 📋 Oppdaterte filer

### Backend (functions.php)
- ✅ ACF fields oppdatert med latitude/longitude
- ✅ Fjernet metadata, position %, coming_soon, og icon felter

### Frontend TypeScript
- ✅ `/src/types/wordpress.ts` - POI interface oppdatert
- ✅ `/src/queries/wordpress.ts` - GraphQL POI_FIELDS fragment oppdatert
- ✅ `/src/components/story/StorySection.tsx` - Komponenten oppdatert

## 🗺️ Mapbox Integrasjon - Neste steg

### 1. Installer Mapbox pakker
```bash
npm install mapbox-gl @types/mapbox-gl
```

### 2. Lag Mapbox komponent
```tsx
// src/components/map/MapboxMap.tsx
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { POI } from '@/types/wordpress'

interface MapboxMapProps {
  pois: POI[]
  mapType?: string
}

export default function MapboxMap({ pois, mapType }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10.3951, 63.4305], // Trondheim center
      zoom: 12
    })

    // Add markers for each POI
    pois.forEach(poi => {
      if (poi.poiFields.poiLatitude && poi.poiFields.poiLongitude) {
        new mapboxgl.Marker()
          .setLngLat([poi.poiFields.poiLongitude, poi.poiFields.poiLatitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<h3>${poi.title}</h3><p>${poi.poiFields.poiDescription}</p>`
            )
          )
          .addTo(map.current!)
      }
    })

    // Cleanup
    return () => map.current?.remove()
  }, [pois])

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />
}
```

### 3. Bruk i StorySection
Erstatt placeholder med:
```tsx
<MapboxMap pois={section.relatedPois.nodes} mapType={section.mapType} />
```

### 4. Legg til .env.local
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📝 Slik legger du til POI i WordPress

1. Gå til **POI (Steder)** i WordPress admin
2. Klikk **Legg til POI**
3. Fyll inn:
   - **Tittel**: "Ranheim IL"
   - **Beskrivelse**: "Mest kjent for sin sterke satsning på fotball..."
   - **Latitude**: 63.4305
   - **Longitude**: 10.5511
4. Publiser

## 🔍 Finne koordinater

### Google Maps:
1. Høyreklikk på et sted i Google Maps
2. Klikk på koordinatene for å kopiere
3. Format: `63.4305, 10.5511` (latitude, longitude)

### Mapbox Geocoding API (anbefalt):
```bash
curl "https://api.mapbox.com/geocoding/v5/mapbox.places/Ranheim%20IL.json?access_token=YOUR_TOKEN"
```

## ✨ Fordeler med nye strukturen

1. **Mapbox-ready** - Koordinater er klare for kartvisning
2. **Enklere struktur** - Kun essensielle felter
3. **Fleksibel** - Lett å integrere med Mapbox GL JS
4. **Presis** - GPS-koordinater gir eksakt plassering
5. **Skalerbar** - Enkelt å legge til flere POIs

## 🚀 Testing

Test at POI-data kommer riktig fra GraphQL:
```graphql
query TestPOIs {
  pois(first: 10) {
    nodes {
      id
      title
      slug
      poiFields {
        poiDescription
        poiLatitude
        poiLongitude
      }
    }
  }
}
```

## 📚 Relaterte filer

- `functions.php` - ACF field definisjon
- `src/types/wordpress.ts` - TypeScript types
- `src/queries/wordpress.ts` - GraphQL queries
- `src/components/story/StorySection.tsx` - UI component
