'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Book, User } from 'lucide-react';

export default function PersonDetail() {
  const params = useParams();
  const [person, setPerson] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchPersonDetail();
    }
  }, [params?.id]);

  const fetchPersonDetail = async () => {
    try {
      const response = await fetch(`/api/people/${params.id}`);
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
        <Card>
          <CardHeader>
            <CardTitle>Buku yang Direkomendasikan</CardTitle>
            <CardDescription>
              {books.length > 0
                ? `${books.length} buku yang direkomendasikan oleh ${person.name}`
                : `${person.name} belum merekomendasikan buku apapun`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Book className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                          <Badge variant={book.version === 'imported' ? 'default' : 'secondary'}>
                            {book.version === 'imported' ? 'EN' : 'ID'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-1">{book.author}</CardDescription>
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
