# Test GraphQL Queries for Placy Backend

## Test i terminal

### 1. Test Kunder
```bash
curl -s http://localhost:8888/placy-wp-backend/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ kunder { nodes { id title kundeFields { logo { sourceUrl } website industry brandColor } } } }"
  }' | python3 -m json.tool
```

### 2. Test Prosjekter
```bash
curl -s http://localhost:8888/placy-wp-backend/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ prosjekter { nodes { id title prosjektFields { kunde { ... on Kunde { title } } status techStack startDate endDate } } } }"
  }' | python3 -m json.tool
```

### 3. Test Stories
```bash
curl -s http://localhost:8888/placy-wp-backend/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ stories { nodes { id title storyFields { prosjekt { ... on Prosjekt { title } } storyType storyDate } } } }"
  }' | python3 -m json.tool
```

## Test i GraphiQL

Gå til: http://localhost:8888/placy-wp-backend/graphql

### Query 1: Alle Kunder
```graphql
query GetAllKunder {
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

### Query 2: Alle Prosjekter med Kunde
```graphql
query GetAllProsjekter {
  prosjekter {
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
}
```

### Query 3: Alle Stories med Prosjekt og Kunde
```graphql
query GetAllStories {
  stories {
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
      storyFields {
        prosjekt {
          ... on Prosjekt {
            id
            title
            prosjektFields {
              kunde {
                ... on Kunde {
                  id
                  title
                  kundeFields {
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
      }
    }
  }
}
```

### Query 4: En spesifikk Kunde med alle Prosjekter
```graphql
query GetKundeWithProsjekter($id: ID!) {
  kunde(id: $id) {
    id
    title
    content
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
  
  # Hent alle prosjekter for denne kunden
  prosjekter(where: { 
    metaQuery: { 
      metaArray: [
        { key: "kunde", value: $id, compare: EQUAL_TO }
      ]
    }
  }) {
    nodes {
      id
      title
      prosjektFields {
        status
        startDate
        endDate
        techStack
      }
    }
  }
}
```

### Query 5: Schema Introspection - Se alle tilgjengelige felter
```graphql
{
  __type(name: "Kunde") {
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

```graphql
{
  __type(name: "KundeFields") {
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

## Verifiser at alt fungerer

✅ Kunder: `kunder { nodes { kundeFields { ... } } }`
✅ Prosjekter: `prosjekter { nodes { prosjektFields { kunde { ... } } } }`
✅ Stories: `stories { nodes { storyFields { prosjekt { ... } } } }`

## Status
- ✅ CPT registrert
- ✅ GraphQL eksponering fungerer
- ✅ ACF felter tilgjengelige
- ✅ Relasjoner fungerer

Neste: Opprett test-data i WordPress admin!
