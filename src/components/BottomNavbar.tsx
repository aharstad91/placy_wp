'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StorySection } from '@/types/wordpress'

interface BottomNavbarProps {
  sectionsCount?: number
  sections?: StorySection[]
  pageType?: 'landing-hub' | 'tema-story' | 'prosjekt-story' | 'route-story'
  prosjektSlug?: string
  onFindThemeClick?: () => void
  onContactClick?: () => void
}

export default function BottomNavbar({ 
  sectionsCount = 9,
  sections = [],
  pageType = 'prosjekt-story',
  prosjektSlug,
  onFindThemeClick,
  onContactClick 
}: BottomNavbarProps) {
  const [isVisible] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFindTheme = () => {
    if (onFindThemeClick) {
      onFindThemeClick()
    } else {
      // Toggle menu
      setIsMenuOpen(!isMenuOpen)
    }
  }

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMenuOpen(false)
  }

  const handleContact = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      // Default behavior can be customized
      console.log('Contact clicked')
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay - close menu when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/0 z-40 animate-in fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Popup Menu */}
      {isMenuOpen && sections.length > 0 && (
        <div className="fixed bottom-[calc(44px+40px+16px)] left-5 right-5 z-50 max-w-[min(90vw,380px)] mx-auto">
          <div className="bg-white/85 backdrop-blur-[32px] border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Menu header */}
            <div className="p-5 pb-4 border-b border-black/5">
              <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                Utforsk innhold
              </h3>
            </div>
            
            {/* Menu items */}
            <div className="max-h-[min(70vh,500px)] overflow-y-auto p-2">
              {sections.map((section) => (
                <button
                  key={section.sectionId}
                  onClick={() => handleSectionClick(section.sectionId)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 active:bg-black/10 transition-colors text-left group"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 bg-gray-100 group-hover:bg-[#059669]/10 rounded-md flex items-center justify-center flex-shrink-0 transition-colors">
                    <span className="text-base">{section.sectionIcon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {section.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gradient fade background */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none z-40" />
      
      {/* Bottom navbar container */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-10 px-5">
        <div className="flex gap-3 max-w-md mx-auto">
          {/* Tilbake til oversikt button (for tema-story og route-story) */}
          {(pageType === 'tema-story' || pageType === 'route-story') && prosjektSlug && (
            <Link 
              href={`/${prosjektSlug}`}
              className="flex-shrink-0 px-4 h-11 bg-white/85 backdrop-blur-[32px] border border-white/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#059669]/90 hover:border-[#059669]/30 hover:shadow-[0_12px_40px_rgba(5,150,105,0.2),0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-400 flex items-center justify-center gap-2.5 group"
            >
              {/* Back arrow icon */}
              <div className="w-[26px] h-[26px] bg-[#059669]/10 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300">
                <svg 
                  className="w-4 h-4 text-[#059669] group-hover:text-white transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              
              {/* Label */}
              <span className="text-sm font-semibold text-[#1d1d1f] group-hover:text-white tracking-tight transition-colors duration-300">
                {pageType === 'route-story' ? 'Back to Hub' : 'Tilbake til oversikt'}
              </span>
            </Link>
          )}

          {/* Finn ditt tema button (skjules på landing-hub og route-story) */}
          {pageType !== 'landing-hub' && pageType !== 'route-story' && (
            <button
              onClick={handleFindTheme}
              className="flex-1 min-w-[140px] h-11 px-4 bg-white/85 backdrop-blur-[32px] border border-white/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#059669]/90 hover:border-[#059669]/30 hover:shadow-[0_12px_40px_rgba(5,150,105,0.2),0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-400 flex items-center justify-center gap-2.5 group"
            >
              {/* Hamburger/Plus icon */}
              <div className="w-[26px] h-[26px] bg-[#059669]/10 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300">
                <div className="w-4 h-4 relative text-[#059669] group-hover:text-white transition-colors duration-300">
                  <span className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-current -translate-y-1/2" />
                  <span className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-current -translate-x-1/2" />
                </div>
              </div>
              
              {/* Label */}
              <span className="text-sm font-semibold text-[#1d1d1f] group-hover:text-white tracking-tight transition-colors duration-300">
                Finn ditt tema
              </span>
              
              {/* Counter badge */}
              <span className="bg-[#059669]/10 group-hover:bg-white/20 text-[#059669] group-hover:text-white text-xs font-semibold px-1.5 py-0.5 rounded-[10px] min-w-[18px] text-center transition-all duration-300">
                {sectionsCount}
              </span>
            </button>
          )}

          {/* Contact button */}
          <button
            onClick={handleContact}
            className="flex-shrink-0 px-4 h-11 bg-white/85 backdrop-blur-[32px] border border-white/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#059669]/90 hover:border-[#059669]/30 hover:shadow-[0_12px_40px_rgba(5,150,105,0.2),0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-400 flex items-center justify-center group"
          >
            <span className="text-sm font-semibold text-[#1d1d1f] group-hover:text-white tracking-tight transition-colors duration-300">
              Kontakt
            </span>
          </button>

          {/* Scroll to top button */}
          <button
            onClick={scrollToTop}
            className="w-11 h-11 flex-shrink-0 bg-white/85 backdrop-blur-[32px] border border-white/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#059669]/90 hover:border-[#059669]/30 hover:shadow-[0_12px_40px_rgba(5,150,105,0.2),0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-400 flex items-center justify-center group"
            aria-label="Scroll til toppen"
          >
            <svg 
              className="w-[18px] h-[18px] text-[#059669] group-hover:text-white transition-colors duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
