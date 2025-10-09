# 🏗️ Placy Backend Guide

## Struktur Oversikt

```
Kunder (kunde)
  ├── Logo
  ├── Website
  ├── Bransje
  └── Merkevare Farge
      │
      └── Prosjekter (prosjekt)
            ├── Kunde (relasjon)
            ├── Startdato
            ├── Sluttdato
            ├── Status
            ├── Tech Stack
            └── Prosjekt URL
                │
                └── Stories (story)
                      ├── Prosjekt (relasjon)
                      ├── Type
                      ├── Dato
                      ├── Media Gallery
                      └── Video URL
```

## Custom Post Types

### 1. **Kunde** (`kunde`)
- **Slug**: `/kunder/`
- **GraphQL**: `kunde` / `kunder`
- **Icon**: 👤 Businessperson
- **Felter**:
  - Logo (image)
  - Website (url)
  - Bransje (text)
  - Merkevare Farge (color picker)

### 2. **Prosjekt** (`prosjekt`)
- **Slug**: `/prosjekter/`
- **GraphQL**: `prosjekt` / `prosjekter`
- **Icon**: 📁 Portfolio
- **Felter**:
  - **Kunde** (post_object → kunde) *REQUIRED*
  - Startdato (date)
  - Sluttdato (date)
  - Status (select: Aktiv, Fullført, På vent, Arkivert)
  - Tech Stack (checkbox: Next.js, WordPress, React, TypeScript, Tailwind, GraphQL)
  - Prosjekt URL (url)

### 3. **Story** (`story`)
- **Slug**: `/stories/`
- **GraphQL**: `story` / `stories`
- **Icon**: 📄 Media Document
- **Felter**:
  - **Prosjekt** (post_object → prosjekt) *REQUIRED*
  - Type (select: Oppdatering, Milepæl, Utfordring, Suksess, Innsikt)
  - Dato (date)
  - Media Gallery (images)
  - Video URL (url)

## GraphQL Queries

### Hent alle kunder med prosjekter
```graphql
query GetKunder {
  kunder {
    nodes {
      id
      title
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      kundeFields {
        logo {
          sourceUrl
          altText
        }
        website
        industry
        brandColor
      }
    }
  }
}
```

### Hent et prosjekt med kunde og stories
```graphql
query GetProsjekt($id: ID!) {
  prosjekt(id: $id) {
    id
    title
    content
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
    prosjektFields {
      kunde {
        ... on Kunde {
          id
          title
          kundeFields {
            logo {
              sourceUrl
            }
            brandColor
          }
        }
      }
      startDate
      endDate
      status
      techStack
      projectUrl
    }
  }
}
```

### Hent stories for et prosjekt
```graphql
query GetStoriesForProsjekt($prosjektId: ID!) {
  stories(where: { metaQuery: { 
    key: "prosjekt", 
    value: $prosjektId 
  }}) {
    nodes {
      id
      title
      content
      storyFields {
        prosjekt {
          ... on Prosjekt {
            id
            title
          }
        }
        storyType
        storyDate
        media {
          sourceUrl
          altText
        }
        videoUrl
      }
    }
  }
}
```

## Admin Columns

### Kunde Admin
- Logo (thumbnail)
- Bransje
- **Antall Prosjekter** (automatisk telling)

### Prosjekt Admin
- **Kunde** (link til kunde)
- **Status** (med farge-koding)
- **Tech Stack** (første 3 valg)

### Story Admin
- **Prosjekt** (link til prosjekt)
- **Kunde** (via prosjekt relasjon)
- **Type** (med emoji)
- **Story Dato**

## Status Badges

### Prosjekt Status
- 🟢 **Aktiv** - Pågående arbeid
- ✓ **Fullført** - Prosjekt levert
- ⏸ **På vent** - Midlertidig pauset
- □ **Arkivert** - Avsluttet/arkivert

### Story Type
- 📝 **Oppdatering** - Generell oppdatering
- 🎯 **Milepæl** - Viktig milepæl nådd
- ⚠️ **Utfordring** - Utfordring møtt/løst
- 🎉 **Suksess** - Suksesshistorie
- 💡 **Innsikt** - Viktig innsikt/læring

## Workflow

### Opprett ny kunde
1. Gå til **Kunder → Legg til ny**
2. Fyll inn:
   - Tittel (kundens navn)
   - Beskrivelse
   - Last opp logo
   - Legg til website, bransje, merkevare farge

### Opprett nytt prosjekt
1. Gå til **Prosjekter → Legg til nytt**
2. Fyll inn:
   - Tittel (prosjektnavn)
   - Beskrivelse
   - **Velg kunde** (REQUIRED)
   - Sett datoer, status, tech stack

### Opprett ny story
1. Gå til **Stories → Legg til ny**
2. Fyll inn:
   - Tittel
   - Innhold
   - **Velg prosjekt** (REQUIRED)
   - Velg type, dato
   - Last opp media/video

## Testing

### Test i GraphiQL
Gå til: `http://localhost:8888/placy-wp-backend/graphql`

```graphql
# Test query
{
  kunder {
    nodes {
      title
    }
  }
  prosjekter {
    nodes {
      title
      prosjektFields {
        kunde {
          ... on Kunde {
            title
          }
        }
      }
    }
  }
  stories {
    nodes {
      title
      storyFields {
        prosjekt {
          ... on Prosjekt {
            title
          }
        }
      }
    }
  }
}
```

## Next.js Integration

Se `src/queries/wordpress.ts` for TypeScript queries.

TypeScript types kan genereres med:
```bash
npm run codegen
```

## Neste Steg

1. ✅ Backend struktur komplett
2. ⏭️ Opprett test-data i WordPress
3. ⏭️ Test GraphQL queries
4. ⏭️ Bygg Next.js komponenter
5. ⏭️ Implementer frontend visning

---

**Branch**: `feature/placy-backend-structure`
**Commit**: Backend struktur implementert
