import { WordPressPost } from '@/types/wordpress'
import Link from 'next/link'
import Image from 'next/image'

interface PostCardProps {
  post: WordPressPost
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.featuredImage && (
        <div className="relative h-48 w-full">
          <Image
            src={post.featuredImage.sourceUrl}
            alt={post.featuredImage.altText || post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.nodes.map((category) => (
            <span
              key={category.slug}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {category.name}
            </span>
          ))}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          <Link 
            href={`/posts/${post.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt.replace(/<[^>]*>/g, '')}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Av {post.author.name}</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('no-NO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </div>
    </article>
  )
}