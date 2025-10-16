import { gql } from '@apollo/client'

export const GET_POSTS = gql`
  query GetPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        content
        excerpt
        slug
        date
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      excerpt
      slug
      date
      author {
        node {
          name
          avatar {
            url
          }
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
    }
  }
`

export const GET_PAGES = gql`
  query GetPages {
    pages(where: { status: PUBLISH }) {
      nodes {
        id
        title
        content
        slug
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
      content
      slug
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`

export const GET_MENU = gql`
  query GetMenu($location: MenuLocationEnum!) {
    menu(id: $location, idType: LOCATION) {
      id
      name
      menuItems {
        nodes {
          id
          label
          url
          parentId
        }
      }
    }
  }
`

export const GET_SITE_INFO = gql`
  query GetSiteInfo {
    generalSettings {
      title
      description
      url
    }
  }
`

// POI Fragment - Mapbox-ready
export const POI_FIELDS = gql`
  fragment POIFields on Poi {
    id
    title
    slug
    poiTypes {
      nodes {
        name
        slug
      }
    }
    poiCategories {
      nodes {
        id
        name
        slug
        categoryFields {
          categoryIcon
        }
      }
    }
    poiFields {
      poiDescription
      poiImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      poiCategory
      poiIcon
      poiLatitude
      poiLongitude
      poiDisplayLocation
      poiDisplaySubtitle
    }
  }
`

// Get all POIs
export const GET_POIS = gql`
  ${POI_FIELDS}
  query GetPOIs($first: Int = 100) {
    pois(first: $first) {
      nodes {
        ...POIFields
      }
    }
  }
`

// Get single POI by slug
export const GET_POI_BY_SLUG = gql`
  ${POI_FIELDS}
  query GetPOIBySlug($slug: ID!) {
    poi(id: $slug, idType: SLUG) {
      ...POIFields
    }
  }
`

// Get all Stories
export const GET_STORIES = gql`
  query GetStories($first: Int = 10) {
    stories(first: $first, where: { status: PUBLISH }) {
      nodes {
        id
        title
        slug
        date
        storyFields {
          prosjekt {
            ... on Prosjekt {
              id
              title
              slug
            }
          }
        }
      }
    }
  }
`

// Get single Story by slug with full data
export const GET_STORY_BY_SLUG = gql`
  ${POI_FIELDS}
  query GetStoryBySlug($slug: ID!) {
    story(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      storyFields {
        heroSection {
          backgroundImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          title
          description
        }
        storySections {
          __typename
          ... on StoryFieldsStorySectionsStorySectionLayout {
            sectionId
            sectionIcon
            headerImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
            title
            description
            mapType
            poiDisplayMode
            showMap
            relatedPois {
              nodes {
                ... on Poi {
                  ...POIFields
                }
              }
            }
          }
        }
      }
    }
  }
`

// Get Prosjekt by slug with location data
export const GET_PROSJEKT_BY_SLUG = gql`
  query GetProsjektBySlug($slug: ID!) {
    prosjekt(id: $slug, idType: SLUG) {
      id
      title
      slug
      prosjektFields {
        beskrivelse
        status
        hasLandingHub
        prosjektLatitude
        prosjektLongitude
        prosjektAdresse
      }
    }
  }
`

// Get Theme Story by slug with full data
export const GET_THEME_STORY_BY_SLUG = gql`
  ${POI_FIELDS}
  query GetThemeStoryBySlug($slug: ID!) {
    themeStory(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      themeStoryFields {
        relatedProsjekt {
          nodes {
            ... on Prosjekt {
              id
              title
              slug
            }
          }
        }
        heroSection {
          backgroundImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          title
          description
        }
        storySections {
          __typename
          ... on ThemeStoryFieldsStorySectionsStorySectionLayout {
            sectionId
            sectionIcon
            headerImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
            title
            description
            mapType
            poiDisplayMode
            showMap
            relatedPois {
              nodes {
                ... on Poi {
                  ...POIFields
                }
              }
            }
          }
        }
      }
    }
  }
`

// Get all Theme Stories for a specific prosjekt (for Landing Hub)
// Note: We fetch all theme stories and filter client-side since WPGraphQL doesn't support metaQuery
export const GET_THEME_STORIES_BY_PROJECT = gql`
  query GetThemeStoriesByProject($first: Int = 50) {
    themeStories(
      first: $first
      where: { 
        status: PUBLISH
      }
    ) {
      nodes {
        id
        title
        slug
        date
        themeStoryFields {
          relatedProsjekt {
            nodes {
              ... on Prosjekt {
                id
                title
                slug
              }
            }
          }
          heroSection {
            backgroundImage {
              node {
                sourceUrl
                altText
              }
            }
            title
            description
          }
        }
      }
    }
  }
`

// Get Route Story by slug
export const GET_ROUTE_STORY_BY_SLUG = gql`
  query GetRouteStoryBySlug($slug: ID!) {
    routeStory(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      routeStoryFields {
        relatedProsjekt {
          nodes {
            ... on Prosjekt {
              id
              title
              slug
            }
          }
        }
        routeDuration
        routeDistance
        routeDifficulty
        routeType
        routeGeometrySource
        routeGeometryJson
        mapBoundsNorth
        mapBoundsSouth
        mapBoundsEast
        mapBoundsWest
        mapMinZoom
        mapMaxZoom
        waypointDisplayMode
        startLocation {
          name
          latitude
          longitude
          image {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          includeApproachInRoute
          showReturnRoute
        }
        heroSection {
          title
          subtitle
          heroImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          videoEmbedUrl
        }
        routeWaypoints {
          waypointOrder
          relatedPoi {
            nodes {
              ... on Poi {
                id
                title
                slug
                poiCategories {
                  nodes {
                    id
                    name
                    slug
                    categoryFields {
                      categoryIcon
                    }
                  }
                }
                poiFields {
                  poiDescription
                  poiImage {
                    node {
                      sourceUrl
                      altText
                      mediaDetails {
                        width
                        height
                      }
                    }
                  }
                  poiLatitude
                  poiLongitude
                  poiCategory
                  poiIcon
                }
              }
            }
          }
          description
          estimatedTime
          waypointLatitude
          waypointLongitude
        }
        practicalInfo {
          bestSeason
          accessibilityNotes
          priceInfo
        }
      }
    }
  }
`

// Get all Route Stories for a specific prosjekt (for Landing Hub)
// Note: We fetch all route stories and filter client-side since WPGraphQL doesn't support metaQuery
export const GET_ROUTE_STORIES_BY_PROJECT = gql`
  query GetRouteStoriesByProject($first: Int = 50) {
    routeStories(
      first: $first
      where: { 
        status: PUBLISH
      }
    ) {
      nodes {
        id
        title
        slug
        date
        routeStoryFields {
          relatedProsjekt {
            nodes {
              ... on Prosjekt {
                id
                title
                slug
              }
            }
          }
          routeDuration
          routeDistance
          routeDifficulty
          routeType
          routeGeometrySource
          routeGeometryJson
          mapBoundsNorth
          mapBoundsSouth
          mapBoundsEast
          mapBoundsWest
          mapMinZoom
          mapMaxZoom
          waypointDisplayMode
          heroSection {
            title
            subtitle
            heroImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    }
  }
`