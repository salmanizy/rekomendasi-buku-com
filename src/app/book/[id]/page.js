'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Book, ExternalLink, User } from 'lucide-react';

export default function BookDetail() {
  const params = useParams();
  const [book, setBook] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchBookDetail();
    }
  }, [params?.id]);

  const fetchBookDetail = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`);
      const data = await response.json();
      setBook(data.book);
      setPeople(data.people || []);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat detail buku...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Buku tidak ditemukan</h2>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-[2/3] relative mb-4 bg-muted rounded-md overflow-hidden">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Badge variant={book.version === 'imported' ? 'default' : 'secondary'} className="mb-2">
                      {book.version === 'imported' ? 'English (Imported)' : 'Indonesian (Terjemahan)'}
                    </Badge>
                    <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
                    <p className="text-muted-foreground">oleh {book.author}</p>
                  </div>
                  
                  {book.tokopedia_url && (
                    <Button className="w-full" asChild>
                      <a href={book.tokopedia_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Beli di Tokopedia
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Description and Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Tentang Buku</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description || 'Tidak ada deskripsi tersedia.'}
                </p>
              </CardContent>
            </Card>

            {/* People who recommend this book */}
            <Card>
              <CardHeader>
                <CardTitle>Direkomendasi Oleh</CardTitle>
                <CardDescription>
                  {people.length > 0
                    ? `${people.length} orang merekomendasikan buku ini`
                    : 'Belum ada yang merekomendasikan buku ini'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {people.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {people.map((person) => (
                      <Link href={`/person/${person.id}`} key={person.id}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={person.avatar_url} alt={person.name} />
                                <AvatarFallback>
                                  {person.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{person.name}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {person.bio || 'Tidak ada bio'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2" />
                    <p>Belum ada rekomendasi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
