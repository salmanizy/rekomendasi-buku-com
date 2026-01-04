# Rekobu - Rekomendasi Buku Indonesia

A curated book recommendation platform that lets you discover books recommended by influential people, entrepreneurs, writers, creators, and public figures.

## Features

- **Book Discovery** - Browse and search through a curated collection of book recommendations
- **Recommender Profiles** - Explore books recommended by specific people (entrepreneurs, authors, creators, politicians)
- **Smart Search** - Search across books, authors, and recommenders from a unified search bar
- **Recommendation Showcase** - Dynamic carousel highlighting featured book recommendations on the homepage
- **Book Details** - View detailed information about each book including who recommends it
- **Admin Panel** - Manage books, people, and recommendations through an authenticated admin interface
- **SEO Optimized** - Dynamic metadata, structured data (JSON-LD), and sitemap generation

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account with database configured

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   ├── book/               # Book pages
│   ├── login/              # Authentication
│   ├── people/             # Recommender profiles
│   └── page.js             # Homepage
├── components/ui/          # Reusable UI components
├── hooks/                  # Custom React hooks
└── lib/                    # Utility functions & Supabase client
```

## Database Schema

The app uses a relational structure in Supabase:

- **books** - Book information (title, author, cover, description)
- **people** - Recommenders (name, bio, avatar)
- **recommendations** - Links books to people with quotes and sources
- **users** - Authentication for admin access

## Deploy

Deploy easily on [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
