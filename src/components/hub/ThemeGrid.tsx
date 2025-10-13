'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeStory } from '@/types/wordpress'

interface ThemeGridProps {
  themeStories: ThemeStory[]
  prosjektSlug: string
}

export default function ThemeGrid({ themeStories, prosjektSlug }: ThemeGridProps) {
  if (!themeStories || themeStories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Ingen tema-stories funnet</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themeStories.map((themeStory) => (
          <Link
            key={themeStory.id}
            href={`/${prosjektSlug}/${themeStory.slug}`}
            className="group block"
          >
            {/* Theme Card */}
            <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:scale-[1.02] hover:bg-white/80">
              {/* Hero Image */}
              {themeStory.themeStoryFields.heroSection.backgroundImage ? (
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={themeStory.themeStoryFields.heroSection.backgroundImage.node.sourceUrl}
                    alt={themeStory.themeStoryFields.heroSection.backgroundImage.node.altText || themeStory.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              ) : (
                // Fallback gradient hvis ingen bilde
                <div className="w-full h-48 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600" />
              )}

              {/* Card Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                  {themeStory.themeStoryFields.heroSection.title || themeStory.title}
                </h3>

                {/* Description */}
                {themeStory.themeStoryFields.heroSection.description && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {themeStory.themeStoryFields.heroSection.description}
                  </p>
                )}

                {/* CTA */}
                <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:text-emerald-700 transition-colors">
                  <span>Utforsk tema</span>
                  <svg 
                    className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
