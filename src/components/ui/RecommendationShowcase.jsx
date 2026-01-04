'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const recommendations = [
    {
        title: "Poor Charlie's Almanack",
        author: "Charlie Munger",
        recommenders: ["Naval Ravikant", "Marc Andreessen", "Bill Gates", "Warren Buffett", "Patrick Collison", "Tim Ferriss"],
        cover: "https://m.media-amazon.com/images/I/81HHPBQH9dL._SL1500_.jpg"
    },
    {
        title: "Educated",
        author: "Tara Westover",
        recommenders: ["Bill Gates", "Michelle Obama", "Barack Obama", "Kathryn Minshew", "Melinda Gates", "Marty Cagan"],
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg"
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        recommenders: ["Tim Urban", "Vinod Khosla", "Biz Stone", "Anthony Pompliano", "Ali Abdaal", "Ben Greenfield"],
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg"
    }
];

export default function RecommendationShowcase() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setIsVisible(false);

            // After fade out, change content and fade in
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % recommendations.length);
                setIsVisible(true);
            }, 500);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const current = recommendations[currentIndex];

    return (
        <div className="w-full max-w-xl mx-auto mt-10">
            <div
                className={`inline-flex items-center gap-5 py-6 border-t border-gray-100 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
            >
                {/* Book Cover */}
                <div className="flex-shrink-0 w-24 h-36 relative rounded overflow-hidden">
                    <Image
                        src={current.cover}
                        alt={current.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>

                {/* Book Info */}
                <div className="min-w-0 text-left">
                    <h3 className="font-display text-base font-medium text-gray-900 italic line-clamp-1">
                        {current.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {current.author}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Direkomendasikan oleh
                    </p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {current.recommenders.slice(0, 3).join(", ")}
                        {current.recommenders.length > 3 && ` +${current.recommenders.length - 3} lainnya`}
                    </p>
                </div>
            </div>
        </div>
    );
}
