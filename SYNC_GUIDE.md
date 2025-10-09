# 🔄 Backend Sync Guide

## Problem
Frontend repo (`/Users/andreasharstad/placy-wp/`) inneholder `functions.php`, men WordPress kjører i MAMP (`/Applications/MAMP/htdocs/placy-wp-backend/`).

Endringer i `functions.php` må synces til WordPress for å fungere.

## Løsning: Sync Scripts

### Manuell Sync (etter hver endring)
```bash
npm run sync:backend
```
eller
```bash
./sync-backend.sh
```

**Brukes når:** Du har gjort endringer i `functions.php` og vil synce til WordPress.

### Automatisk Watch (kontinuerlig syncing)
```bash
npm run watch:backend
```
eller
```bash
./watch-backend.sh
```

**Brukes når:** Du jobber aktivt med `functions.php` og vil at endringer automatisk synces.

**Krav:** `fswatch` må være installert:
```bash
brew install fswatch
```

## Workflow

### Utviklingsworkflow
1. **Start MAMP** og WordPress
2. **Start watch** (i én terminal):
   ```bash
   npm run watch:backend
   ```
3. **Start Next.js** (i annen terminal):
   ```bash
   npm run dev
   ```
4. **Rediger** `functions.php` i din editor
5. **Se endringer** automatisk synces og reflekteres i WordPress

### Commit Workflow
```bash
# 1. Gjør endringer i functions.php
# 2. Sync til WordPress
npm run sync:backend

# 3. Test i WordPress admin at det fungerer
# 4. Commit til Git
git add functions.php
git commit -m "feat: nye ACF felter"
```

## Hva synces?

Scriptet syncer automatisk:
- ✅ `functions.php` (required)
- ✅ `style.css` (hvis den finnes)
- ✅ `screenshot.png` (hvis den finnes)

## Source of Truth

```
📁 /Users/andreasharstad/placy-wp/functions.php
   └── SOURCE OF TRUTH (under versjonskontroll)
   
📁 /Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy/functions.php
   └── KOPI (generert av sync-script)
```

**Viktig:** Gjør ALDRI endringer direkte i MAMP-mappen. Rediger alltid i frontend-repoet og sync.

## Feilsøking

### Script kan ikke kjøres
```bash
chmod +x sync-backend.sh
chmod +x watch-backend.sh
```

### Backend directory ikke funnet
Sjekk at MAMP WordPress er installert i:
```
/Applications/MAMP/htdocs/placy-wp-backend/
```

### Watch fungerer ikke
Installer fswatch:
```bash
brew install fswatch
```

## Produksjon

På produksjon (Servebolt) deployes backend separat:
```bash
npm run deploy:wordpress
```

Dette scriptet (i `deployment/deploy-wp.sh`) håndterer deployment til Servebolt.

---

**Tips:** Legg til sync-script i din commit-hook for å aldri glemme å synce! 🎯
