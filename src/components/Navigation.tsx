import { WordPressMenu } from '@/types/wordpress'
import Link from 'next/link'
import { useState } from 'react'

interface NavigationProps {
  menu?: WordPressMenu
}

export function Navigation({ menu }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const defaultMenuItems = [
    { id: '1', label: 'Hjem', url: '/', parentId: null },
    { id: '2', label: 'Blogg', url: '/posts', parentId: null },
    { id: '3', label: 'Om oss', url: '/om-oss', parentId: null },
    { id: '4', label: 'Kontakt', url: '/kontakt', parentId: null },
  ]

  const menuItems = menu?.menuItems.nodes || defaultMenuItems

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Placy WP
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col space-y-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}