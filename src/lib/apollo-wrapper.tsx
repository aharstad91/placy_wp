'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT || 'http://localhost/wordpress/graphql',
  credentials: 'same-origin',
})

// Optimized cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        kunder: {
          keyArgs: false,
          merge(existing = { nodes: [] }, incoming) {
            return {
              ...incoming,
              nodes: [...existing.nodes, ...incoming.nodes]
            }
          }
        },
        prosjekter: {
          keyArgs: false,
          merge(existing = { nodes: [] }, incoming) {
            return {
              ...incoming,
              nodes: [...existing.nodes, ...incoming.nodes]
            }
          }
        },
        stories: {
          keyArgs: ['first', 'after'],
          merge(existing = { nodes: [] }, incoming) {
            return {
              ...incoming,
              nodes: [...existing.nodes, ...incoming.nodes]
            }
          }
        },
        pois: {
          keyArgs: false,
          merge(existing = { nodes: [] }, incoming) {
            return {
              ...incoming,
              nodes: [...existing.nodes, ...incoming.nodes]
            }
          }
        }
      }
    }
  }
})

const client = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

// Export getClient for server-side usage
export function getClient() {
  return client
}