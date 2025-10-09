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

// POI Fragment
export const POI_FIELDS = gql`
  fragment POIFields on Poi {
    id
    title
    slug
    poiFields {
      poiIcon
      poiDescription
      poiMetadata {
        tag
      }
      poiPositionTop
      poiPositionLeft
      comingSoon
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