# WordPress Title Consistency Update

## 🎯 Problemet

ACF relationship dropdowns viste "Auto Draft" fordi CPT-er ikke hadde `title` support.

**Før:**
- Kunde: `'supports' => array('custom-fields')` + ACF `navn` felt
- Prosjekt: `'supports' => array('custom-fields')` + ACF `tittel` felt
- Story: `'supports' => array('title', 'custom-fields')` ✅
- POI: `'supports' => array('title', 'custom-fields')` ✅

## ✅ Løsningen

**Konsistent pattern for ALLE CPT-er:**

### WordPress Native Title brukes til:
- ✅ Kunde navn
- ✅ Prosjekt navn
- ✅ Story navn
- ✅ POI navn

### ACF brukes kun til metadata:
- Beskrivelser
- Bilder
- Relasjoner
- Datoer
- Tekniske detaljer
- etc.

## 🔧 Endringer

### 1. Kunde CPT
```php
// FØR:
'supports' => array('custom-fields')

// ETTER:
'supports' => array('title', 'custom-fields')
```

**Fjernet ACF-felt:**
- ❌ `navn` (bruker nå WordPress title)

### 2. Prosjekt CPT
```php
// FØR:
'supports' => array('custom-fields')

// ETTER:
'supports' => array('title', 'custom-fields')
```

**Fjernet ACF-felt:**
- ❌ `tittel` (bruker nå WordPress title)

### 3. Story CPT
✅ Hadde allerede `title` support - ingen endring

### 4. POI CPT
✅ Hadde allerede `title` support - ingen endring

## 📋 Fordeler med denne strukturen

### 1. ✅ Konsistens
- Samme pattern for alle CPT-er
- Lettere å forstå for utviklere
- Lettere å vedlikeholde

### 2. ✅ ACF Dropdowns fungerer
- Viser faktisk navn i stedet for "Auto Draft"
- Søk fungerer korrekt
- Relasjonsfelt fungerer perfekt

### 3. ✅ SEO-vennlig
- WordPress title brukes i `<title>` tags
- Bedre for søkemotorer
- Standard WordPress-funksjonalitet

### 4. ✅ GraphQL
- Automatisk `title` felt i alle queries
- Mindre kompleks GraphQL-struktur
- Standard WordPress GraphQL pattern

### 5. ✅ Mindre vedlikehold
- Færre ACF-felt å håndtere
- Mindre sannsynlig med bugs
- Enklere å oppdatere

## 🚨 Viktig: Oppdatere eksisterende innhold

Hvis du allerede har Kunder eller Prosjekter med `navn`/`tittel` i ACF:

### Automatisk migrasjon (anbefalt)
```php
// Legg til i functions.php midlertidig
function placy_migrate_titles() {
    // Migrer Kunde
    $kunder = get_posts(['post_type' => 'kunde', 'numberposts' => -1]);
    foreach ($kunder as $kunde) {
        $navn = get_field('navn', $kunde->ID);
        if ($navn && $kunde->post_title === 'Auto Draft') {
            wp_update_post([
                'ID' => $kunde->ID,
                'post_title' => $navn,
            ]);
        }
    }
    
    // Migrer Prosjekt
    $prosjekter = get_posts(['post_type' => 'prosjekt', 'numberposts' => -1]);
    foreach ($prosjekter as $prosjekt) {
        $tittel = get_field('tittel', $prosjekt->ID);
        if ($tittel && $prosjekt->post_title === 'Auto Draft') {
            wp_update_post([
                'ID' => $prosjekt->ID,
                'post_title' => $tittel,
            ]);
        }
    }
}
// Kjør én gang: placy_migrate_titles();
```

### Manuelt (hvis få entries)
1. Gå til **Kunder** → **Alle kunder**
2. Rediger hver kunde
3. Fyll inn WordPress title-feltet med kundenavn
4. Lagre

Gjenta for Prosjekter.

## 📊 Før vs Etter

### Før (inkonsistent):
```
┌─────────────┬──────────────┬─────────────────┐
│ CPT         │ Title Source │ ACF Field       │
├─────────────┼──────────────┼─────────────────┤
│ Kunde       │ ACF          │ navn            │
│ Prosjekt    │ ACF          │ tittel          │
│ Story       │ WordPress    │ -               │
│ POI         │ WordPress    │ -               │
└─────────────┴──────────────┴─────────────────┘
```

### Etter (konsistent):
```
┌─────────────┬──────────────┬─────────────────┐
│ CPT         │ Title Source │ ACF Field       │
├─────────────┼──────────────┼─────────────────┤
│ Kunde       │ WordPress    │ -               │
│ Prosjekt    │ WordPress    │ -               │
│ Story       │ WordPress    │ -               │
│ POI         │ WordPress    │ -               │
└─────────────┴──────────────┴─────────────────┘
```

## 🧪 Testing

### 1. Test ACF Dropdown
```
1. Gå til Stories → Legg til ny
2. I "Prosjekt" dropdown skal du nå se faktiske prosjektnavn
   (ikke "Auto Draft")
```

### 2. Test GraphQL
```graphql
{
  prosjekter {
    nodes {
      title      # ← WordPress title (ikke ACF tittel)
      slug
      prosjektFields {
        beskrivelse
        kunde {
          ... on Kunde {
            title  # ← WordPress title (ikke ACF navn)
          }
        }
      }
    }
  }
}
```

### 3. Test Admin Lists
```
Kunder → Alle kunder
  ✅ Skal vise kundenavn i "Title" kolonnen

Prosjekter → Alle prosjekter
  ✅ Skal vise prosjektnavn i "Prosjekttittel" kolonnen
```

## 📝 Neste steg

1. ✅ Synced functions.php til WordPress
2. ⏳ Refresh WordPress admin (F5/Cmd+R)
3. ⏳ Test Prosjekt dropdown i Story
4. ⏳ Hvis du har eksisterende data, migrer titler
5. ⏳ Oppdater GraphQL queries hvis de bruker ACF `navn`/`tittel`

## 🎓 Best Practice

**Fremover:**
- ✅ Bruk ALLTID WordPress title for hovednavnet på CPT
- ✅ Bruk ACF kun for metadata og tilleggsfelter
- ✅ Hold samme pattern for alle CPT-er
- ❌ IKKE lag ACF-felt for navn/tittel

## 📚 Relaterte filer

- `functions.php` - CPT registrering og ACF fields
- `HIERARCHICAL_URL_STRUCTURE.md` - URL-struktur dokumentasjon
