export interface WordPressPost {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  date: string
  author: {
    name: string
    avatar: string
  }
  featuredImage?: {
    sourceUrl: string
    altText: string
  }
  categories: {
    nodes: Array<{
      name: string
      slug: string
    }>
  }
}

export interface WordPressPage {
  id: string
  title: string
  content: string
  slug: string
  date: string
  featuredImage?: {
    sourceUrl: string
    altText: string
  }
}

export interface WordPressMenu {
  id: string
  name: string
  menuItems: {
    nodes: Array<{
      id: string
      label: string
      url: string
      parentId?: string
    }>
  }
}

export interface WordPressSiteInfo {
  title: string
  description: string
  url: string
}

// POI (Point of Interest) Types - Mapbox-ready
export interface POI {
  id: string
  title: string
  slug: string
  poiTypes?: {
    nodes: Array<{
      name: string
      slug: string
    }>
  }
  poiFields: {
    poiDescription: string
    poiImage?: {
      node: {
        sourceUrl: string
        altText: string
        mediaDetails?: {
          width: number
          height: number
        }
      }
    }
    poiCategory?: string
    poiIcon?: string
    poiLatitude: number
    poiLongitude: number
    poiDisplayLocation?: string
    poiDisplaySubtitle?: string
  }
}

// Story Types
export interface StoryHero {
  backgroundImage?: {
    node: {
      sourceUrl: string
      altText: string
      mediaDetails?: {
        width: number
        height: number
      }
    }
  }
  title: string
  description: string
}

export interface StorySection {
  __typename: 'StoryFieldsStorySectionsStorySectionLayout'
  sectionId: string
  sectionIcon: string
  headerImage?: {
    node: {
      sourceUrl: string
      altText: string
      mediaDetails?: {
        width: number
        height: number
      }
    }
  }
  title: string
  description: string
  mapType: 'none' | 'idrett' | 'mikrolokasjon' | 'hverdagsliv' | 'kafe' | 'natur' | 'transport' | 'oppvekst'
  poiDisplayMode?: 'collection_map' | 'individual_cards'
  showMap: boolean
  relatedPois?: {
    nodes: POI[]
  }
}

export interface Prosjekt {
  id: string
  title: string // WordPress native title (not ACF)
  slug: string
  prosjektFields?: {
    beskrivelse?: string
    status?: string
    techStack?: string[]
    projectUrl?: string
    githubUrl?: string
    // Location for Mapbox Directions API
    prosjektLatitude?: string
    prosjektLongitude?: string
    prosjektAdresse?: string
    // Landing Hub support
    hasLandingHub?: boolean
  }
}

export interface Story {
  id: string
  title: string
  slug: string
  date: string
  storyFields: {
    heroSection: StoryHero
    storySections?: StorySection[]
    prosjekt?: {
      node: {
        id: string
        title: string
        slug: string
      }
    }
  }
}

// Theme Story Types (Destinasjonsmarkedsføring)
export interface ThemeStoryFields {
  heroSection: StoryHero
  storySections?: StorySection[]
  relatedProsjekt?: {
    nodes: Array<{
      id: string
      title: string
      slug: string
    }>
  }
}

export interface ThemeStory {
  id: string
  title: string
  slug: string
  date: string
  themeStoryFields: ThemeStoryFields
}

// Route Story Types (Guided tours with waypoints)
export interface RouteWaypoint {
  waypointOrder: number
  relatedPoi: {
    nodes: POI[]
  }
  description?: string
  estimatedTime?: number
  // Coordinates (for waypoints without POI)
  waypointLatitude?: number
  waypointLongitude?: number
}

export interface RouteStoryFields {
  relatedProsjekt?: {
    nodes: Array<{
      id: string
      title: string
      slug: string
    }>
  }
  routeDuration: number // minutes
  routeDistance: number // km
  routeDifficulty: 'easy' | 'moderate' | 'challenging'
  routeType: 'walking' | 'cycling' | 'driving'
  routeGeometrySource: 'mapbox_directions' | 'custom_drawn'
  routeGeometryJson?: string // GeoJSON LineString for custom drawn routes
  mapBoundsNorth?: number // Auto-calculated from route geometry
  mapBoundsSouth?: number
  mapBoundsEast?: number
  mapBoundsWest?: number
  mapMinZoom?: number // Default 11
  mapMaxZoom?: number // Default 18
  hideWaypointNumbers?: boolean // Toggle waypoint number visibility
  startLocation: {
    name: string
    latitude: number
    longitude: number
    image?: {
      node: {
        sourceUrl: string
        altText: string
        mediaDetails?: {
          width: number
          height: number
        }
      }
    }
    includeApproachInRoute?: boolean
    showReturnRoute?: boolean
  }
  heroSection: {
    title: string
    subtitle?: string
    heroImage?: {
      node: {
        sourceUrl: string
        altText: string
        mediaDetails?: {
          width: number
          height: number
        }
      }
    }
    videoEmbedUrl?: string
  }
  routeWaypoints: RouteWaypoint[]
  practicalInfo?: {
    bestSeason?: string
    accessibilityNotes?: string
    priceInfo?: string
  }
}

export interface RouteStory {
  id: string
  title: string
  slug: string
  date: string
  routeStoryFields: RouteStoryFields
}