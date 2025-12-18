'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Book, User, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export default function AllInSearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  const handleResultClick = (url) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(url);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12" ref={searchRef}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari buku, penulis, atau rekomender..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            className="pl-12 pr-12 py-6 text-base shadow-lg border-2 focus:border-primary"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-2xl max-h-[500px] overflow-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Mencari...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">

                {results.filter(r => r.type === 'person').length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50">
                      Rekomender
                    </div>
                    {results
                      .filter(r => r.type === 'person')
                      .map((result) => (
                        <button
                          key={`person-${result.id}`}
                          onClick={() => handleResultClick(result.url)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 group"
                        >
                          <div className="flex-shrink-0">
                            <Avatar className="h-12 w-12 border-2 border-gray-200">
                              <AvatarImage src={result.image} alt={result.title} />
                              <AvatarFallback className="text-sm">
                                {getInitials(result.title)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
  
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
  
                          <div className="flex-shrink-0">
                            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              Orang
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
                
                {results.filter(r => r.type === 'book').length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50">
                      Buku
                    </div>
                    {results
                      .filter(r => r.type === 'book')
                      .map((result) => (
                        <button
                          key={`book-${result.id}`}
                          onClick={() => handleResultClick(result.url)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 group"
                        >
                          <div className="flex-shrink-0 w-12 h-16 bg-muted rounded overflow-hidden shadow-sm">
                            {result.image ? (
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Book className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Buku
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="font-semibold text-sm mb-1">Tidak ada hasil</p>
                <p className="text-xs text-muted-foreground">
                  Coba kata kunci lain atau periksa ejaan
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Ketik minimal 2 karakter untuk mulai mencari
        </p>
      )}
    </div>
  );
}