'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Book, ExternalLink } from 'lucide-react';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVersion, setFilterVersion] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, filterVersion, books]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data.books || []);
      setFilteredBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by version
    if (filterVersion !== 'all') {
      filtered = filtered.filter((book) => book.version === filterVersion);
    }

    setFilteredBooks(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2">
              <Book className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">diabros</h1>
            </Link>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">Rekomendasi Buku Indonesia</p>
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari buku atau penulis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterVersion === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterVersion('all')}
              >
                Semua
              </Button>
              <Button
                variant={filterVersion === 'imported' ? 'default' : 'outline'}
                onClick={() => setFilterVersion('imported')}
              >
                English
              </Button>
              <Button
                variant={filterVersion === 'translated' ? 'default' : 'outline'}
                onClick={() => setFilterVersion('translated')}
              >
                Terjemahan
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Memuat buku...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Belum ada buku</h2>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterVersion !== 'all'
                ? 'Tidak ada buku yang sesuai dengan pencarian.'
                : 'Silakan tambahkan buku melalui admin panel.'}
            </p>
            {(searchTerm || filterVersion !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterVersion('all');
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 diabros - Rekomendasi Buku Terpercaya</p>
        </div>
      </footer>
    </div>
  );
}
