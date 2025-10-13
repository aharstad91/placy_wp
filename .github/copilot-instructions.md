# Placy WP - AI Agent Instructions

## 🏗️ Architecture Overview

**Headless WordPress + Next.js 14 App Router**
- **Frontend**: Next.js 14 (TypeScript, Tailwind, Apollo GraphQL) @ `/Users/andreasharstad/placy-wp`
- **Backend**: WordPress + WPGraphQL + ACF Pro @ `/Applications/MAMP/htdocs/placy-wp-backend`
- **Theme**: Minimal headless theme @ `/Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy`

### Data Flow
```
WordPress ACF Fields → WPGraphQL → Apollo Client → Next.js Components
```

**Key Insight**: All content is ACF Pro fields (NO native WordPress title/content/excerpt). Custom Post Types: Kunde → Prosjekt → Story → POI

## ⚠️ CRITICAL: functions.php Sync Workflow

`functions.php` in this repo is the **source of truth** under version control. WordPress reads from MAMP directory.

**After EVERY edit to `functions.php`:**
```bash
npm run sync:backend
```

Or use watch mode while developing:
```bash
npm run watch:backend  # Requires: brew install fswatch
```

**Why?** ACF field registration happens in `functions.php`. Changes won't appear in WordPress admin until synced.

## 📁 Key File Locations

### Frontend (This Repo)
- **Types**: `src/types/wordpress.ts` - TypeScript interfaces matching ACF structure
- **Queries**: `src/queries/wordpress.ts` - GraphQL queries (fragments encouraged)
- **Story Pages**: `src/app/[prosjekt]/[story]/page.tsx` - Hierarchical routing
- **Story Components**: `src/components/story/*` - Hero, StorySection, TableOfContents
- **Mapbox**: `src/components/MapboxMap.tsx`, `MapRoute.tsx` - Full POI integration

### Backend (MAMP)
- **ACF Registration**: `functions.php` - Custom Post Types + ACF field groups
- **Theme**: `/Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy/`

## 🔄 Development Workflow

### 1. Adding New ACF Fields
```bash
# Edit functions.php (add field to appropriate acf_add_local_field_group)
npm run sync:backend
# Refresh WordPress admin (Cmd+R)
# Update src/types/wordpress.ts with new field
# Update src/queries/wordpress.ts to fetch new field
# Test in GraphiQL: http://localhost:8888/placy-wp-backend/graphql
```

### 2. Testing GraphQL Queries
```bash
# Terminal test
curl -s http://localhost:8888/placy-wp-backend/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ pois { nodes { id title poiFields { poiLatitude poiLongitude } } } }"}'

# Or use GraphiQL IDE in browser
```

### 3. Running Development Servers
```bash
npm run dev                # Next.js @ localhost:3000
# MAMP WordPress already running @ localhost:8888/placy-wp-backend
```

## 🗂️ Custom Post Type Hierarchy

```
Kunde (kunde)
  └── kundeFields (ACF): navn*, beskrivelse, logo*, website, bransje, brandColor, kontaktperson, epost, telefon
      └── Prosjekt (prosjekt)
            └── prosjektFields (ACF): tittel*, beskrivelse, kunde*, bilder, startDate, endDate, status*, techStack, projectUrl, githubUrl
                └── Story (story)
                      └── storyFields (ACF): heroSection, storySections[](title, description, headerImage, showMap, mapType, relatedPois)
                            └── POI (poi)
                                  └── poiFields (ACF): poiDescription, poiLatitude*, poiLongitude*, poiCategory, poiIcon
```

**All fields are ACF Pro fields with `show_in_graphql => 1`**

## 🌐 Hierarchical URL Structure

Stories use project-based URLs:
- Pattern: `/{prosjekt-slug}/{story-slug}`
- Example: `/overvik-bolig/velkommen-til-overvik`
- Implementation: `src/app/[prosjekt]/[story]/page.tsx` validates project-story relationship

## 🗺️ Mapbox Integration

**Environment Variable Required:**
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...  # .env.local
```

**POI Structure (Mapbox-ready):**
- `poiLatitude` (number, required) - Decimal degrees
- `poiLongitude` (number, required) - Decimal degrees  
- `poiCategory` (select) - For filtering
- `poiIcon` (text) - Emoji for map markers

**Components:**
- `MapboxMap.tsx` - Full-screen modal with POI markers, popups, category filters
- `MapRoute.tsx` - Route visualization from project location to POIs
- `StorySection.tsx` - Integrates map trigger and modal

## 🎨 Code Conventions

### ⚠️ CRITICAL: Vibe Coder Preferences - NO CODE EVER
**Andreas is a vibe coder** - NEVER show code examples:
- ✅ **Conceptual explanations** and high-level architecture decisions
- ✅ **Step-by-step instructions** in plain language
- ✅ **Visual descriptions** of UI/UX changes and outcomes
- ✅ **Which files to edit** and what to change conceptually
- ✅ **WHY** something needs to change (reasoning and context)
- ❌ **ABSOLUTELY NO code blocks, syntax examples, or implementation details**
- ❌ **NEVER show TypeScript, JavaScript, PHP, or any programming code**
- ❌ **NO code even when asking technical questions** - always answer conceptually

**When suggesting changes:**
1. Explain **WHAT** needs to change and **WHY**
2. Describe **WHERE** the change should happen (specific file paths)
3. Provide **conceptual guidance** on what the change accomplishes
4. Describe the desired outcome in plain language
5. Let Andreas implement based on conceptual understanding
6. **NEVER include code blocks regardless of question type**

### TypeScript
- **Strict typing**: All WordPress data must have interfaces in `src/types/wordpress.ts`
- **GraphQL fragments**: Use for reusable query parts (see existing queries)
- **ACF field naming**: Use camelCase in TypeScript, snake_case in PHP ACF registration

### React/Next.js
- **Server Components by default**: Use `'use client'` only for interactivity (maps, modals, forms)
- **Apollo Client**: Wrapped in `src/lib/apollo-wrapper.tsx`, queries use `useQuery` hook
- **Image optimization**: Always use Next.js `<Image>` component with `fill` for responsive layouts
- **Tailwind**: Use utility classes, no custom CSS except in `globals.css`

### WordPress/PHP
- **ACF Fields**: Always set `'show_in_graphql' => 1` and provide `graphql_field_name`
- **CPT Registration**: Must include `'show_in_graphql' => true`, `graphql_single_name`, `graphql_plural_name`
- **Required fields**: Mark with `'required' => 1` in ACF, add `*` in TypeScript comments

## 🔍 Common Debugging Steps

**Changes not appearing?**
1. ✅ Synced `functions.php`? → `npm run sync:backend`
2. ✅ Refreshed WordPress admin? → Cmd+R
3. ✅ Updated TypeScript types? → `src/types/wordpress.ts`
4. ✅ Updated GraphQL query? → `src/queries/wordpress.ts`
5. ✅ Test query in GraphiQL? → `http://localhost:8888/placy-wp-backend/graphql`

**WordPress debug log:**
```bash
tail -f /Applications/MAMP/htdocs/placy-wp-backend/wp-content/debug.log
```

## 📚 Essential Documentation Files

- **SYNC_GUIDE.md** - Backend sync workflow (MUST READ)
- **BACKEND_GUIDE.md** - Complete ACF structure and GraphQL examples
- **HIERARCHICAL_URL_STRUCTURE.md** - Project/Story URL routing
- **MAPBOX_SETUP.md** - POI integration setup
- **deployment/SERVEBOLT_GUIDE.md** - Production deployment patterns

## 🚀 NPM Scripts Reference

```bash
npm run dev              # Next.js development server
npm run build            # Production build
npm run sync:backend     # Sync functions.php to WordPress (IMPORTANT!)
npm run watch:backend    # Auto-sync on file changes
npm run analyze          # Bundle size analysis (ANALYZE=true)
```

## 💡 Project-Specific Patterns

**ACF Repeater Pattern** (Story Sections):
```typescript
// WordPress registers repeater with sub_fields array
// GraphQL returns array of objects
storyFields: {
  storySections: Array<{
    title: string
    description: string
    // ... sub_fields become object properties
  }>
}
```

**Image Field Pattern** (ACF Image returns node):
```typescript
headerImage?: {
  node: {
    sourceUrl: string
    altText: string
    mediaDetails?: { width: number; height: number }
  }
}
```

**Post Object Relationship** (Prosjekt → Story):
```php
// ACF registration
'type' => 'post_object',
'post_type' => array('prosjekt'),
'return_format' => 'object'

// GraphQL query requires { node { ... } } structure
prosjekt { node { id title slug } }
```

## 🚀 Deployment

**Production Setup: Servebolt Hosting**

Both frontend and backend deploy to Servebolt:
- **WordPress Backend**: `api.placywp.no` (or subdomain)
- **Next.js Frontend**: Main domain

### Required Environment Variables
```bash
# .env.local (development)
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8888/placy-wp-backend/graphql
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Production (Servebolt)
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=https://api.placywp.no/graphql
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

See `deployment/SERVEBOLT_GUIDE.md` for complete deployment instructions.

## 🐳 Docker (Optional Local Development)

A `docker-compose.yml` exists for alternative local setup. Primary development uses MAMP.