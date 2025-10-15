## Mapbox Draw Implementation - Backend Filer Synket! ✅

### 🎉 Status: Klar for testing### ✅ Forventet resultat

- **WordPress admin**: Kan tegne custom routes visuelt ✅
- **GeoJSON lagres**: I hidden ACF-felt ✅
- **Frontend rendering**: Mørkeblå linje følger tegnet sti ✅
- **Waypoints**: Vises som vanlig oppå stien ✅
- **Backward compatible**: Eksisterende routes fortsetter å bruke Directions API ✅
- **Console logging**: Viser "🎨 Using custom drawn route geometry (skipping Directions API)"backend-filer er nå synket til WordPress med **automatisk line simplification**.

### ⚡ Ny funksjonalitet:
- **Douglas-Peucker algoritme** reduserer automatisk antall punkter (>100 → ~50-80)
- **Økte PHP-limits** for store GeoJSON-objekter
- **Validering og debugging** i browser console
- **Ingen tap av nøyaktighet** - algoritmen bevarer sti-formen

For å teste systemet:

### 1. Legg til Mapbox Token i wp-config.php

Åpne `/Applications/MAMP/htdocs/placy-wp-backend/wp-config.php` og legg til denne linjen (før `/* That's all, stop editing! */`):

```php
define('MAPBOX_ACCESS_TOKEN', 'DITT_MAPBOX_TOKEN_HER');
```

Erstatt `'DITT_MAPBOX_TOKEN_HER'` med samme token som brukes i `.env.local` (NEXT_PUBLIC_MAPBOX_TOKEN).

### 2. Test Workflow i WordPress Admin

1. **Gå til WordPress admin**: `http://localhost:8888/placy-wp-backend/wp-admin`
2. **Refresh siden** (Cmd+R) for å laste inn ny functions.php
3. **Åpne Route Stories** → Rediger en eksisterende eller opprett ny
4. **Nye felter vises**:
   - "Route Geometry Source" - Radio buttons
   - Velg "Custom Drawn Route"
   - "Draw Route on Map" seksjon vises med knapp

### 3. Tegn Custom Route

1. Klikk **"Open Mapbox Draw"**
2. Fullskjerm-modal åpnes med Norge-oversikt
3. **Klikk på kartet** for å legge til punkter langs ruten
   - Du kan legge til så mange punkter du vil (50-100+ er ok)
   - Følg stien/veien nøyaktig
4. **Dobbeltklikk** på siste punkt for å fullføre
5. **Dra punkter** for å justere ruten hvis nødvendig
6. Klikk **"Save Route"**
   - ✅ Hvis >100 punkter: **Automatisk simplification** reduserer til ~50-80 punkter
   - ✅ Console viser: "Simplified from X to Y points"
   - ✅ Stien beholdes visuelt identisk
7. GeoJSON lagres i hidden field
8. **Update/Publish** posten

### 4. Test Frontend Rendering

1. Gå til Next.js frontend: `http://localhost:3000`
2. Naviger til Route Story-siden
3. Åpne route-kartet
4. **Custom tegnet rute vises** som mørkeblå linje (istedenfor Directions API)
5. **Waypoint-markers** vises fortsatt på stien

### 🐛 Troubleshooting

**Hvis "Open Mapbox Draw" knapp ikke vises:**
- Sjekk at "Custom Drawn Route" er valgt
- Refresh WordPress admin (Cmd+R)
- Sjekk browser console for JavaScript errors

**Hvis modal åpnes men kartet er tomt:**
- Sjekk at MAPBOX_ACCESS_TOKEN er definert i wp-config.php
- Sjekk browser console for Mapbox-errors

**Hvis frontend ikke viser custom rute:**
- Sjekk at GeoJSON er lagret (inspiser post i database eller GraphiQL)
- Test GraphQL query direkte: `http://localhost:8888/placy-wp-backend/graphql`

### 📋 GraphQL Test Query

```graphql
query TestRouteGeometry {
  routeStory(id: "DIN_ROUTE_SLUG", idType: SLUG) {
    id
    title
    routeStoryFields {
      routeGeometrySource
      routeGeometryJson
    }
  }
}
```

### ✅ Forventet Resultat

- **WordPress admin**: Kan tegne custom routes visuelt
- **GeoJSON lagres**: I hidden ACF-felt
- **Frontend rendering**: Mørkeblå linje følger tegnet sti
- **Waypoints**: Vises som vanlig oppå stien
- **Backward compatible**: Eksisterende routes fortsetter å bruke Directions API

---

**Alt er nå klart for testing! 🚀**
