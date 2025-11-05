'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PreviouslyViewedBooks() {
  const [viewedBooks, setViewedBooks] = useState([]);

  useEffect(() => {
    const storedBooks = localStorage.getItem('previouslyViewed');
    if (storedBooks) {
      setViewedBooks(JSON.parse(storedBooks));
    }
  }, []);

  if (viewedBooks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl font-bold mb-3">Recently Viewed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {viewedBooks.map((book) => (
          <Link href={`/book/${book.id}`} key={book.id}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="p-3">
                <div className="aspect-[2/3] relative mb-3 bg-muted rounded-md overflow-hidden">
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                  <Badge variant={book.version === 'imported' ? 'default' : 'secondary'} className="text-xs">
                    {book.version === 'imported' ? 'EN' : 'ID'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
              </CardHeader>
              <CardContent className="p-0">
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}