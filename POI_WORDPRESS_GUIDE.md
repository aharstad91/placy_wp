# 📍 POI WordPress Setup Guide

## Steg 1: Gå til POI-administrasjon

I WordPress admin sidebar:
- Klikk på **POI (Steder)**
- Klikk på **Legg til POI**

## Steg 2: Fyll ut POI-feltene

### Tittel
```
Ranheim IL
```

### POI Informasjon (ACF Fields)

#### Beskrivelse
```
Idrettsanlegg med fotball og andre aktiviteter. Extra Arena tilbyr moderne fasiliteter for både trening og kamper.
```

#### Kategori
```
idrett
```
*Andre eksempler: natur, handel, transport, kafé*

#### Ikon (emoji)
```
⚽
```
*Kopier emoji direkte inn i feltet. Andre eksempler: 🏃 🏊 🌲 🚌 ☕*

#### Latitude (Breddegrad)
```
63.4305
```

#### Longitude (Lengdegrad)
```
10.3951
```

### 💡 Slik finner du koordinater:

**Metode 1: Google Maps**
1. Gå til [Google Maps](https://maps.google.com)
2. Søk etter stedet (f.eks. "Ranheim IL, Trondheim")
3. Høyreklikk på stedet på kartet
4. Velg koordinatene (de kopieres automatisk)
5. Koordinatene kommer i format: `63.4305, 10.3951`
   - Første tall = Latitude (breddegrad)
   - Andre tall = Longitude (lengdegrad)

**Metode 2: Mapbox Geocoding**
1. Gå til [Mapbox Geocoding API Playground](https://docs.mapbox.com/playground/geocoding/)
2. Søk etter adressen
3. Kopier koordinatene fra resultatene

## Steg 3: Publiser POI

Klikk på **Publiser** knappen oppe til høyre.

## Steg 4: Opprett flere POI-er

Gjenta prosessen for alle POI-ene du ønsker på kartet.

### Eksempel POI-er for "Idrett & trening" seksjon:

#### 1. Ranheim IL ⚽
- Kategori: `idrett`
- Latitude: `63.4305`
- Longitude: `10.3951`

#### 2. Atletklubb Trondheim 🏃
- Kategori: `idrett`
- Latitude: `63.4380`
- Longitude: `10.4100`

#### 3. Pirbadet Svømmehall 🏊
- Kategori: `idrett`
- Latitude: `63.4370`
- Longitude: `10.3980`

#### 4. NTNUI 🎯
- Kategori: `idrett`
- Latitude: `63.4350`
- Longitude: `10.4020`

## Steg 5: Koble POI-er til Story

1. Gå til **Stories** i WordPress admin
2. Åpne eller opprett en Story
3. Scroll ned til **Story Sections** (Flexible Content)
4. Legg til ny seksjon eller rediger eksisterende
5. I **Related POIs** feltet:
   - Klikk på **+ Add Row**
   - Søk og velg POI-ene du opprettet
   - Rekkefølgen bestemmer rekkefølgen på knappene
6. Huk av for **Show Map** ☑️
7. Velg **Map Type** (f.eks. "idrett")
8. Publiser Story

## 🎯 Tips og triks

### Emoji-ikoner
Kopier emojis fra [Emojipedia](https://emojipedia.org/) eller bruk:
- ⚽ Fotball
- 🏃 Løping
- 🏊 Svømming
- 🎯 Aktiviteter
- 🌲 Natur
- 🚌 Transport
- ☕ Kafé
- 🏪 Butikk
- 🏥 Helse
- 🎓 Skole

### Kategorier
Bruk konsistente kategorinavn:
- `idrett` - for alle idrettsrelaterte POIs
- `natur` - for turområder, parker, etc.
- `handel` - for butikker og handel
- `transport` - for bussholdeplasser, etc.
- `kafe` - for kafeer og restauranter
- `oppvekst` - for skoler og barnehager

Dette gjør det lettere å filtrere senere!

### Koordinat-tips
- Latitude (breddegrad): Nord/Sør posisjon (63.xxx for Trondheim)
- Longitude (lengdegrad): Øst/Vest posisjon (10.xxx for Trondheim)
- Trondheim sentrum: ca. `63.4305, 10.3951`
- Ranheim: ca. `63.43, 10.52`

## ✅ Sjekkliste

- [ ] Opprettet minst 3-4 POI-er
- [ ] Alle POI-er har latitude og longitude
- [ ] Alle POI-er har beskrivelse
- [ ] Alle POI-er har emoji-ikon
- [ ] POI-ene er koblet til en Story-seksjon
- [ ] "Show Map" er huket av i seksjonen
- [ ] Story er publisert
- [ ] Testet at kartet vises i frontend

## 🚀 Neste steg

Når POI-ene er opprettet, gå til `MAPBOX_SETUP.md` for å:
1. Sette opp Mapbox token
2. Teste kartet i frontend
3. Se hvordan POI-ene vises på kartet

Lykke til! 🎉
