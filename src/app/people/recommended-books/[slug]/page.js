import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, ExternalLink, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import Header from '@/components/ui/header';
import { supabase } from '@/lib/supabase';

// Fetch person data by slug
async function getPersonBySlug(slug) {
    const { data: person, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('slug', slug)
        .single();

    if (personError || !person) {
        return null;
    }

    // Get books recommended by this person
    const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select(`
      book_id,
      quote,
      source,
      books:book_id (
        id,
        title,
        author,
        cover_image_url,
        tokopedia_url,
        description,
        openlibrary_id
      )
    `)
        .eq('people_id', person.id);

    const books = recommendations?.map(r => ({
        id: r.books?.id,
        title: r.books?.title,
        author: r.books?.author,
        cover_image_url: r.books?.cover_image_url,
        tokopedia_url: r.books?.tokopedia_url,
        description: r.books?.description,
        openlibrary_id: r.books?.openlibrary_id,
        quote: r.quote,
        source: r.source
    })).filter(book => book.id) || [];

    return { person, books };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
    const data = await getPersonBySlug(params.slug);

    if (!data) {
        return {
            title: 'Orang tidak ditemukan | Rekobu',
            description: 'Halaman yang Anda cari tidak ditemukan.',
        };
    }

    const { person, books } = data;
    const bookCount = books.length;
    const description = person.bio
        ? `${person.bio} Temukan ${bookCount} buku yang direkomendasikan oleh ${person.name}.`
        : `Temukan ${bookCount} buku yang direkomendasikan oleh ${person.name}. Lihat daftar buku pilihan dari tokoh inspiratif ini.`;

    return {
        title: `Buku Rekomendasi ${person.name} | Rekobu`,
        description: description.slice(0, 160),
        keywords: [person.name, 'rekomendasi buku', 'buku pilihan', ...books.slice(0, 5).map(b => b.title)],
        openGraph: {
            title: `Buku Rekomendasi ${person.name}`,
            description: description.slice(0, 160),
            images: person.avatar_url ? [{ url: person.avatar_url, alt: person.name }] : [],
            type: 'profile',
            locale: 'id_ID',
            siteName: 'Rekobu',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Buku Rekomendasi ${person.name}`,
            description: description.slice(0, 160),
            images: person.avatar_url ? [person.avatar_url] : [],
        },
        alternates: {
            canonical: `/people/recommended-books/${params.slug}`,
        },
    };
}

export default async function PeopleDetail({ params }) {
    const data = await getPersonBySlug(params.slug);

    if (!data) {
        notFound();
    }

    const { person, books } = data;

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': 'Person',
            name: person.name,
            description: person.bio,
            image: person.avatar_url,
        },
        about: {
            '@type': 'ItemList',
            name: `Buku yang Direkomendasikan oleh ${person.name}`,
            numberOfItems: books.length,
            itemListElement: books.map((book, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Book',
                    name: book.title,
                    author: {
                        '@type': 'Person',
                        name: book.author,
                    },
                    image: book.cover_image_url,
                    description: book.quote || book.description,
                },
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-background">
                <Header />

                {/* Hero Section - Epic People Overview */}
                <div className="relative bg-gradient-to-br from-background via-background to-muted/20 border-b">
                    {/* Mobile Layout - Full Screen Card */}
                    <div className="md:hidden">
                        {/* Back Button - Positioned absolutely */}
                        <div className="absolute top-4 left-4 z-20">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-background transition-colors shadow-lg">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>

                        <div className="bg-card overflow-hidden">
                            {/* Avatar - Full Width and Height */}
                            <div className="relative w-full h-[500px] bg-muted">
                                {person.avatar_url ? (
                                    <img
                                        src={person.avatar_url}
                                        alt={person.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-9xl font-bold text-muted-foreground">
                                            {person.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-6 text-center">
                                {/* Name - Italic */}
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2 italic">
                                    {person.name}
                                </h1>

                                {/* Bio */}
                                {person.bio && (
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 px-2">
                                        {person.bio}
                                    </p>
                                )}

                                {/* Social Links */}
                                {(person.twitter_url || person.instagram_url || person.linkedin_url || person.website_url) && (
                                    <div className="flex justify-center gap-3 mb-6">
                                        {person.twitter_url && (
                                            <a
                                                href={person.twitter_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                                aria-label="Twitter"
                                            >
                                                <Twitter className="h-4 w-4 text-foreground" />
                                            </a>
                                        )}
                                        {person.instagram_url && (
                                            <a
                                                href={person.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                                aria-label="Instagram"
                                            >
                                                <Instagram className="h-4 w-4 text-foreground" />
                                            </a>
                                        )}
                                        {person.linkedin_url && (
                                            <a
                                                href={person.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                                aria-label="LinkedIn"
                                            >
                                                <Linkedin className="h-4 w-4 text-foreground" />
                                            </a>
                                        )}
                                        {person.website_url && (
                                            <a
                                                href={person.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                                aria-label="Website"
                                            >
                                                <Globe className="h-4 w-4 text-foreground" />
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Stats - Book Count as Badge */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background">
                                        <span className="text-2xl font-bold">
                                            {books.length}
                                        </span>
                                        <span className="text-xs font-medium uppercase tracking-wide">
                                            Rekomendasi Buku
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:block">
                        <div className="container mx-auto px-4 py-16 md:py-24">
                            <Link href="/" className="inline-flex mb-8 md:mb-12 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                            <div className="flex gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
                                {/* Left side - Text content */}
                                <div className="flex-1">
                                    {/* Subtitle */}
                                    <p className="text-sm font-medium text-muted-foreground tracking-[0.2em] mb-4 uppercase">
                                        Rekomendasi Buku
                                    </p>

                                    {/* Name - Extra large and dramatic */}
                                    <h1 className="font-display text-7xl lg:text-8xl xl:text-9xl font-bold text-foreground leading-[0.9] tracking-tighter italic mb-8">
                                        {person.name?.split(' ').map((word, i) => (
                                            <span key={i} className="block">{word}</span>
                                        ))}
                                    </h1>

                                    {/* Bio */}
                                    {person.bio && (
                                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
                                            {person.bio}
                                        </p>
                                    )}

                                    {/* Stats Badge */}
                                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold tracking-wide">
                                        <span className="w-2 h-2 rounded-full bg-background/60 animate-pulse"></span>
                                        {books.length} BUKU DIREKOMENDASIKAN
                                    </div>
                                </div>

                                {/* Right side - Avatar with dramatic styling */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        {/* Decorative background element */}
                                        <div className="absolute -inset-4 bg-gradient-to-br from-muted/40 to-muted/10 rounded-full blur-2xl"></div>

                                        {/* Avatar */}
                                        <div className="relative w-56 h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full overflow-hidden border-4 border-background shadow-2xl ring-8 ring-muted/30">
                                            {person.avatar_url ? (
                                                <img
                                                    src={person.avatar_url}
                                                    alt={person.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center text-6xl font-bold text-muted-foreground">
                                                    {person.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="container mx-auto px-4 py-12">

                    {/* Books Recommended */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Buku yang Direkomendasikan</h2>
                        <p className="text-muted-foreground">
                            {books.length > 0
                                ? `${books.length} buku yang direkomendasikan oleh ${person.name}`
                                : `${person.name} belum merekomendasikan buku apapun`}
                        </p>
                    </div>

                    {books.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map((book) => (
                                <div
                                    key={book.id}
                                    className="bg-white border border-gray-200 p-6 hover:border-gray-400 transition-colors"
                                >
                                    <div className="flex gap-4 mb-4">
                                        {/* Book Cover */}
                                        <Link href={`/book/${book.id}`} className="flex-shrink-0">
                                            <div className="w-24 h-36 bg-muted rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                                                {book.cover_image_url ? (
                                                    <img
                                                        src={book.cover_image_url}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Book className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Book Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/book/${book.id}`}>
                                                <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-2">
                                                    {book.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

                                            <div className="mb-3">
                                                {book.quote ? (
                                                    <>
                                                        <div className="flex gap-2 mb-2 bg-muted/80 rounded-r-md">
                                                            <p className="text-sm border-l-2 border-gray-500 pl-2 py-3 pr-2 italic text-gray-500 leading-relaxed">
                                                                &quot;{book.quote}&quot;
                                                            </p>
                                                        </div>

                                                        {book.source && (
                                                            <div className="pt-3 flex justify-start">
                                                                <a
                                                                    href={book.source}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    Lihat Sumber
                                                                </a>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex gap-2 mb-2 bg-muted/80 rounded-r-md">
                                                        <p className="text-sm border-l-2 border-gray-500 pl-2 py-3 pr-2 italic text-gray-500 leading-relaxed">
                                                            &quot;&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='border-t'>
                                        {book.tokopedia_url && (
                                            <Button className="w-full mt-5" asChild>
                                                <a href={book.tokopedia_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Beli di Tokopedia
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Book className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mb-2">Belum ada rekomendasi buku</h3>
                            <p className="text-muted-foreground">
                                {person.name} belum merekomendasikan buku apapun
                            </p>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="border-t mt-20">
                    <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                        <p>© 2024 Rekobu - Rekomendasi Buku Terpercaya</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
