import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Book, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import Header from '@/components/ui/header';
import { supabase } from '@/lib/supabase';
import BookCard from '@/components/ui/BookCard';

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

    // Get all recommenders for each book
    const booksWithRecommenders = await Promise.all(
        recommendations?.map(async (r) => {
            if (!r.books?.id) return null;

            // Get all people who recommended this book
            const { data: allRecommendations } = await supabase
                .from('recommendations')
                .select(`
                    people:people_id (
                        id,
                        name,
                        slug,
                        avatar_url
                    )
                `)
                .eq('book_id', r.books.id);

            const recommenders = allRecommendations
                ?.map(rec => rec.people)
                .filter(Boolean) || [];

            return {
                id: r.books.id,
                title: r.books.title,
                author: r.books.author,
                cover_image_url: r.books.cover_image_url,
                tokopedia_url: r.books.tokopedia_url,
                description: r.books.description,
                openlibrary_id: r.books.openlibrary_id,
                quote: r.quote,
                source: r.source,
                recommenders: recommenders
            };
        }) || []
    );

    const books = booksWithRecommenders.filter(Boolean);

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
                            {/* Avatar - Square (aspect-square) */}
                            <div className="relative w-full aspect-square bg-muted">
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
                                <h1 className="font-display text-4xl font-bold text-foreground mb-2 italic">
                                    {person.name}
                                </h1>

                                {/* Bio */}
                                {person.bio && (
                                    <p className="text-md text-muted-foreground leading-relaxed mb-6 px-2">
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
                                        <span className="text-sm font-bold">
                                            {books.length}
                                        </span>
                                        <span className="text-sm font-medium tracking-wide">
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
                                        {books.length} REKOMENDASI BUKU
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
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-4xl font-bold mb-3 text-foreground text-center uppercase">Buku Rekomendasi {person.name}</h2>
                        <p className="text-muted-foreground text-base text-center">
                            {books.length > 0
                                ? `${books.length} rekomendasi buku ditemukan.`
                                : `${person.name} belum merekomendasikan buku apapun`}
                        </p>
                    </div>

                    {books.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} currentPersonId={person.id} currentPersonName={person.name} />
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
                        <p>© {new Date().getFullYear()} Rekobu - Rekomendasi Buku Terpercaya</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
