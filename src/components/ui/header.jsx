'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';

export default function Header({ searchComponent }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Bar Atas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">diabros</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Books
            </Link>
            <Link
              href="/person"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith('/person')
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              People
            </Link>
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          </div>

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

        {searchComponent && (
          <div className="relative w-full">{searchComponent}</div>
        )}

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3 animate-in fade-in-50 slide-in-from-top-2">
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Books
              </Link>
              <Link
                href="/person"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/person')
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                People
              </Link>

              <div className="flex items-center justify-between pt-2 border-t mt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}