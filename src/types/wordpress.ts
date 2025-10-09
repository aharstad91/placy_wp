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