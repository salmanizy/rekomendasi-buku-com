'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Book, User, ExternalLink, Quote } from 'lucide-react';
import Header from '@/components/ui/header';

export default function PeopleDetail() {
    const params = useParams();
    const [person, setPerson] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.slug) {
            fetchPeopleDetail();
        }
    }, [params?.slug]);

    const fetchPeopleDetail = async () => {
        try {
            const response = await fetch(`/api/people/by-slug/${params.slug}`);
            const data = await response.json();
            setPerson(data.person);
            setBooks(data.books || []);
        } catch (error) {
            console.error('Error fetching person details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Memuat detail...</p>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Orang tidak ditemukan</h2>
                    <Link href="/">
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <Link href="/" className="inline-flex mb-5 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Link>

                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={person.avatar_url} alt={person.name} />
                                <AvatarFallback className="text-2xl">
                                    {person.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
                                <p className="text-muted-foreground leading-relaxed">
                                    {person.bio || 'Tidak ada bio tersedia.'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                            <Card key={book.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
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
                                </CardContent>
                            </Card>
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
    );
}
