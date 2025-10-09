'use client'

import { useQuery } from '@apollo/client'
import { GET_POSTS } from '@/queries/wordpress'
import { PostCard } from '@/components/PostCard'
import { WordPressPost } from '@/types/wordpress'

export default function PostsPage() {
  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { first: 12 }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Laster innlegg...</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-8">Feil ved lasting av innlegg</h1>
          <p className="text-gray-600 mb-8">
            Kan ikke koble til WordPress. Sjekk at GraphQL-endepunktet er korrekt konfigurert.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg mx-auto">
            <p className="text-red-700 text-sm">
              Feil: {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const posts = data?.posts?.nodes || []

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Alle innlegg
          </h1>
          <p className="text-xl text-gray-600">
            Utforsk våre siste artikler og nyheter
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: WordPressPost) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ingen innlegg funnet
            </h2>
            <p className="text-gray-600">
              Det ser ut til at det ikke er publisert noen innlegg ennå.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}