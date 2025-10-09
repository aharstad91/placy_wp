# Rask Start - Lokal Utvikling 🚀

## 🎯 MAMP Setup (Anbefalt - 10 minutter)

### 1. Start MAMP
- Åpne MAMP applikasjonen
- Klikk "Start Servers" (Apache + MySQL)
- Verifiser at serverene kjører på standardporter

### 2. Last ned WordPress
```bash
cd /Applications/MAMP/htdocs
curl -O https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress placy-wp-backend
rm latest.zip
```

### 3. Opprett database
- Gå til: http://localhost:8888/phpMyAdmin
- Klikk "New" → opprett database: `placy_wp_local`

### 4. Installer WordPress
- Gå til: http://localhost:8888/placy-wp-backend
- Følg installasjonsguiden med disse innstillingene:
  ```
  Database navn: placy_wp_local
  Brukernavn: root
  Passord: root
  Database host: localhost:8889
  Tabell prefix: wp_
  ```

### 5. Installer plugins automatisk
```bash
# Fra placy-wp mappen:
./setup-wordpress.sh
```

### 6. Test oppsettet
- WordPress admin: http://localhost:8888/placy-wp-backend/wp-admin
- GraphQL endpoint: http://localhost:8888/placy-wp-backend/graphql
- Frontend: http://localhost:3000 (npm run dev)

---

## 🐳 Docker Setup (Alternativ - 5 minutter)

### 1. Start Docker containers
```bash
docker-compose up -d
```

### 2. Installer WordPress
- Gå til: http://localhost:8080
- Følg installasjonsguiden:
  ```
  Database navn: placy_wp_local
  Brukernavn: wordpress
  Passord: wordpress123
  Database host: db
  ```

### 3. Installer plugins
```bash
./setup-wordpress.sh
```

### 4. Test oppsettet
- WordPress admin: http://localhost:8080/wp-admin
- phpMyAdmin: http://localhost:8081
- GraphQL endpoint: http://localhost:8080/graphql
- Frontend: http://localhost:3000

---

## ✅ Verifiser at alt fungerer

1. **WordPress admin** - Publiser et testinnlegg
2. **GraphQL** - Test endpoint i nettleser (skal vise GraphQL schema)
3. **Frontend** - Start `npm run dev` og gå til http://localhost:3000/posts

## 🔧 Feilsøking

**GraphQL viser ikke data?**
- Sjekk at WPGraphQL plugin er aktivert
- Verifiser endpoint-URL i `.env.local`
- Publiser minst ett innlegg i WordPress

**CORS feil?**
- Legg til CORS headers i WordPress `wp-config.php`
- Se full guide i `LOKAL_SETUP.md`

---

**🎉 Ferdig! Du har nå en fungerende headless WordPress setup lokalt.**