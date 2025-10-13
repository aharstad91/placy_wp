'use client'

import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { GET_STORY_BY_SLUG, GET_THEME_STORY_BY_SLUG } from '@/queries/wordpress'
import { Story, ThemeStory } from '@/types/wordpress'
import Hero from '@/components/story/Hero'
import TableOfContents from '@/components/story/TableOfContents'
import StorySection from '@/components/story/StorySection'
import BottomNavbar from '@/components/BottomNavbar'

export default function StoryPage() {
  const params = useParams()
  const prosjektSlug = params?.prosjekt as string
  const storySlug = params?.story as string

  // Try to fetch as prosjekt-story first
  const { loading: storyLoading, error: storyError, data: storyData } = useQuery<{ story: Story }>(GET_STORY_BY_SLUG, {
    variables: { slug: storySlug },
  })

  // Try to fetch as theme-story if prosjekt-story not found
  const { loading: themeLoading, error: themeError, data: themeData } = useQuery<{ themeStory: ThemeStory }>(GET_THEME_STORY_BY_SLUG, {
    variables: { slug: storySlug },
    skip: storyData?.story != null, // Skip if we found a prosjekt-story
  })

  const loading = storyLoading || themeLoading
  const error = storyError || themeError

  // Determine which type of story we have
  const isProsjektStory = storyData?.story != null
  const isThemeStory = themeData?.themeStory != null
  const pageType = isThemeStory ? 'tema-story' : 'prosjekt-story'

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

  // If not found as either type, show 404
  if (!isProsjektStory && !isThemeStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story ikke funnet</h1>
          <p className="text-gray-600">Denne storyen eksisterer ikke.</p>
        </div>
      </div>
    )
  }

  // Extract story data based on type
  const story = isProsjektStory ? storyData!.story : themeData!.themeStory
  const storyFields = isProsjektStory 
    ? storyData!.story.storyFields 
    : themeData!.themeStory.themeStoryFields

  // Validate that theme-story belongs to the prosjekt in URL
  if (isThemeStory) {
    const relatedProsjekter = themeData!.themeStory.themeStoryFields.relatedProsjekt?.nodes || []
    const relatedProsjektSlug = relatedProsjekter.length > 0 ? relatedProsjekter[0].slug : null
    if (relatedProsjektSlug !== prosjektSlug) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ugyldig URL</h1>
            <p className="text-gray-600">Denne tema-storyen tilhører ikke dette prosjektet.</p>
          </div>
        </div>
      )
    }
  }

  // TODO: Fix GraphQL prosjekt query (ACF post_object connection issue)
  // For now, hardcode test coordinates for Overvik project
  const prosjektLocation = prosjektSlug === 'overvik' 
    ? {
        latitude: '63.4305',
        longitude: '10.3951',
        adresse: 'Lundveien 18 C, 0678 Oslo'
      }
    : undefined

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
            <StorySection 
              key={section.sectionId || index} 
              section={section}
              prosjektLocation={prosjektLocation}
            />
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavbar 
        sectionsCount={storyFields.storySections?.length || 0}
        sections={storyFields.storySections || []}
        pageType={pageType}
        prosjektSlug={prosjektSlug}
        onContactClick={() => {
          // TODO: Implement contact modal or link
          console.log('Contact clicked')
        }}
      />
    </main>
  )
}
