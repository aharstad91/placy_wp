# 🗺️ POI Bottom Sheet - App Drawer Stil

## ✅ Hva er nytt

Jeg har nå lagt til en **POI Detail Bottom Sheet** (app drawer) som glir opp fra bunnen når du klikker på en markør!

### 🎯 Funksjonalitet:

1. **Klikk på markør** → Modal åpnes med POI-detaljer
2. **Backdrop/overlay** → Mørk bakgrunn bak modalen
3. **Lukkeknapp** → X-knapp for å lukke
4. **Klikk på backdrop** → Lukker også modalen
5. **Google Maps-knapp** → Åpner stedet i Google Maps

### 📋 Modal viser:

- **Ikon** - Emoji-ikon i sirkel
- **Tittel** - POI-navnet
- **Kategori-badge** - Visuell indikator
- **Beskrivelse** - Full tekst
- **Koordinater** - Latitude og Longitude
- **"Åpne i Google Maps"** - Direkte lenke

## 🎨 Design

Modal designet matcher prototypen med:
- ✅ Clean, moderne utseende
- ✅ Avrundede hjørner
- ✅ Skyggeeffekt
- ✅ Responsiv (tilpasser seg skjermstørrelse)
- ✅ Smooth backdrop for fokus
- ✅ Icon + Title kombinasjon
- ✅ Action button nederst

## 🧪 Hvordan teste:

1. **Åpne en story** med POI-er
2. **Klikk på kartområdet** → Fullscreen map åpnes
3. **Klikk på en POI-markør** → Modal vises
4. **Test lukking:**
   - Klikk X-knappen
   - Klikk på backdrop (mørk bakgrunn)
5. **Test Google Maps-knapp** → Åpner i ny fane

## 📱 Responsivt

Modalen tilpasser seg:
- **Desktop** - Sentert modal, max 28rem (448px) bred
- **Mobil** - Tar 90% av bredden, margin på sidene
- **Høyde** - Max 80vh for å unngå scroll-problemer

## 🔧 Teknisk

### Nye states i StorySection:
```tsx
const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
```

### Ny prop til MapboxMap:
```tsx
<MapboxMap 
  pois={section.relatedPois.nodes}
  onPoiClick={(poi) => setSelectedPoi(poi)}
/>
```

### Modal struktur:
- Backdrop (z-index: 15)
- Modal (z-index: 20)
- Absolute posisjonering med transform center

## 🎨 Styling detaljer

### Farger:
- **Primary** - Emerald/Grønn (`emerald-500`)
- **Badge** - Emerald-100 background
- **Backdrop** - Black med 30% opacity
- **Text** - Gray scale for hierarki

### Spacing:
- Modal padding: `p-6`
- Max height: `80vh`
- Max width: `28rem` (448px)
- Border radius: `rounded-2xl`

## 💡 Fremtidige forbedringer (valgfritt)

1. **Bildegalleri** - Legg til bilder i POI-modalen
2. **Åpningstider** - Hvis relevant for POI
3. **Rating/Reviews** - Vurderinger fra brukere
4. **Directions** - Rute fra brukerens posisjon
5. **Share-knapp** - Del POI på sosiale medier
6. **Animation** - Fade in/out animasjon ved åpning/lukking

## ✨ Status: Ferdig!

Modal-funksjonaliteten er nå komplett og klar til bruk! 🎉

Refresh browseren (`Cmd+R` / `F5`) for å se den nye funksjonaliteten.
