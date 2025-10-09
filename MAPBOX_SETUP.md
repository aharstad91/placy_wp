# 🗺️ Mapbox Integration Guide

## ✅ Hva er implementert

Jeg har nå implementert full Mapbox-integrasjon i Placy WP-prosjektet, basert på designet og interaksjonen fra prototypen.

### 📦 Nye komponenter og filer:

1. **MapboxMap.tsx** - Hovedkomponenten for Mapbox-kartet
2. **Oppdatert StorySection.tsx** - Inkluderer fullscreen modal med kart
3. **Oppdatert functions.php** - Nye ACF-felter for POI (kategori, ikon)
4. **Oppdaterte TypeScript types** - POI-interface med nye felter
5. **Oppdaterte GraphQL queries** - Henter kategori og ikon-data

### 🎨 Designfunksjoner (fra prototypen):

- ✅ Kart aktiveres i fullskjerm overlay ved klikk
- ✅ POI-markører med custom styling (grønne pins)
- ✅ Emoji-ikoner på markørene
- ✅ Popup-informasjon ved klikk på markør
- ✅ Kategori-filterknapper nederst på kartet
- ✅ Lukkeknapp (X) for å lukke kartvisningen
- ✅ Automatisk zoom/fit bounds for å vise alle POIs

## 🚀 Slik kommer du i gang

### 1. Få Mapbox Access Token

1. Gå til [Mapbox](https://www.mapbox.com/)
2. Opprett gratis konto (eller logg inn)
3. Gå til [Account > Access tokens](https://account.mapbox.com/access-tokens/)
4. Opprett en ny token eller kopier default public token

### 2. Legg til token i .env.local

Opprett eller oppdater `.env.local` filen i rot-mappen:

```bash
# WordPress GraphQL
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8888/placy-wp-backend/graphql

# Mapbox Token (Viktig!)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLXRva2VuIn0...
```

⚠️ **VIKTIG:** Uten token vil kartet ikke fungere!

### 3. Refresh WordPress admin

Siden `functions.php` er oppdatert med nye ACF-felter, må du:

1. Åpne WordPress admin: http://localhost:8888/placy-wp-backend/wp-admin
2. Refresh siden (F5 / Cmd+R)
3. De nye feltene (kategori, ikon) skal nå være synlige i POI-editoren

### 4. Opprett test-POI-er

Gå til WordPress admin og opprett noen test-POI-er:

**Eksempel 1: Ranheim IL**
- Tittel: Ranheim IL
- Beskrivelse: Idrettsanlegg med fotball og andre aktiviteter
- Kategori: idrett
- Ikon: ⚽
- Latitude: 63.4305
- Longitude: 10.3951

**Eksempel 2: Atletklubb**
- Tittel: Atletklubb Trondheim
- Beskrivelse: Friidrett og løping for alle nivåer
- Kategori: idrett
- Ikon: 🏃
- Latitude: 63.4380
- Longitude: 10.4100

**Eksempel 3: Svømmehall**
- Tittel: Pirbadet Svømmehall
- Beskrivelse: Moderne svømmeanlegg med basseng og spa
- Kategori: idrett
- Ikon: 🏊
- Latitude: 63.4370
- Longitude: 10.3980

**Eksempel 4: NTNUI**
- Tittel: NTNUI Aktiviteter
- Beskrivelse: Studentidrett med mange ulike tilbud
- Kategori: idrett
- Ikon: 🎯
- Latitude: 63.4350
- Longitude: 10.4020

### 5. Koble POI-er til Story-seksjon

1. Åpne en Story i WordPress (eller opprett ny)
2. Legg til en seksjon med "Flexible Content"
3. Velg seksjontype: **story_section_layout**
4. Fyll ut:
   - **Section ID:** idrett-trening
   - **Icon:** ⚽
   - **Title:** Idrett & trening
   - **Description:** Et rikt utvalg av trenings- og aktivitetstilbud...
   - **Map Type:** idrett
   - **Show Map:** Ja ☑️
   - **Related POIs:** Velg de 4 POI-ene du opprettet
5. Publiser Story

### 6. Start dev server og test

```bash
npm run dev
```

Åpne: http://localhost:3000/stories/din-story-slug

### 7. Test interaksjonen

1. ✅ Klikk på kartområdet → Skal åpne fullscreen modal
2. ✅ Sjekk at POI-markører vises på kartet
3. ✅ Klikk på en markør → Skal vise popup med info
4. ✅ Klikk på kategori-knappene nederst → (Kan implementere filtering senere)
5. ✅ Klikk på X-knappen → Skal lukke kartet

## 🎨 Styling og tilpasning

### Marker-farger

I `MapboxMap.tsx`, linje ~70:

```typescript
el.style.cssText = `
  background-color: #10b981; // Endre farge her (grønn nå)
  ...
`
```

### Kartstil

I `MapboxMap.tsx`, linje ~40:

```typescript
style: 'mapbox://styles/mapbox/light-v11', // Kan endre til:
// 'mapbox://styles/mapbox/streets-v12'
// 'mapbox://styles/mapbox/outdoors-v12'
// 'mapbox://styles/mapbox/dark-v11'
// 'mapbox://styles/mapbox/satellite-v9'
```

### Standard senter-koordinater

I `MapboxMap.tsx`, linje ~10:

```typescript
center = [10.3951, 63.4305], // [longitude, latitude] - Ranheim/Trondheim
```

## 🐛 Feilsøking

### Kartet vises ikke

1. ✅ Sjekk at `NEXT_PUBLIC_MAPBOX_TOKEN` er satt i `.env.local`
2. ✅ Restart dev server etter å ha lagt til token
3. ✅ Sjekk browser console for feilmeldinger

### POI-er vises ikke på kartet

1. ✅ Sjekk at POI-ene har latitude og longitude
2. ✅ Sjekk at POI-ene er koblet til seksjonen i WordPress
3. ✅ Sjekk GraphQL-query i browser network tab

### Kartet er tomt/hvitt

1. ✅ Sjekk at Mapbox token er gyldig
2. ✅ Sjekk at du har internettilkobling (Mapbox krever det)
3. ✅ Åpne browser console og se etter feilmeldinger

### Popup vises ikke

1. ✅ Sjekk at POI har beskrivelse-felt
2. ✅ Klikk direkte på markøren (ikke ved siden av)

## 📝 Neste steg (valgfritt)

1. **Kategori-filtering:** Implementere logikk for å filtrere POIs basert på kategori-knappene
2. **Custom map styles:** Lage egen Mapbox-stil i Mapbox Studio
3. **Cluster markers:** Hvis mange POIs, gruppere nærliggende markører
4. **Directions:** Legge til rute-funksjonalitet fra brukerens lokasjon
5. **3D terrain:** Enable 3D-terreng for mer visuell effekt

## 🔗 Nyttige lenker

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Mapbox Studio](https://studio.mapbox.com/) - Lag custom map styles
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/) - Kode-eksempler

## ✨ Gratulerer!

Du har nå et fullt fungerende Mapbox-kart som viser POI-er fra WordPress! 🎉
