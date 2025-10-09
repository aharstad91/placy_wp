---
applyTo: '**'
---

# Placy WP - Project Instructions

## 🏗️ Project Structure

This is a **headless WordPress** setup with:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (this repo)
- **Backend**: WordPress + WPGraphQL + ACF (MAMP local server)

### Important Paths
- Frontend repo: `/Users/andreasharstad/placy-wp`
- WordPress backend: `/Applications/MAMP/htdocs/placy-wp-backend`
- WordPress theme: `/Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy`

## ⚠️ CRITICAL: Sync functions.php After Changes

**EVERY TIME** you edit `functions.php` in the frontend repo, you MUST sync it to WordPress:

```bash
cp /Users/andreasharstad/placy-wp/functions.php /Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy/functions.php
```

### Why?
- The `functions.php` in this repo is the source of truth
- WordPress reads from `/Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy/functions.php`
- ACF field changes won't appear in WordPress admin until synced

### After Sync Checklist:
1. ✅ Copy `functions.php` to WordPress theme folder
2. ✅ Refresh WordPress admin page (F5/Cmd+R)
3. ✅ Verify ACF fields are updated
4. ✅ Test GraphQL query in GraphiQL IDE

## 📋 Development Workflow

### 1. Making Backend Changes (functions.php)
```bash
# Edit functions.php in VS Code
# Then sync to WordPress:
cp /Users/andreasharstad/placy-wp/functions.php /Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy/functions.php

# Refresh WordPress admin to see changes
```

### 2. Making Frontend Changes (TypeScript/React)
- Edit TypeScript types in `src/types/wordpress.ts`
- Update GraphQL queries in `src/queries/wordpress.ts`
- Update React components in `src/components/`
- No sync needed - changes are immediate

### 3. Testing GraphQL Queries
```bash
# Test in terminal
curl -s http://localhost:8888/placy-wp-backend/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ pois { nodes { id title poiFields { poiDescription poiLatitude poiLongitude } } } }"}'

# Or use GraphiQL IDE in browser:
# http://localhost:8888/placy-wp-backend/graphql
```

## 🗂️ Custom Post Types

1. **Kunde** (Client)
2. **Prosjekt** (Project) - Related to Kunde
3. **Story** - Related to Prosjekt
4. **POI** (Point of Interest) - Related to Story sections

### POI Structure (Mapbox-ready)
```
POI Fields:
- poiDescription (textarea)
- poiLatitude (number, required)
- poiLongitude (number, required)
```

## 🔄 Sync Scripts Available

```bash
# Sync backend changes (if script exists)
./sync-backend.sh

# Watch for changes (if script exists)
./watch-backend.sh
```

## 🚨 Common Mistakes to Avoid

1. ❌ **Editing functions.php in WordPress theme folder directly**
   - ✅ Always edit in `/Users/andreasharstad/placy-wp/functions.php`
   - ✅ Then sync to WordPress

2. ❌ **Forgetting to sync after functions.php changes**
   - ✅ Always run the copy command after editing
   - ✅ Always refresh WordPress admin

3. ❌ **Not updating TypeScript types when ACF fields change**
   - ✅ Update `src/types/wordpress.ts` to match ACF fields
   - ✅ Update `src/queries/wordpress.ts` GraphQL queries

4. ❌ **Testing without syncing**
   - ✅ Sync → Refresh Admin → Test GraphQL → Test Frontend

## 📝 Code Standards

### TypeScript
- Use strict typing
- Export interfaces for all WordPress data structures
- Use GraphQL fragments for reusable queries

### React Components
- Use Next.js 14 App Router conventions
- Server Components by default, Client Components only when needed
- Tailwind CSS for styling

### WordPress/PHP
- ACF fields must have `'show_in_graphql' => 1`
- CPTs must have `'show_in_graphql' => true`
- Use `graphql_single_name` and `graphql_plural_name`

## 🔍 Debugging Checklist

If changes don't appear:
1. ✅ Did you sync functions.php to WordPress?
2. ✅ Did you refresh WordPress admin?
3. ✅ Check WordPress Debug log: `/Applications/MAMP/htdocs/placy-wp-backend/wp-content/debug.log`
4. ✅ Test GraphQL query directly in GraphiQL
5. ✅ Check browser console for frontend errors

## 📚 Key Files

- `functions.php` - ACF fields, CPT registration
- `src/types/wordpress.ts` - TypeScript interfaces
- `src/queries/wordpress.ts` - GraphQL queries
- `src/components/story/*` - Story display components
- `STORY_GUIDE.md` - Content creation guide
- `POI_MAPBOX_UPDATE.md` - Mapbox integration guide

## 🎯 Remember

**Always sync functions.php to WordPress after changes!**

```bash
cp /Users/andreasharstad/placy-wp/functions.php /Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy/functions.php
```