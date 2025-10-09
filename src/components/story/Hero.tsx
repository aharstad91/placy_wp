import Image from 'next/image'
import { StoryHero } from '@/types/wordpress'

interface HeroProps {
  hero: StoryHero
}

export default function Hero({ hero }: HeroProps) {
  return (
    <section 
      className="relative w-full bg-cover bg-center bg-no-repeat flex items-end" 
      style={{ 
        height: 'calc(var(--viewport-height, 100vh) * 0.9)',
        backgroundImage: hero.backgroundImage?.sourceUrl 
          ? `url(${hero.backgroundImage.sourceUrl})` 
          : 'linear-gradient(135deg, #e8f4f8 0%, #d1e7dd 100%)'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Hero content positioned at bottom */}
      <div className="relative z-10 w-full px-6 pb-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg font-serif">
            {hero.title}
          </h1>
          <p className="text-white text-lg md:text-xl leading-relaxed drop-shadow-md">
            {hero.description}
          </p>
        </div>
      </div>
    </section>
  )
}
