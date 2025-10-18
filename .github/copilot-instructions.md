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

**Map Components:**
- `src/components/MapboxMap.tsx` - Used in Story pages (via StorySection.tsx)
- `src/components/route/RouteMap.tsx` - Used in Route pages (via RouteContentWrapper.tsx)
- `src/components/route/RoutePreviewMap.tsx` - Route preview thumbnails
- `src/components/route/RouteMapOverlay.tsx` - Overlay for route map
- `src/components/MapRoute.tsx` - Route visualization helper

### ⚠️ CRITICAL: Map Configuration Changes

**When making map configuration changes (style, filters, layers), update ALL map components:**

1. **MapboxMap.tsx** - Story/POI maps
2. **route/RouteMap.tsx** - Full route maps
3. **route/RoutePreviewMap.tsx** - Route preview thumbnails
4. **route/RouteMapOverlay.tsx** - Route overlays

**Common changes that need syncing:**
- Mapbox style (e.g., `outdoors-v12`, `streets-v12`, `light-v11`)
- POI/label layer filtering (hiding Mapbox built-in symbols)
- Zoom levels and bounds
- Map controls and interactions

**Example workflow:**
```bash
# 1. Change map style in MapboxMap.tsx
# 2. Apply same change to RouteMap.tsx
# 3. Apply same change to RoutePreviewMap.tsx
# 4. Apply same change to RouteMapOverlay.tsx
# 5. Test all map types (story maps, route maps, previews)
```

## 🎨 Code Conventions

### ⚠️ CRITICAL: Work Style Preferences

**Andreas prefers thorough research and planning over speed:**
- ✅ **Use "thinking mode" extensively** - think through problems before responding
- ✅ **Research thoroughly** - search documentation, check multiple sources, investigate options
- ✅ **Plan before implementing** - understand the full scope and implications
- ✅ **Quality over speed** - take time to find the right solution
- ❌ **Don't rush to answers** - it's better to be thorough than fast
- ❌ **Don't make assumptions** - verify and investigate first

**When facing a problem:**
1. Use the `think` tool to analyze and plan
2. Search relevant documentation and examples (web search, GitHub, etc.)
3. Check all related files and components
4. Consider edge cases and implications
5. Only then provide a well-researched solution

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

## � Key Features & Mechanics

### Dynamic POI Marker Scaling

**Implemented in:** `MapboxMap.tsx` and `RouteMap.tsx`

POI markers scale progressively based on zoom level to maintain visibility and usability:

**Zoom-based Scale Factors:**
- **Zoom < 15:** Scale Factor = 1.0x (normal size)
- **Zoom 15-16:** Scale Factor = 2.0x (double size)
- **Zoom ≥ 16:** Scale Factor = 3.0x (triple size)

**Base Sizes (before scaling):**
- **Major POI:** 40px marker, 3px border, 20px icon
- **Minor POI:** 30px marker, 2px border, 16px icon, 0.85 opacity

**What scales:**
- Marker size (width/height)
- Border width
- Icon font size

**Implementation details:**
- Triggered on every zoom event via `map.on('zoom', handleZoomChange)`
- Stores base sizes for each marker element
- Applies scaling multiplicatively to maintain proportions
- Console logs: `🎯 MapboxMap POI scaling | Zoom: X.XX | ScaleFactor: X | Markers: X`

**⚠️ CRITICAL:** When modifying zoom-based scaling, update BOTH:
1. `MapboxMap.tsx` - Story/POI maps
2. `RouteMap.tsx` - Route maps (also handles waypoint badges)

### Mini-POI Toggle

**Implemented in:** `MapboxMap.tsx`

Users can toggle visibility of Minor POIs (those with `poiTypes` slug `'minor'`):
- State stored in `localStorage` as `'showMiniPois'`
- Filter button in map UI
- Minor POIs have reduced opacity (0.85) when visible
- Major POIs always visible

## �💡 Project-Specific Patterns

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