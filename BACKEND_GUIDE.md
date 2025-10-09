# 🏗️ Placy Backend Guide

## ⚡ FULL ACF STRUKTUR
All innhold er nå i ACF Pro fields - ingen WordPress native title/content/excerpt.

## Struktur Oversikt

```
Kunder (kunde)
  ├── Navn *required*
  ├── Beskrivelse (wysiwyg)
  ├── Logo *required*
  ├── Website
  ├── Bransje (select)
  ├── Merkevare Farge
  ├── Kontaktperson
  ├── E-post
  └── Telefon
      │
      └── Prosjekter (prosjekt)
            ├── Tittel *required*
            ├── Beskrivelse (wysiwyg)
            ├── Kunde (relasjon) *required*
            ├── Bilder (gallery)
            ├── Startdato
            ├── Sluttdato
            ├── Status *required*
            ├── Tech Stack
            ├── Prosjekt URL
            └── GitHub URL
                │
                └── Stories (story)
                      ├── Tittel *required*
                      ├── Innhold (wysiwyg) *required*
                      ├── Prosjekt (relasjon) *required*
                      ├── Type *required*
                      ├── Dato *required*
                      ├── Media Gallery
                      ├── Video URL
                      └── Høydepunkter (repeater)
```

## Custom Post Types

### 1. **Kunde** (`kunde`)
- **Slug**: `/kunder/`
- **GraphQL**: `kunde` / `kunder`
- **Icon**: 👤 Businessperson
- **ACF Fields (kundeFields)**:
  - `navn` (text) *required*
  - `beskrivelse` (wysiwyg)
  - `logo` (image) *required*
  - `website` (url)
  - `bransje` (select: Teknologi, Detaljhandel, Finans, Helse, Utdanning, Industri, Eiendom, Annet)
  - `brandColor` (color_picker)
  - `kontaktperson` (text)
  - `epost` (email)
  - `telefon` (text)

### 2. **Prosjekt** (`prosjekt`)
- **Slug**: `/prosjekter/`
- **GraphQL**: `prosjekt` / `prosjekter`
- **Icon**: 📁 Portfolio
- **ACF Fields (prosjektFields)**:
  - `tittel` (text) *required*
  - `beskrivelse` (wysiwyg)
  - `kunde` (post_object → kunde) *required*
  - `bilder` (gallery)
  - `startDate` (date_picker)
  - `endDate` (date_picker)
  - `status` (select: Planlegging, Aktiv, Fullført, På vent, Arkivert) *required*
  - `techStack` (checkbox: Next.js, WordPress, React, TypeScript, Tailwind CSS, GraphQL, Node.js, Python, Docker)
  - `projectUrl` (url)
  - `githubUrl` (url)

### 3. **Story** (`story`)
- **Slug**: `/stories/`
- **GraphQL**: `story` / `stories`
- **Icon**: 📄 Media Document
- **ACF Fields (storyFields)**:
  - `tittel` (text) *required*
  - `innhold` (wysiwyg) *required*
  - `prosjekt` (post_object → prosjekt) *required*
  - `storyType` (select: Oppdatering, Milepæl, Utfordring, Suksess, Innsikt, Kunngjøring) *required*
  - `storyDate` (date_picker) *required*
  - `media` (gallery)
  - `videoUrl` (url)
  - `highlights` (repeater)
    - `text` (text)

## GraphQL Queries

### Hent alle kunder (Full ACF)
```graphql
query GetKunder {
  kunder {
    nodes {
      id
      databaseId
      kundeFields {
        navn
        beskrivelse
        logo {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
        website
        bransje
        brandColor
        kontaktperson
        epost
        telefon
      }
    }
  }
}
```

### Hent et prosjekt med kunde og stories (Full ACF)
```graphql
query GetProsjekt($id: ID!) {
  prosjekt(id: $id) {
    id
    databaseId
    prosjektFields {
      tittel
      beskrivelse
      kunde {
        ... on Kunde {
          id
          databaseId
          kundeFields {
            navn
            logo {
              sourceUrl
            }
            brandColor
          }
        }
      }
      bilder {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
      startDate
      endDate
      status
      techStack
      projectUrl
      githubUrl
    }
  }
}
```

### Hent alle stories med full data (Full ACF)
```graphql
query GetAllStories {
  stories {
    nodes {
      id
      databaseId
      storyFields {
        tittel
        innhold
        prosjekt {
          ... on Prosjekt {
            id
            prosjektFields {
              tittel
              kunde {
                ... on Kunde {
                  kundeFields {
                    navn
                    brandColor
                  }
                }
              }
            }
          }
        }
        storyType
        storyDate
        media {
          sourceUrl
          altText
        }
        videoUrl
        highlights {
          text
        }
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
