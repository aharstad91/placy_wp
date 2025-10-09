# Placy WP - Headless WordPress Project

Modern headless WordPress frontend built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

- **Frontend**: [Coming soon - Deploy to Vercel/Servebolt]
- **WordPress Admin**: [Configure your WordPress backend]

## 📋 Features

✅ Next.js 14 with App Router  
✅ TypeScript for type safety  
✅ Tailwind CSS for styling  
✅ Apollo Client for GraphQL  
✅ Responsive design  
✅ SEO optimized  
✅ GitHub Actions CI/CD ready  

## 🛠️ Local Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/aharstad91/placy_wp.git
   cd placy_wp
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your WordPress GraphQL endpoint
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## 🔧 WordPress Setup

Install these plugins on your WordPress site:

- **WPGraphQL** - Core GraphQL functionality
- **WPGraphQL for Advanced Custom Fields** (optional)
- **Headless Mode** (optional)

Configure GraphQL endpoint: `https://your-wp-site.com/graphql`

## 🚢 Deployment

### Servebolt Hosting

This project is optimized for Servebolt hosting:

1. **WordPress Backend** → Deploy to Servebolt
2. **Next.js Frontend** → Deploy to Vercel or Servebolt

### Environment Variables

Required for production:

```
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=https://your-wp-site.servebolt.cloud/graphql
```

## 📚 Project Structure

```
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable React components  
│   ├── lib/          # Apollo Client & utilities
│   ├── queries/      # GraphQL queries
│   └── types/        # TypeScript definitions
├── .github/
│   └── workflows/    # CI/CD pipelines
└── README.md
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ by [Andreas Harstad](https://github.com/aharstad91)**