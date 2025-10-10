# Hierarkisk URL-struktur for Stories

## 🎯 Oversikt

Stories har nå hierarkisk URL-struktur basert på tilhørende Prosjekt:

**Ny struktur**: `/[prosjekt-slug]/[story-slug]`  
**Eksempel**: `/overvik-bolig/velkommen-til-overvik`

## 🔗 Relasjoner

```
Kunde → Prosjekt → Story
```

### Eksempel:
- **Kunde**: Obos (slug: `obos`)
- **Prosjekt**: Overvik Bolig (slug: `overvik-bolig`)
- **Story**: Velkommen til Overvik (slug: `velkommen-til-overvik`)
- **URL**: `/overvik-bolig/velkommen-til-overvik`

## 📝 Hvordan lage en Story med riktig URL

### 1. I WordPress Admin

1. Gå til **Stories** → **Legg til ny**
2. **Velg Prosjekt** (obligatorisk felt øverst)
3. Fyll inn Story-innhold
4. WordPress genererer automatisk URL: `/{prosjekt-slug}/{story-slug}/`

### 2. URL-validering

Hvis noen prøver å aksessere en story med feil prosjekt-slug:
- `/feil-prosjekt/min-story` → Feilmelding med riktig URL
- Frontend validerer at story tilhører riktig prosjekt

## 🛠️ Teknisk implementasjon

### WordPress (functions.php)

#### 1. Story ACF Field - Prosjekt Relasjon
```php
array(
    'key' => 'field_story_prosjekt',
    'label' => 'Prosjekt',
    'name' => 'prosjekt',
    'type' => 'post_object',
    'required' => 1,
    'post_type' => array('prosjekt'),
    'return_format' => 'object',
    'show_in_graphql' => 1,
)
```

#### 2. Custom Rewrite Rules
```php
function placy_story_rewrite_rules() {
    add_rewrite_rule(
        '^([^/]+)/([^/]+)/?$',
        'index.php?story=$matches[2]&prosjekt_slug=$matches[1]',
        'top'
    );
}
```

#### 3. Custom Permalink Structure
```php
function placy_story_permalink($post_link, $post) {
    if ($post->post_type !== 'story') return $post_link;
    
    $prosjekt = get_field('prosjekt', $post->ID);
    if ($prosjekt && isset($prosjekt->post_name)) {
        $prosjekt_slug = $prosjekt->post_name;
        $story_slug = $post->post_name;
        return home_url("/{$prosjekt_slug}/{$story_slug}/");
    }
    
    return home_url("/stories/{$post->post_name}/");
}
```

### Next.js Frontend

#### Folder Structure
```
src/app/
  [prosjekt]/
    [story]/
      page.tsx
```

#### Page Component
```typescript
export default function StoryPage() {
  const params = useParams()
  const prosjektSlug = params?.prosjekt as string
  const storySlug = params?.story as string

  // Query story by slug
  const { data } = useQuery<{ story: Story }>(GET_STORY_BY_SLUG, {
    variables: { slug: storySlug },
  })

  // Validate story belongs to correct prosjekt
  if (data?.story?.storyFields.prosjekt?.slug !== prosjektSlug) {
    // Show error with correct URL
  }
}
```

### GraphQL Queries

#### GET_STORY_BY_SLUG
```graphql
query GetStoryBySlug($slug: ID!) {
  story(id: $slug, idType: SLUG) {
    id
    title
    slug
    storyFields {
      prosjekt {
        ... on Prosjekt {
          id
          title
          slug
        }
      }
      heroSection { ... }
      storySections { ... }
    }
  }
}
```

#### GET_STORIES
```graphql
query GetStories {
  stories {
    nodes {
      id
      title
      slug
      storyFields {
        prosjekt {
          ... on Prosjekt {
            id
            title
            slug
          }
        }
      }
    }
  }
}
```

## 🔄 Migration fra gammel struktur

### Gammel struktur:
```
/stories/velkommen-til-overvik
```

### Ny struktur:
```
/overvik-bolig/velkommen-til-overvik
```

### Hva skjer med eksisterende stories?
- Stories **må** ha et Prosjekt valgt (required field)
- Gamle URLs med `/stories/[slug]` fungerer som fallback hvis prosjekt mangler
- Men alle nye stories **må** knyttes til et prosjekt

## 🧪 Testing

### 1. Test i WordPress Admin
```bash
# Etter sync, refresh WordPress admin
# Gå til Stories → Rediger en story
# Sjekk at "Prosjekt" feltet vises øverst
```

### 2. Test permalinks
```bash
# Flush rewrite rules (viktig!)
# I WordPress admin: Settings → Permalinks → Save Changes
```

### 3. Test GraphQL
```graphql
{
  stories {
    nodes {
      title
      slug
      storyFields {
        prosjekt {
          ... on Prosjekt {
            slug
          }
        }
      }
    }
  }
}
```

### 4. Test frontend
```bash
# Start dev server
npm run dev

# Test URL:
# http://localhost:3000/[prosjekt-slug]/[story-slug]
```

## ⚠️ Viktig etter sync!

### 1. Flush WordPress Rewrite Rules
```
WordPress Admin → Settings → Permalinks → Save Changes
```
Dette er **kritisk** for at de nye URL-ene skal fungere!

### 2. Velg Prosjekt for alle Stories
Alle eksisterende stories må få et Prosjekt valgt for at URL-strukturen skal fungere.

### 3. Test GraphQL endpoint
```bash
curl -s http://localhost:8888/placy-wp-backend/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ stories { nodes { title slug storyFields { prosjekt { ... on Prosjekt { slug } } } } } }"}'
```

## 📚 Relaterte filer

- `functions.php` - WordPress CPT og rewrite rules
- `src/types/wordpress.ts` - TypeScript interfaces
- `src/queries/wordpress.ts` - GraphQL queries
- `src/app/[prosjekt]/[story]/page.tsx` - Next.js page component

## 🎨 URL-eksempler

```
Prosjekt: Overvik Bolig (slug: overvik-bolig)
├── Story: Velkommen til Overvik
│   URL: /overvik-bolig/velkommen-til-overvik
├── Story: Idrettsbydelen
│   URL: /overvik-bolig/idrettsbydelen
└── Story: Grønne områder
    URL: /overvik-bolig/gronne-omrader

Prosjekt: Hasle Senter (slug: hasle-senter)
├── Story: Nytt liv i Hasle
│   URL: /hasle-senter/nytt-liv-i-hasle
└── Story: Transport og tilgang
    URL: /hasle-senter/transport-og-tilgang
```

## 🚀 Neste steg

1. ✅ Synce functions.php til WordPress
2. ⏳ Flush rewrite rules i WordPress admin
3. ⏳ Velg prosjekt for alle eksisterende stories
4. ⏳ Test URL-struktur i frontend
5. ⏳ Oppdater alle interne lenker til stories
