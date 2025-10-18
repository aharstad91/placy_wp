import { notFound } from 'next/navigation'
import { getClient } from '@/lib/apollo-client'
import { GET_ROUTE_STORY_BY_SLUG } from '@/queries/wordpress'
import { RouteStory } from '@/types/wordpress'
import BottomNavbar from '@/components/BottomNavbar'
import RouteHero from '@/components/route/RouteHero'
import RouteContentWrapper from '@/components/route/RouteContentWrapper'

interface RouteStoryPageProps {
  params: {
    prosjekt: string
    route: string
  }
}

export default async function RouteStoryPage({ params }: RouteStoryPageProps) {
  const prosjektSlug = params.prosjekt
  const routeSlug = params.route

  const client = getClient()
  
  const { data, error } = await client.query<{ routeStory: RouteStory }>({
    query: GET_ROUTE_STORY_BY_SLUG,
    variables: { slug: routeSlug },
  })

  if (error) {
    console.error('GraphQL Error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading route</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <details className="text-left max-w-2xl mx-auto bg-white p-4 rounded">
            <summary className="cursor-pointer font-semibold">Debug Info</summary>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </details>
        </div>
      </div>
    )
  }

  const routeStory = data?.routeStory

  if (!routeStory) {
    notFound()
  }
  const fields = routeStory.routeStoryFields

  // Validate that route belongs to the prosjekt in URL
  const relatedProsjekter = fields.relatedProsjekt?.nodes || []
  const relatedProsjektSlug = relatedProsjekter.length > 0 ? relatedProsjekter[0].slug : null
  if (relatedProsjektSlug !== prosjektSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid URL</h1>
          <p className="text-gray-600">This route does not belong to this project.</p>
        </div>
      </div>
    )
  }

  // Prepare waypoints for Hero and components
  // ⚠️ CRITICAL: ALL waypoints must be preserved, with or without POI
  const waypointsData = fields.routeWaypoints.map(wp => {
    if (wp.relatedPoi.nodes.length > 0) {
      // Waypoint has POI - use POI data
      const poi = wp.relatedPoi.nodes[0]
      return {
        latitude: poi.poiFields?.poiLatitude || 0,
        longitude: poi.poiFields?.poiLongitude || 0,
        name: poi.title
      }
    } else {
      // Waypoint without POI - use waypoint's own coordinates
      return {
        latitude: wp.waypointLatitude || 0,
        longitude: wp.waypointLongitude || 0,
        name: `Waypoint ${wp.waypointOrder}`
      }
    }
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <RouteHero
        title={fields.heroSection.title}
        subtitle={fields.heroSection.subtitle}
        heroImage={fields.heroSection.heroImage}
        videoEmbedUrl={fields.heroSection.videoEmbedUrl}
        duration={fields.routeDuration}
        distance={fields.routeDistance}
        difficulty={fields.routeDifficulty}
        routeType={fields.routeType}
        waypointCount={fields.routeWaypoints.length}
        startLatitude={fields.startLocation.latitude}
        startLongitude={fields.startLocation.longitude}
        startName={fields.startLocation.name}
        waypoints={waypointsData}
      />

      {/* Route Content with Interactive Map */}
      <RouteContentWrapper
        startLocation={{
          ...fields.startLocation,
          image: fields.startLocation.image?.node?.sourceUrl
        }}
        waypoints={fields.routeWaypoints}
        routeDuration={fields.routeDuration}
        routeDistance={fields.routeDistance}
        routeDifficulty={fields.routeDifficulty}
        routeGeometrySource={fields.routeGeometrySource}
        routeGeometryJson={fields.routeGeometryJson}
        mapBounds={
          fields.mapBoundsNorth && fields.mapBoundsSouth && fields.mapBoundsEast && fields.mapBoundsWest
            ? {
                north: fields.mapBoundsNorth,
                south: fields.mapBoundsSouth,
                east: fields.mapBoundsEast,
                west: fields.mapBoundsWest
              }
            : undefined
        }
        waypointDisplayMode={fields.waypointDisplayMode}
      />

      {/* Practical Info */}
      {fields.practicalInfo && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ℹ️ Practical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.practicalInfo.bestSeason && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Best Season</p>
                  <p className="text-gray-900">{fields.practicalInfo.bestSeason}</p>
                </div>
              )}
              {fields.practicalInfo.accessibilityNotes && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Accessibility</p>
                  <p className="text-gray-900">{fields.practicalInfo.accessibilityNotes}</p>
                </div>
              )}
              {fields.practicalInfo.priceInfo && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Price</p>
                  <p className="text-gray-900">{fields.practicalInfo.priceInfo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pb-32">
        <BottomNavbar 
          sectionsCount={0}
          sections={[]}
          pageType="route-story"
          prosjektSlug={prosjektSlug}
        />
      </div>
    </main>
  )
}
