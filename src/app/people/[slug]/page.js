import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        title: `${person.name} | Rekobu`,
        description: description.slice(0, 160),
        keywords: [person.name, 'rekomendasi buku', 'buku pilihan', ...books.slice(0, 5).map(b => b.title)],
        openGraph: {
            title: `${person.name} - Rekobu`,
            description: description.slice(0, 160),
            images: person.avatar_url ? [{ url: person.avatar_url, alt: person.name }] : [],
            type: 'profile',
            locale: 'id_ID',
            siteName: 'Rekobu',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${person.name} - Rekobu`,
            description: description.slice(0, 160),
            images: person.avatar_url ? [person.avatar_url] : [],
        },
        alternates: {
            canonical: `/people/${params.slug}`,
        },
    };
}

export default async function PeopleProfilePage({ params }) {
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

    // Social links (if available in person data)
    const socialLinks = [];
    if (person.twitter_url) socialLinks.push({ icon: Twitter, url: person.twitter_url, label: 'Twitter' });
    if (person.instagram_url) socialLinks.push({ icon: Instagram, url: person.instagram_url, label: 'Instagram' });
    if (person.linkedin_url) socialLinks.push({ icon: Linkedin, url: person.linkedin_url, label: 'LinkedIn' });
    if (person.website_url) socialLinks.push({ icon: Globe, url: person.website_url, label: 'Website' });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen" style={{ backgroundColor: '#f0ede3' }}>
                <Header />

                <main className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Link href="/" className="inline-flex mb-6 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>

                    {/* Hero/Profile Overview Section */}
                    <section className="mb-12">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-6">
                            {/* Large Avatar */}
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg">
                                <AvatarImage src={person.avatar_url} alt={person.name} />
                                <AvatarFallback className="text-4xl md:text-5xl font-bold bg-gray-200">
                                    {person.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                {/* Name */}
                                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 uppercase tracking-tight mb-3">
                                    {person.name}
                                </h1>

                                {/* Bio */}
                                {person.bio && (
                                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mb-4">
                                        {person.bio}
                                    </p>
                                )}

                                {/* Social Icons */}
                                {socialLinks.length > 0 && (
                                    <div className="flex gap-3 justify-center md:justify-start">
                                        {socialLinks.map(({ icon: Icon, url, label }) => (
                                            <a
                                                key={label}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                                                aria-label={label}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="mt-8 flex justify-center md:justify-start">
                            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200">
                                <div className="text-center">
                                    <span className="block text-3xl md:text-4xl font-bold text-gray-900">
                                        {books.length}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Buku Direkomendasikan
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Divider */}
                    <div className="border-t border-gray-300 mb-10"></div>

                    {/* Recommended Books Section */}
                    <section>
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
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t mt-20">
                    <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                        <p>© 2025 Rekobu - Rekomendasi Buku Terpercaya</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
