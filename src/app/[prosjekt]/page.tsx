import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/apollo-client'
import { GET_PROSJEKT_BY_SLUG, GET_THEME_STORIES_BY_PROJECT, GET_ROUTE_STORIES_BY_PROJECT } from '@/queries/wordpress'
import { Prosjekt, ThemeStory, RouteStory } from '@/types/wordpress'
import ThemeGrid from '@/components/hub/ThemeGrid'
import Link from 'next/link'

interface ProsjektPageProps {
  params: {
    prosjekt: string
  }
}

export default async function ProsjektPage({ params }: ProsjektPageProps) {
  const client = getClient()

  // Fetch prosjekt data
  const { data: prosjektData } = await client.query({
    query: GET_PROSJEKT_BY_SLUG,
    variables: { slug: params.prosjekt },
  })

  const prosjekt: Prosjekt | null = prosjektData?.prosjekt

  if (!prosjekt) {
    notFound()
  }

  // Check if this prosjekt should show landing hub
  const hasLandingHub = prosjekt.prosjektFields?.hasLandingHub

  if (!hasLandingHub) {
    // If not a landing hub, show 404 or redirect to first story
    notFound()
  }

  // Fetch all theme stories and filter client-side
  const { data: themeStoriesData } = await client.query({
    query: GET_THEME_STORIES_BY_PROJECT,
    variables: { 
      first: 50 
    },
  })

  const allThemeStories: ThemeStory[] = themeStoriesData?.themeStories?.nodes || []
  
  // Filter theme stories that belong to this prosjekt
  const themeStories = allThemeStories.filter(story => {
    const relatedProsjekter = story.themeStoryFields.relatedProsjekt?.nodes || []
    return relatedProsjekter.some(p => p.slug === params.prosjekt)
  })

  // Fetch all route stories and filter client-side
  const { data: routeStoriesData } = await client.query({
    query: GET_ROUTE_STORIES_BY_PROJECT,
    variables: { 
      first: 50 
    },
  })

  const allRouteStories: RouteStory[] = routeStoriesData?.routeStories?.nodes || []
  
  // Filter route stories that belong to this prosjekt
  const routeStories = allRouteStories.filter(story => {
    const relatedProsjekter = story.routeStoryFields.relatedProsjekt?.nodes || []
    return relatedProsjekter.some(p => p.slug === params.prosjekt)
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          {/* Project Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {prosjekt.title}
          </h1>

          {/* Description */}
          {prosjekt.prosjektFields?.beskrivelse && (
            <div 
              className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: prosjekt.prosjektFields.beskrivelse }}
            />
          )}

          {/* Divider */}
          <div className="mt-12 mb-8">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto rounded-full" />
          </div>
        </div>
      </section>

      {/* Theme Stories Section */}
      {themeStories.length > 0 && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-5">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Utforsk tema
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Velg et tema for å oppdage alt området har å tilby
              </p>
            </div>

            {/* Theme Grid */}
            <ThemeGrid themeStories={themeStories} prosjektSlug={params.prosjekt} />
          </div>
        </section>
      )}

      {/* Route Stories Section */}
      {routeStories.length > 0 && (
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-5">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🧭 Guided Tours
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore the area with our curated walking and cycling routes
              </p>
            </div>

            {/* Route Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routeStories.map((route) => (
                <Link
                  key={route.id}
                  href={`/${params.prosjekt}/routes/${route.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Route Image */}
                  {route.routeStoryFields.heroSection.heroImage && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={route.routeStoryFields.heroSection.heroImage.node.sourceUrl}
                        alt={route.routeStoryFields.heroSection.heroImage.node.altText || route.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Difficulty Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          route.routeStoryFields.routeDifficulty === 'easy' ? 'bg-green-500 text-white' :
                          route.routeStoryFields.routeDifficulty === 'moderate' ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {route.routeStoryFields.routeDifficulty === 'easy' ? 'Easy' :
                           route.routeStoryFields.routeDifficulty === 'moderate' ? 'Moderate' :
                           'Challenging'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Route Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {route.routeStoryFields.heroSection.title}
                    </h3>
                    
                    {route.routeStoryFields.heroSection.subtitle && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {route.routeStoryFields.heroSection.subtitle}
                      </p>
                    )}

                    {/* Route Metadata */}
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span>⏱️</span>
                        <span>{route.routeStoryFields.routeDuration} min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span>📍</span>
                        <span>{route.routeStoryFields.routeDistance} km</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span>
                          {route.routeStoryFields.routeType === 'walking' ? '🚶' :
                           route.routeStoryFields.routeType === 'cycling' ? '🚴' : '🚗'}
                        </span>
                        <span className="capitalize">{route.routeStoryFields.routeType}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export async function generateMetadata({ params }: ProsjektPageProps): Promise<Metadata> {
  const client = getClient()

  const { data } = await client.query({
    query: GET_PROSJEKT_BY_SLUG,
    variables: { slug: params.prosjekt },
  })

  const prosjekt: Prosjekt | null = data?.prosjekt

  if (!prosjekt) {
    return {
      title: 'Prosjekt ikke funnet',
    }
  }

  return {
    title: prosjekt.title,
    description: prosjekt.prosjektFields?.beskrivelse?.replace(/<[^>]*>/g, '').substring(0, 160) || undefined,
  }
}
