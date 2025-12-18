'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Book, User, Twitter, Instagram, Globe } from 'lucide-react';

export default function PersonDetail() {
  const params = useParams();
  const [people, setPeople] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchPeopleDetail();
    }
  }, [params?.id]);

  const fetchPeopleDetail = async () => {
    try {
      const response = await fetch(`/api/people/${params.id}`);
      const data = await response.json();
      setPeople(data.person);
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching people details:', error);
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

  if (!people) {
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
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Person Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={people.avatar_url} alt={people.name} />
                <AvatarFallback className="text-2xl">
                  {people.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Buku Rekomendasi {people.name}</h1>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {people.bio || 'Tidak ada bio tersedia.'}
                </p>

                {/* Social Media Icons */}
                <div className="flex gap-4">
                  {people.social_twitter && (
                    <a
                      href={people.social_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {people.social_instagram && (
                    <a
                      href={people.social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {people.social_website && (
                    <a
                      href={people.social_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Recommended */}
        <Card>
          <CardHeader>
            <CardTitle>Buku yang Direkomendasikan</CardTitle>
            <CardDescription>
              {books.length > 0
                ? `${books.length} buku yang direkomendasikan oleh ${people.name}`
                : `${people.name} belum merekomendasikan buku apapun`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {books.map((book) => (
                  <Link href={`/book/${book.id}`} key={book.id}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="p-4">
                        <div className="aspect-[2/3] relative mb-4 bg-muted rounded-md overflow-hidden">
                          {book.cover_image_url ? (
                            <img
                              src={book.cover_image_url}
                              alt={book.title}
                              className="w-full h-full object-cover"
                              loading='lazy'
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Book className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                          <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2">
                            {book.title}
                          </CardTitle>
                          <Badge
                            variant={book.version === 'imported' ? 'default' : 'secondary'}
                            className="text-[10px] sm:text-xs px-2 py-0.5"
                          >
                            {book.version === 'imported' ? 'EN' : 'ID'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                          {book.author}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Book className="h-16 w-16 mx-auto mb-4" />
                <p>Belum ada rekomendasi buku</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
