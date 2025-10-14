import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

// Server-side Apollo Client for Next.js App Router
export function getClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT || 'http://localhost:8888/placy-wp-backend/graphql',
      fetchOptions: { cache: 'no-store' },
    }),
  })
}
