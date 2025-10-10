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
  poiFields: {
    poiDescription: string
    poiCategory?: string
    poiIcon?: string
    poiLatitude: number
    poiLongitude: number
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
  showMap: boolean
  relatedPois?: {
    nodes: POI[]
  }
}

export interface Prosjekt {
  id: string
  title: string // WordPress native title (not ACF)
  slug: string
}

export interface Story {
  id: string
  title: string
  slug: string
  date: string
  storyFields: {
    heroSection: StoryHero
    storySections?: StorySection[]
  }
}