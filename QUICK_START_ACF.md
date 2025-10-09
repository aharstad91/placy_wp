# 🚀 Quick Start - Full ACF Backend

## ✅ IMPLEMENTERT: FULL ACF STRUKTUR

All data er nå i ACF Pro fields - ingen WordPress native title/content brukes.

## Neste Steg

### 1. Flush Permalinks ⚠️ VIKTIG
```
http://localhost:8888/placy-wp-backend/wp-admin
Settings → Permalinks → Save Changes (bare klikk)
```

### 2. Se de nye CPT-menyer
WordPress admin sidebar:
- 👤 **Kunder**
- 📁 **Prosjekter**
- 📄 **Stories**

### 3. Opprett Test-Data

#### ➡️ Kunde: "Acme Corporation"
```
Kundenavn: Acme Corporation
Beskrivelse: Ledende teknologiselskap
Logo: [Last opp]
Website: https://acme.com
Bransje: Teknologi
Merkevare Farge: #FF6B6B
Kontaktperson: John Doe
E-post: john@acme.com
```

#### ➡️ Prosjekt: "Acme Nettbutikk"
```
Tittel: Acme Nettbutikk
Beskrivelse: E-handel med Next.js
Kunde: [Velg "Acme Corporation"]
Status: Aktiv
Tech Stack: Next.js, WordPress, TypeScript
Startdato: 01/09/2024
```

#### ➡️ Story: "Prosjektstart"
```
Tittel: Kickoff-møte
Innhold: Fantastisk start på prosjektet...
Prosjekt: [Velg "Acme Nettbutikk"]
Type: 🎯 Milepæl
Dato: 05/09/2024
```

### 4. Test GraphQL

http://localhost:8888/placy-wp-backend/graphql

```graphql
{
  kunder {
    nodes {
      kundeFields {
        navn
        logo { sourceUrl }
        brandColor
      }
    }
  }
  prosjekter {
    nodes {
      prosjektFields {
        tittel
        kunde {
          ... on Kunde {
            kundeFields { navn }
          }
        }
        status
      }
    }
  }
  stories {
    nodes {
      storyFields {
        tittel
        storyType
        prosjekt {
          ... on Prosjekt {
            prosjektFields { tittel }
          }
        }
      }
    }
  }
}
```

## ACF Field Reference

### kundeFields
`navn`, `beskrivelse`, `logo`, `website`, `bransje`, `brandColor`, `kontaktperson`, `epost`, `telefon`

### prosjektFields
`tittel`, `beskrivelse`, `kunde`, `bilder`, `startDate`, `endDate`, `status`, `techStack`, `projectUrl`, `githubUrl`

### storyFields
`tittel`, `innhold`, `prosjekt`, `storyType`, `storyDate`, `media`, `videoUrl`, `highlights`

## Status
✅ CPT med kun custom-fields  
✅ Full ACF struktur  
✅ GraphQL ready  
✅ Relasjoner: Kunde → Prosjekt → Story  
✅ Admin columns med ACF data  

Neste: Frontend integration! 🎨
