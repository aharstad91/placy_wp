import Image from 'next/image'
import { StorySection as StorySectionType } from '@/types/wordpress'

interface StorySectionProps {
  section: StorySectionType
}

export default function StorySection({ section }: StorySectionProps) {
  return (
    <section id={section.sectionId} className="section px-6 py-6 mb-16">
      {/* Section Header Image */}
      {section.headerImage && (
        <div className="relative bg-gray-200 rounded-lg mb-6 overflow-hidden" style={{ height: 'calc(var(--viewport-height, 100vh) * 0.33)' }}>
          <Image
            src={section.headerImage.sourceUrl}
            alt={section.headerImage.altText || section.title}
            fill
            className="object-cover"
          />
          {/* Icon overlay */}
          <div className="absolute top-4 left-4 w-8 h-8 text-[#78908E] bg-white rounded-full p-2 shadow-md flex items-center justify-center">
            <span className="text-base">{section.sectionIcon}</span>
          </div>
        </div>
      )}
      
      {/* Section Header */}
      <header className="section-header">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 w-full text-left">{section.title}</h1>
        </div>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          {section.description}
        </p>
      </header>

      {/* Map and POI Section */}
      {section.showMap && (
        <div className="section-content">
          {/* Map Placeholder */}
          <div 
            className="bg-gray-200 rounded-lg relative mb-12 transition-all hover:bg-gray-300 cursor-pointer bg-cover bg-center border border-gray-300" 
            style={{ height: 'calc(var(--viewport-height, 100vh) * 0.4)' }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-gray-600 text-2xl font-medium mb-2">
                {section.mapType === 'idrett' ? 'Idrett & Trening' : 'Kart'}
              </div>
              <div className="text-gray-500 text-lg">Klikk for å aktivere kart</div>
              {section.mapType && section.mapType !== 'none' && (
                <div className="mt-2 px-4 py-2 bg-white rounded-full text-sm text-gray-600 shadow">
                  {section.mapType}
                </div>
              )}
            </div>
          </div>

          {/* POI Tags/Buttons */}
          {section.relatedPois && section.relatedPois.length > 0 && (
            <div className="poi-tags-container overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-3">
                {section.relatedPois.map((poi) => (
                  <button
                    key={poi.id}
                    className={`poi-tag flex-shrink-0 ${poi.poiFields.comingSoon ? 'coming-soon' : ''}`}
                    disabled={poi.poiFields.comingSoon}
                    title={poi.poiFields.comingSoon ? 'Coming soon' : poi.title}
                  >
                    <span className="poi-tag-icon text-xl">{poi.poiFields.poiIcon}</span>
                    <span className="poi-tag-text font-medium">{poi.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* POI Details Cards (horizontal scroll) */}
      {section.relatedPois && section.relatedPois.length > 0 && (
        <div className="overflow-x-auto horizontal-scroll mt-6">
          <div className="flex gap-4 pb-6" style={{ width: 'max-content' }}>
            {section.relatedPois.map((poi) => (
              <div 
                key={poi.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[280px] max-w-[280px]"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>{poi.poiFields.poiIcon}</span>
                  <span>{poi.title}</span>
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {poi.poiFields.poiDescription}
                </p>
                {poi.poiFields.poiMetadata && poi.poiFields.poiMetadata.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {poi.poiFields.poiMetadata.map((meta, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                      >
                        {meta.tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .poi-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          min-height: 64px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .poi-tag:hover:not(.coming-soon) {
          background: white;
          border-color: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .poi-tag.coming-soon {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
