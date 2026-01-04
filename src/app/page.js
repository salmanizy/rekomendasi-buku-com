'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User } from 'lucide-react';
import AllInSearchBar from '@/components/ui/AllInSearchBar';
import RecommendationShowcase from '@/components/ui/RecommendationShowcase';

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
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchPeople();
  }, []);

  const filteredPeople = useMemo(() => {
    let filtered = people;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (people) =>
          people.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [debouncedSearchTerm, people]);

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people');
      const data = await response.json();
      setPeople(data.people || []);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const searchBar = (
    <div className="relative flex-1 mb-5">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Cari rekomender..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {loading ? (
          <div className="container mx-auto px-4 text-center py-20">
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        ) : (
          <div>
            {/* Hero Section - with max-width constraint */}
            <div className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-background max-w-[1440px] mx-auto">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full">
                <span className="mb-6 inline-block rounded-full bg-gray-200 px-5 py-2 text-xs font-semibold tracking-widest text-gray-700 uppercase">
                  BOOK RECOMMENDATION LIBRARY
                </span>

                <h1 className="font-display text-4xl md:text-5xl font-medium italic text-gray-900 leading-[1.2]">
                  Temukan Buku Rekomendasi
                  <br />
                  <span className="whitespace-nowrap inline-flex items-baseline">
                    <span
                      className="relative inline-block overflow-hidden"
                      style={{ height: '1.1em' }}
                    >
                      <span className="sliding-text block" style={{ marginTop: '0.05em' }}>
                        <span className="block leading-none text-gray-900">Pebisnis</span>
                        <span className="block leading-none text-gray-900">Penulis</span>
                        <span className="block leading-none text-gray-900">Tokoh</span>
                        <span className="block leading-none text-gray-900">Creator</span>
                        <span className="block leading-none text-gray-900">Politisi</span>
                      </span>
                    </span>
                    <span>&nbsp;Favoritmu</span>
                  </span>
                </h1>

                {/* Prominent Search Bar */}
                <div className="w-full max-w-2xl mx-auto mt-12">
                  <AllInSearchBar prominent />
                </div>

                {/* Book Recommendation Showcase */}
                <RecommendationShowcase />
              </div>
            </div>

            {/* People Section - with container */}
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Rekomender</h2>
                <p className="text-muted-foreground">
                  Orang-orang yang merekomendasikan buku terbaik
                </p>
              </div>

              {searchBar}

              {filteredPeople.length === 0 ? (
                <div className="text-center py-20">
                  <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Belum ada rekomender</h2>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? 'Tidak ada rekomender yang sesuai dengan pencarian.'
                      : 'Silakan tambahkan rekomender melalui admin panel.'}
                  </p>
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm('')}>
                      Reset Pencarian
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredPeople.map((people) => (
                    <Link href={`/people/recommended-books/${people.slug}`} key={people.slug || people.id}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="text-center p-3 sm:p-4 md:p-6">
                          {/* Avatar */}
                          <div className="flex justify-center mb-3 sm:mb-4">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24">
                              <AvatarImage src={people.avatar_url} alt={people.name} />
                              <AvatarFallback className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                                {getInitials(people.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          {/* Nama */}
                          <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl line-clamp-2">
                            {people.name}
                          </CardTitle>

                          {/* Bio */}
                          {people.bio && (
                            <CardDescription className="line-clamp-3 mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                              {people.bio}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
        }
      </main >

      {/* Footer */}
      < footer className="border-t mt-20" >
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Rekobu - Rekomendasi Buku Terpercaya</p>
        </div>
      </footer >
    </div >
  );
}