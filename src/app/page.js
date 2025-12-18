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
        (person) =>
          person.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div>
            {/* Hero Section */}
            <div className="relative flex flex-col items-center justify-center min-h-[45rem] px-6 text-center bg-white pb-32">
              <span className="mb-6 inline-block rounded-full bg-gray-100 px-5 py-2 text-xs font-semibold tracking-widest text-gray-600">
                THE BEST BOOKS TO READ
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Welcome to <br />
                <span className="text-stone-600 font-extrabold">Rekobu</span>!
              </h1>

              <p className="mt-4 text-sm italic text-gray-500">
                Temukan buku-buku yang direkomendasikan oleh tokoh ternama dari berbagai penjuru dunia.
              </p>

              <p className="mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-gray-600">
                Misi kami adalah memperkenalkan buku-buku
                <span className="font-semibold text-gray-800"> keren yang mungkin belum Anda kenal</span>
                , yang telah dibaca, diapresiasi, dan direkomendasikan secara langsung oleh para
                <span className="font-semibold text-gray-800"> pemikir, kreator, </span>
                dan
                <span className="font-semibold text-gray-800"> pemimpin berpengaruh.</span>
              </p>

              <p className="mt-10 text-base text-gray-700">
                Temukan rekomendasi buku
                <span className="font-semibold text-gray-700"> menginspirasi </span>
                anda hari ini!
              </p>

              {/* All-in-One Search Bar */}
              <AllInSearchBar />
            </div>

            {/* People Section */}
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
                {filteredPeople.map((person) => (
                  <Link href={`/person/${person.uuid || person.id}`} key={person.uuid || person.id}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader className="text-center p-3 sm:p-4 md:p-6">
                        {/* Avatar */}
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24">
                            <AvatarImage src={person.avatar_url} alt={person.name} />
                            <AvatarFallback className="text-xs sm:text-sm md:text-lg lg:text-2xl">
                              {getInitials(person.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Nama */}
                        <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl line-clamp-2">
                          {person.name}
                        </CardTitle>

                        {/* Bio */}
                        {person.bio && (
                          <CardDescription className="line-clamp-3 mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                            {person.bio}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 diabros - Rekomendasi Buku Terpercaya</p>
        </div>
      </footer>
    </div>
  );
}