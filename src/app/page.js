'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Book } from 'lucide-react';

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVersion, setFilterVersion] = useState('all');
  const [loading, setLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    let filtered = books;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filterVersion !== 'all') {
      filtered = filtered.filter((book) => book.version === filterVersion);
    }

    return filtered;
  }, [debouncedSearchTerm, filterVersion, books]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchComponent = (
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
  );

  return (
    <div className="min-h-screen bg-background">
      <Header searchComponent={searchComponent} />

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <Link href={`/book/${book.id}`} key={book.id}>
                <Card className="hover:shadow-lg transition-transform transform hover:scale-[1.02] cursor-pointer h-full">
                  <CardHeader className="p-3 sm:p-4 md:p-5">
                    {/* Cover */}
                    <div className="aspect-[2/3] relative mb-3 sm:mb-4 bg-muted rounded-md overflow-hidden">
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

                    {/* Judul & Versi */}
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

                    {/* Penulis */}
                    <CardDescription className="line-clamp-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      {book.author}
                    </CardDescription>
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