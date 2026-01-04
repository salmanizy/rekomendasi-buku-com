'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`border-b fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
    >
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Bar Atas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-black">REKOBU</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              Home
            </Link>
            <Link
              href="/book"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith('/book')
                ? 'text-primary'
                : 'text-muted-foreground'
                }`}
            >
              Books
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3 animate-in fade-in-50 slide-in-from-top-2">
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/book"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith('/book')
                  ? 'text-primary'
                  : 'text-muted-foreground'
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                Books
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}