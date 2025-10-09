import { WordPressPost } from '@/types/wordpress'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Placy WP
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Moderne headless WordPress-løsning bygget med Next.js, TypeScript og GraphQL
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              ⚡ Lightning Fast
            </h2>
            <p className="text-gray-600">
              Server-side rendering og static generation for optimal ytelse
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              🎨 Modern Design
            </h2>
            <p className="text-gray-600">
              Tailwind CSS for responsiv og moderne styling
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              📱 SEO Ready
            </h2>
            <p className="text-gray-600">
              Optimalisert for søkemotorer med Next.js metadata API
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Kom i gang
          </h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold">1. Konfigurer WordPress GraphQL endpoint:</p>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
              WORDPRESS_GRAPHQL_ENDPOINT=https://your-wp-site.com/graphql
            </code>
            
            <p className="font-semibold">2. Installer WordPress plugins:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>WPGraphQL</li>
              <li>WPGraphQL for Advanced Custom Fields (valgfritt)</li>
              <li>Headless Mode (valgfritt)</li>
            </ul>

            <p className="font-semibold">3. Start utviklingsserveren:</p>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
              npm run dev
            </code>
          </div>
        </div>
      </div>
    </main>
  )
}