// src/components/ui/AllInSearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Book } from 'lucide-react';
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

export default function AllInSearchBar({ prominent = false }) {
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
    <div className={`w-full ${prominent ? 'max-w-2xl' : 'max-w-xl'} mx-auto ${prominent ? 'mt-0' : 'mt-12'}`} ref={searchRef}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari tokoh, buku, atau penulis"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            className={`${prominent
              ? 'pl-12 pr-12 py-7 text-base rounded-none border-2 border-gray-900 focus:border-gray-900 focus:ring-0 shadow-none bg-white'
              : 'pl-12 pr-12 py-5 text-sm border-2 border-gray-900 focus:border-gray-900 focus:ring-0 shadow-none bg-white'
              }`}
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute z-[9999] w-full mt-0 bg-white border-2 border-t-0 border-gray-900 max-h-[400px] overflow-auto">
            {isLoading ? (
              <div className="px-6 py-4">
                <p className="text-sm text-gray-500">Mencari...</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                {/* People Results */}
                {results.filter(r => r.type === 'people').length > 0 && (
                  <div>
                    <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      ORANG
                    </div>
                    {results
                      .filter(r => r.type === 'people')
                      .map((result) => (
                        <button
                          key={`people-${result.id}`}
                          onClick={() => handleResultClick(result.url)}
                          className="w-full px-6 py-3 hover:bg-gray-100 transition-colors flex items-center gap-4 text-left border-b border-gray-100 last:border-b-0"
                        >
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={result.image} alt={result.title} />
                            <AvatarFallback className="text-xs bg-gray-100">
                              {getInitials(result.title)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                {/* Book Results */}
                {results.filter(r => r.type === 'book').length > 0 && (
                  <div>
                    <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Buku
                    </div>
                    {results
                      .filter(r => r.type === 'book')
                      .map((result) => (
                        <button
                          key={`book-${result.id}`}
                          onClick={() => handleResultClick(result.url)}
                          className="w-full px-6 py-3 hover:bg-gray-100 transition-colors flex items-center gap-4 text-left border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-shrink-0 w-10 h-14 bg-gray-100 overflow-hidden">
                            {result.image ? (
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-400">📖</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-6 py-4">
                <p className="text-sm text-gray-900">Tidak ada hasil</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coba kata kunci lain
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Ketik minimal 2 karakter untuk mulai mencari
        </p>
      )}
    </div>
  );
}