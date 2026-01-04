'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { Book, ChevronDown, ShoppingCart } from 'lucide-react';

export default function BookCard({ book, currentPersonId, currentPersonName }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const generateSearchUrl = (platform, query) => {
        const encodedQuery = encodeURIComponent(query);
        const urls = {
            tokopedia: `https://www.tokopedia.com/search?q=${encodedQuery}`,
            shopee: `https://shopee.co.id/search?keyword=${encodedQuery}`,
            amazon: `https://www.amazon.com/s?k=${encodedQuery}`
        };
        return urls[platform];
    };

    // Filter out current person from recommenders
    const otherRecommenders = book.recommenders?.filter(r => r.id !== currentPersonId) || [];

    // Check if we have a valid cover image URL
    const hasCoverImage = book.cover_image_url && !imageError;

    return (
        <div className="group pb-6 border-b border-border flex flex-col h-full">
            {/* Main Content - Horizontal Layout */}
            <div className="flex items-start gap-4 md:gap-6 flex-1">
                {/* Left Column - Book Cover & Button */}
                <div className="flex-shrink-0 flex flex-col gap-3 w-28 md:w-48">
                    <Link href={`/book/${book.id}`}>
                        <div className="relative w-full h-40 md:h-72 bg-muted overflow-hidden rounded shadow-md transition-transform duration-300 group-hover:scale-105">
                            {hasCoverImage ? (
                                <Image
                                    src={book.cover_image_url}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 112px, 192px"
                                    onError={() => setImageError(true)}
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Book className="h-10 w-10 md:h-16 md:w-16 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Buy Button with Dropdown - Below Book Cover */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-2.5 text-white hover:opacity-90 transition-opacity text-sm font-medium rounded"
                            style={{ backgroundColor: '#E97451' }}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Dapatkan Buku
                            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                                <a
                                    href={generateSearchUrl('tokopedia', book.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 text-sm hover:bg-muted transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Tokopedia
                                </a>
                                <a
                                    href={generateSearchUrl('shopee', book.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 text-sm hover:bg-muted transition-colors border-t border-border"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Shopee
                                </a>
                                <a
                                    href={generateSearchUrl('amazon', book.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 text-sm hover:bg-muted transition-colors border-t border-border"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Amazon
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Book Content */}
                <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                    {/* Title & Author - Top */}
                    <div className="space-y-1">
                        <Link href={`/book/${book.id}`}>
                            <h3 className="font-display text-lg md:text-xl font-medium text-foreground hover:text-muted-foreground transition-colors italic line-clamp-2">
                                {book.title}
                            </h3>
                        </Link>
                        <p className="text-sm md:text-base text-muted-foreground">
                            {book.author}
                        </p>
                    </div>

                    {/* Quote - Hero Element */}
                    {book.quote && (
                        <div className="border-l-2 border-muted-foreground/50 bg-muted/100 pl-4 pr-4 py-3 rounded-r">
                            <p className="font-sans text-md md:text-xl lg:text-xl text-foreground italic leading-relaxed">
                                &quot;{book.quote}&quot;
                                {currentPersonName && (
                                    <span className="text-sm md:text-base text-foreground ml-2 not-italic">
                                        — {currentPersonName}
                                    </span>
                                )}
                                {book.source && (
                                    <span className="text-xs md:text-sm text-muted-foreground ml-2 not-italic">
                                        <a
                                            href={book.source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            (Source)
                                        </a>
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Also Recommended By */}
                    {otherRecommenders.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                Juga Direkomendasikan Oleh
                            </p>
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                                {otherRecommenders.slice(0, 3).map((recommender, index) => (
                                    <span key={recommender.id}>
                                        {index > 0 && ', '}
                                        <Link
                                            href={`/people/recommended-books/${recommender.slug}`}
                                            className="hover:underline"
                                        >
                                            {recommender.name}
                                        </Link>
                                    </span>
                                ))}
                                {otherRecommenders.length > 3 && ` +${otherRecommenders.length - 3} lainnya`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
