# Placy WP - Modern Headless WordPress

Et moderne headless WordPress-prosjekt bygget med Next.js 14, TypeScript, Tailwind CSS og GraphQL.

## ✨ Funksjoner

- 🚀 **Next.js 14** med App Router
- 📝 **TypeScript** for type-sikkerhet
- 🎨 **Tailwind CSS** for moderne styling
- 🔗 **GraphQL** integration med WordPress
- 📱 **Responsive design**
- ⚡ **Server-side rendering** og static generation
- 🔍 **SEO-optimalisert**

## 🛠️ Teknologier

### Frontend
- **Next.js 14** - React framework med SSR/SSG
- **TypeScript** - Type-sikker JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client

### Backend (WordPress)
- **WordPress** som headless CMS
- **WPGraphQL** plugin for GraphQL API
- **Advanced Custom Fields** (valgfritt)

## 🚀 Komme i gang

### 1. Klon prosjektet

\`\`\`bash
git clone https://github.com/aharstad91/placy_wp.git
cd placy_wp
\`\`\`

### 2. Installer avhengigheter

\`\`\`bash
npm install
\`\`\`

### 3. Konfigurer miljøvariabler

Kopier \`.env.local.example\` til \`.env.local\`:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Rediger \`.env.local\` og legg til ditt WordPress GraphQL-endepunkt:

\`\`\`
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=https://your-wp-site.servebolt.cloud/graphql
\`\`\`

### 4. Installer WordPress plugins

På din WordPress-side, installer følgende plugins:

- **WPGraphQL** - Gir GraphQL API
- **WPGraphQL for Advanced Custom Fields** (valgfritt)
- **Headless Mode** (valgfritt - skjuler frontend)

### 5. Start utviklingsserver

\`\`\`bash
npm run dev
\`\`\`

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## 📁 Prosjektstruktur

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Hovedside
│   └── posts/            # Innlegg-sider
├── components/            # Gjenbrukbare komponenter
│   ├── Navigation.tsx    # Navigasjonskomponent
│   └── PostCard.tsx      # Innlegg-kort
├── lib/                   # Utilities og konfigurasjoner
│   └── apollo-wrapper.tsx # Apollo Client setup
├── queries/               # GraphQL queries
│   └── wordpress.ts      # WordPress-spørringer
└── types/                # TypeScript type definisjoner
    └── wordpress.ts      # WordPress-typer
\`\`\`

## 🔧 Konfigurasjoner

### WordPress GraphQL Schema

Prosjektet forventer at WordPress har følgende GraphQL-schema tilgjengelig:

- **Posts** med kategorier, forfatter og featured image
- **Pages** med featured image
- **Menus** for navigasjon
- **Site settings** (tittel, beskrivelse, URL)

### Tailwind CSS

Tailwind er konfigurert med:
- Responsivt design
- Dark mode support
- Custom farger og spacing

### TypeScript

Streng TypeScript-konfigurasjon med:
- Path mapping (@/* -> src/*)
- Strenge type-sjekker
- Next.js plugin support

## 🚢 Deployment

### Servebolt Hosting

1. **WordPress Backend:**
   - Deploy WordPress til Servebolt
   - Installer nødvendige plugins
   - Konfigurer GraphQL-endepunkt

2. **Next.js Frontend:**
   - Deploy til Vercel, Netlify, eller Servebolt
   - Sett miljøvariabler
   - Konfigurer custom domain

### Vercel (anbefalt for frontend)

\`\`\`bash
# Deploy til Vercel
vercel

# Eller med GitHub integration
git push origin main
\`\`\`

## 📚 Utvikling

### Legg til nye komponenter

\`\`\`bash
# Opprett ny komponent
touch src/components/NewComponent.tsx
\`\`\`

### Legg til nye GraphQL queries

\`\`\`bash
# Opprett ny query fil
touch src/queries/custom.ts
\`\`\`

### Code generation (valgfritt)

For automatisk TypeScript type-generering fra GraphQL schema:

\`\`\`bash
npm run codegen
\`\`\`

## 🤝 Bidrag

1. Fork prosjektet
2. Opprett en feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit dine endringer (\`git commit -m 'Add some AmazingFeature'\`)
4. Push til branchen (\`git push origin feature/AmazingFeature\`)
5. Åpne en Pull Request

## 📄 Lisens

Dette prosjektet er lisensiert under MIT License.

## 💬 Support

For spørsmål eller support, kontakt [Andreas Harstad](https://github.com/aharstad91).

---

**Laget med ❤️ for moderne WordPress-utvikling**