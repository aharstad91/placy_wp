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