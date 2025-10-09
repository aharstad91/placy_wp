import Link from 'next/link'
import { StorySection } from '@/types/wordpress'

interface TableOfContentsProps {
  sections: StorySection[]
  storySlug: string
}

export default function TableOfContents({ sections, storySlug }: TableOfContentsProps) {
  if (!sections || sections.length === 0) return null

  return (
    <section className="table-of-contents bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
            Utforsk seksjoner
          </h2>
          <p className="text-gray-600 text-lg">
            Oppdag alle delene av historien
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sections.map((section) => (
            <a
              key={section.sectionId}
              href={`#${section.sectionId}`}
              className="toc-item"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(section.sectionId)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              <div className="toc-icon">
                {section.sectionIcon}
              </div>
              <div className="toc-content">
                <h3>{section.title}</h3>
                <p>{section.description.substring(0, 50)}...</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .toc-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-decoration: none;
          color: inherit;
        }
        
        .toc-item:hover {
          border-color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          background: rgba(0, 0, 0, 0.02);
        }
        
        .toc-icon {
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .toc-content h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          line-height: 1.2;
        }
        
        .toc-content p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.2;
        }
      `}</style>
    </section>
  )
}
