'use client'

import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { GET_STORY_BY_SLUG } from '@/queries/wordpress'
import { Story } from '@/types/wordpress'
import Hero from '@/components/story/Hero'
import TableOfContents from '@/components/story/TableOfContents'
import StorySection from '@/components/story/StorySection'

export default function StoryPage() {
  const params = useParams()
  const prosjektSlug = params?.prosjekt as string
  const storySlug = params?.story as string

  const { loading, error, data } = useQuery<{ story: Story }>(GET_STORY_BY_SLUG, {
    variables: { slug: storySlug },
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster story...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Feil ved lasting av story</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data?.story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story ikke funnet</h1>
          <p className="text-gray-600">Denne storyen eksisterer ikke.</p>
        </div>
      </div>
    )
  }

  const { story } = data
  const { storyFields } = story

  // TODO: Add prosjekt validation once we fix GraphQL query
  // For now, we skip validation to get the page working

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {storyFields.heroSection && (
        <Hero hero={storyFields.heroSection} />
      )}

      {/* Table of Contents */}
      {storyFields.storySections && storyFields.storySections.length > 0 && (
        <TableOfContents 
          sections={storyFields.storySections} 
          storySlug={story.slug} 
        />
      )}

      {/* Story Sections */}
      {storyFields.storySections && storyFields.storySections.length > 0 && (
        <div>
          {storyFields.storySections.map((section, index) => (
            <StorySection key={section.sectionId || index} section={section} />
          ))}
        </div>
      )}
    </main>
  )
}
