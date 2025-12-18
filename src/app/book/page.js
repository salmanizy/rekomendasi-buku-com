// People Page (dengan Book Section)
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Book } from 'lucide-react';
import Header from '@/components/ui/header';

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

export default function BookPage() {
  const pathname = usePathname();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVersion, setFilterVersion] = useState('all');
  const [loading, setLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const searchBar = (
    <div className="relative flex-1 mb-5">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Cari buku atau penulis..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );

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

  return (
    <div className="min-h-screen bg-background">
      <Header/>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Koleksi Buku</h2>
          <p className="text-muted-foreground">
            Jelajahi buku-buku yang direkomendasikan
          </p>
        </div>

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
          <div>
            {searchBar}
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
                            loading="lazy"
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Rekobu - Rekomendasi Buku Terpercaya</p>
        </div>
      </footer>
    </div>
  );
}