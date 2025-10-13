import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/apollo-wrapper'
import { GET_PROSJEKT_BY_SLUG, GET_THEME_STORIES_BY_PROJECT } from '@/queries/wordpress'
import { Prosjekt, ThemeStory } from '@/types/wordpress'
import ThemeGrid from '@/components/hub/ThemeGrid'

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

  // Fetch all theme stories for this prosjekt
  const { data: themeStoriesData } = await client.query({
    query: GET_THEME_STORIES_BY_PROJECT,
    variables: { 
      prosjektSlug: params.prosjekt,
      first: 50 
    },
  })

  const themeStories: ThemeStory[] = themeStoriesData?.themeStories?.nodes || []

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
      <section className="pb-20">
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
