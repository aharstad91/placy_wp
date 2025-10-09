# 📖 Story CPT - Implementeringsguide

## 🎯 Oversikt

Dette dokumentet forklarer hvordan du bruker det nye Story CPT (Custom Post Type) systemet basert på Overvik-prototypen.

## 🏗️ Arkitektur

### Custom Post Types
1. **Story** - Hovedinnholdstype for stories (eks: "Overvik Story")
2. **POI** (Point of Interest) - Gjenbrukbare steder/lokasjoner

### Story Struktur
```
Story
├── Title (WordPress standard)
├── Hero Section (ACF Group)
│   ├── Background Image
│   ├── Title
│   └── Description
└── Story Sections (ACF Flexible Content)
    └── Story Section (Layout - kan repeteres)
        ├── Section ID (for anchor links)
        ├── Icon (emoji)
        ├── Header Image
        ├── Title
        ├── Description
        ├── Map Type (select)
        ├── Show Map (true/false)
        └── Related POIs (Relationship til POI CPT)
```

### POI Struktur (Mapbox-ready)
```
POI
├── Title (WordPress standard)
└── POI Fields (ACF)
    ├── Description (textarea)
    ├── Latitude (number) - GPS breddegrad
    └── Longitude (number) - GPS lengdegrad
```

## 📝 Slik lager du en Story

### Steg 1: Opprett POIs først

1. Gå til **POI (Steder)** i WordPress admin
2. Klikk **Legg til POI**
3. Fyll inn:
   - **Tittel**: "Ranheim IL"
   - **Beskrivelse**: "Mest kjent for sin sterke satsning på fotball..."
   - **Latitude**: 63.4305
   - **Longitude**: 10.5511
4. Publiser

> 💡 **Tip**: Finn koordinater ved å høyreklikke i Google Maps og kopiere koordinatene

Eksempel POIs med koordinater:
- 📍 Ranheim IL (63.4305, 10.5511)
- 📍 Ranheim Sentrum (63.4326, 10.5493)
- 📍 NTNU Gløshaugen (63.4179, 10.4042)
- � Trondheim Torg (63.4305, 10.3951)

### Steg 2: Opprett en Story

1. Gå til **Stories** i WordPress admin
2. Klikk **Legg til story**
3. **Tittel**: "Overvik Story" (WordPress standard title - vises ikke i frontend)

#### Hero Section
4. Fyll inn **Hero Section**:
   - **Bakgrunnsbilde**: Last opp hero-bilde (helst 1920x1080px)
   - **Tittel**: "Velkommen over til Overvik"
   - **Beskrivelse**: "Velkommen til en helt ny bydel på Ranheim..."

#### Story Sections
5. Klikk **+ Legg til seksjon** under **Story Seksjoner**
6. Velg **Story Section** layout
7. Fyll inn første seksjon:
   - **Section ID**: "idrettsbydelen" (lowercase, ingen mellomrom)
   - **Ikon**: ⚽
   - **Header Bilde**: Last opp seksjonsbilde
   - **Tittel**: "Idrettsbydelen"
   - **Beskrivelse**: "Et rikt utvalg av trenings- og aktivitetstilbud..."
   - **Kart Type**: Velg "Idrett"
   - **Vis Kart**: Ja (aktivert)
   - **Relaterte POIs**: Velg POIs (Ranheim IL, Atletklubb, Svømmeklubb, NTNUI)

8. Klikk **+ Legg til seksjon** igjen for neste seksjon
9. Gjenta for alle seksjoner (Mikrolokasjon, Hverdagsliv, Kafé, etc.)

### Steg 3: Publiser og vis

1. Klikk **Publiser**
2. Story er nå tilgjengelig på: `http://localhost:3000/stories/overvik-story`

## 🎨 Frontend Komponenter

### Hero Component
- Fullskjerm bakgrunnsbilde
- Tittel og beskrivelse nederst
- Overlay for lesbarhet

### Table of Contents
- Auto-generert fra alle seksjoner
- 3-kolonne grid (1 kolonne på mobil)
- Smooth scroll til seksjoner

### Story Section
- Header-bilde med ikon
- Tittel og beskrivelse
- Kart-placeholder (kommer Mapbox API senere)
- POI-knapper (horisontalt scrollbare)
- POI-kort med detaljer

## 🔌 GraphQL Queries

### Hent alle Stories
```graphql
query GetStories {
  stories(first: 10) {
    nodes {
      id
      title
      slug
      date
    }
  }
}
```

### Hent Story med alle data
```graphql
query GetStoryBySlug($slug: ID!) {
  story(id: $slug, idType: SLUG) {
    id
    title
    slug
    storyFields {
      heroSection {
        backgroundImage {
          sourceUrl
          altText
        }
        title
        description
      }
      storySections {
        __typename
        ... on StoryFieldsStorySectionsStorySection {
          sectionId
          sectionIcon
          headerImage {
            sourceUrl
            altText
          }
          title
          description
          mapType
          showMap
          relatedPois {
            ... on Poi {
              id
              title
              poiFields {
                poiIcon
                poiDescription
                poiMetadata {
                  tag
                }
                comingSoon
              }
            }
          }
        }
      }
    }
  }
}
```

## 🚀 Neste Steg

### Må implementeres:
1. ⏳ **Mapbox API integration** - Erstatt kart-placeholder med ekte kart
2. ⏳ **POI modal** - Fullskjerm modal når man klikker på POI-knapp
3. ⏳ **Sticky navigation** - Bunn-nav som i prototypen
4. ⏳ **Bildegalleri** - Hvis seksjoner skal ha flere bilder

### Valgfritt:
- Featured images for POIs
- Video-support i seksjoner
- Animasjoner ved scroll
- Dark mode

## 📁 Filstruktur

```
placy-wp/
├── functions.php (Backend - CPT & ACF setup)
├── src/
│   ├── types/
│   │   └── wordpress.ts (TypeScript types)
│   ├── queries/
│   │   └── wordpress.ts (GraphQL queries)
│   ├── components/
│   │   └── story/
│   │       ├── Hero.tsx
│   │       ├── TableOfContents.tsx
│   │       └── StorySection.tsx
│   └── app/
│       └── stories/
│           └── [slug]/
│               └── page.tsx (Story template)
```

## 🎓 Beste Praksis

### POI Naming
- Bruk beskrivende titler: "Ranheim IL" (ikke bare "IL")
- Velg tydelige emojis/ikoner
- Hold beskrivelser korte (2-3 setninger)

### Section IDs
- Bruk lowercase og bindestrek: "idrettsbydelen" ✅
- Ikke mellomrom eller norske tegn: "Idretts-bydelen" ❌
- Skal matche anchor links i navigasjon

### Bilder
- Hero: 1920x1080px eller større
- Section Headers: 1920x640px (33vh ratio)
- Bruk WebP format for beste ytelse

### Rekkefølge
1. Lag POIs først
2. Deretter lag Story med seksjoner
3. Koble POIs til seksjoner via Relationship field

## ❓ Troubleshooting

### Story vises ikke i frontend
- Sjekk at Story er **Published** (ikke Draft)
- Verifiser at slug er riktig: `/stories/[slug]`
- Sjekk browser console for GraphQL errors

### POIs vises ikke
- Sjekk at POIs er **Published**
- Verifiser at Relationship field er koblet i seksjon
- Test GraphQL query i WPGraphiQL

### Bilder vises ikke
- Sjekk at bilder er lastet opp i Media Library
- Verifiser at GraphQL returnerer `sourceUrl`
- Sjekk at Next.js har tilgang til WordPress media folder

## 📞 Support

Ved spørsmål eller problemer:
1. Sjekk `functions.php` for ACF field setup
2. Test GraphQL queries i WPGraphiQL (`/graphql`)
3. Sjekk browser console for feilmeldinger
4. Verifiser at `npm run sync:backend` er kjørt

---

**🎉 Gratulerer! Du har nå et fullt funksjonelt Story system!**
