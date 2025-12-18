'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, LogOut, AlertCircle, CheckCircle2, Loader2, Link2, Search, X } from 'lucide-react';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [people, setPeople] = useState([]);

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    coverImageUrl: '',
    tokopediaUrl: '',
    openlibraryId: ''
  });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [bookLoading, setBookLoading] = useState(false);

  // people form state
  const [peopleForm, setpeopleForm] = useState({
    name: '',
    bio: '',
    avatarUrl: ''
  });
  const [peopleError, setpeopleError] = useState('');
  const [peopleSuccess, setpeopleSuccess] = useState('');
  const [peopleLoading, setpeopleLoading] = useState(false);

  // Recommendation form state
  const [recommendationForm, setRecommendationForm] = useState({
    peopleId: '',
    bookId: '',
    peopleName: '',
    bookTitle: '',
    quote: '',
    source: ''
  });
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationSuccess, setRecommendationSuccess] = useState('');
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Search states
  const [peopleSearch, setpeopleSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showpeopleDropdown, setShowpeopleDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const peopleRef = useRef(null);
  const bookRef = useRef(null);

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
    fetchData();
  }, [router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (peopleRef.current && !peopleRef.current.contains(event.target)) {
        setShowpeopleDropdown(false);
      }
      if (bookRef.current && !bookRef.current.contains(event.target)) {
        setShowBookDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, peopleRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/people')
      ]);
      
      if (!booksRes.ok || !peopleRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const booksData = await booksRes.json();
      const peopleData = await peopleRes.json();
      
      setBooks(booksData.books || []);
      setPeople(peopleData.people || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBooks([]);
      setPeople([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');

    if (!bookForm.title || !bookForm.author) {
      setBookError('Judul dan penulis harus diisi!');
      return;
    }

    setBookLoading(true);

    try {
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      });

      const data = await response.json();

      if (response.ok) {
        setBookSuccess('Buku berhasil ditambahkan!');
        setBookForm({
          title: '',
          author: '',
          description: '',
          coverImageUrl: '',
          tokopediaUrl: '',
          openlibraryId: ''
        });
        fetchData();
        setTimeout(() => setBookSuccess(''), 3000);
      } else {
        setBookError(data.error || 'Gagal menambahkan buku!');
      }
    } catch (error) {
      console.error('Error:', error);
      setBookError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setBookLoading(false);
    }
  };

  const handlepeopleSubmit = async (e) => {
    e.preventDefault();
    setpeopleError('');
    setpeopleSuccess('');

    if (!peopleForm.name) {
      setpeopleError('Nama harus diisi!');
      return;
    }

    setpeopleLoading(true);

    try {
      const response = await fetch('/api/admin/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peopleForm)
      });

      const data = await response.json();

      if (response.ok) {
        setpeopleSuccess('Orang berhasil ditambahkan!');
        setpeopleForm({
          name: '',
          bio: '',
          avatarUrl: ''
        });
        fetchData();
        setTimeout(() => setpeopleSuccess(''), 3000);
      } else {
        setpeopleError(data.error || 'Gagal menambahkan orang!');
      }
    } catch (error) {
      console.error('Error:', error);
      setpeopleError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setpeopleLoading(false);
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setRecommendationError('');
    setRecommendationSuccess('');

    if (!recommendationForm.peopleId || !recommendationForm.bookId) {
      setRecommendationError('people dan Buku harus dipilih!');
      return;
    }

    setRecommendationLoading(true);

    try {
      const payload = {
        people_id: recommendationForm.peopleId,
        book_id: recommendationForm.bookId,
      };

      // Only add quote and source if they have values
      if (recommendationForm.quote && recommendationForm.quote.trim()) {
        payload.quote = recommendationForm.quote.trim();
      }
      
      if (recommendationForm.source && recommendationForm.source.trim()) {
        payload.source = recommendationForm.source.trim();
      }

      const response = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendationSuccess('Rekomendasi berhasil ditambahkan!');
        setRecommendationForm({
          peopleId: '',
          bookId: '',
          peopleName: '',
          bookTitle: '',
          quote: '',
          source: ''
        });
        setpeopleSearch('');
        setBookSearch('');
        fetchData();
        setTimeout(() => setRecommendationSuccess(''), 3000);
      } else {
        setRecommendationError(data.error || 'Gagal menambahkan rekomendasi!');
      }
    } catch (error) {
      console.error('Error:', error);
      setRecommendationError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setRecommendationLoading(false);
    }
  };

  // Filter people based on search
  const filteredPeople = people.filter(people =>
    people.name && people.name.toLowerCase().includes(peopleSearch.toLowerCase())
  );

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    (book.title && book.title.toLowerCase().includes(bookSearch.toLowerCase())) ||
    (book.author && book.author.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  // Handle people selection
  const handlepeopleSelect = (people) => {
    setRecommendationForm({
      ...recommendationForm,
      peopleId: people.uuid || people.id,
      peopleName: people.name
    });
    setpeopleSearch(people.name);
    setShowpeopleDropdown(false);
  };

  // Handle book selection
  const handleBookSelect = (book) => {
    setRecommendationForm({
      ...recommendationForm,
      bookId: book.uuid || book.id,
      bookTitle: book.title
    });
    setBookSearch(`${book.title} - ${book.author}`);
    setShowBookDropdown(false);
  };

  // Clear people selection
  const clearpeopleSelection = () => {
    setRecommendationForm({
      ...recommendationForm,
      peopleId: '',
      peopleName: ''
    });
    setpeopleSearch('');
  };

  // Clear book selection
  const clearBookSelection = () => {
    setRecommendationForm({
      ...recommendationForm,
      bookId: '',
      bookTitle: ''
    });
    setBookSearch('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Book className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">diabros Admin</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-semibold">{user?.full_name || user?.username}</p>
                <p className="text-muted-foreground text-xs">Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Buku</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{books.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{people.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Website
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Forms */}
        <Tabs defaultValue="books" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="books">Add Book</TabsTrigger>
            <TabsTrigger value="people">Add People</TabsTrigger>
            <TabsTrigger value="recommendations">Add Rec</TabsTrigger>
          </TabsList>

          {/* Add Book Form */}
          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Buku Baru</CardTitle>
                <CardDescription>
                  Masukkan informasi buku yang ingin ditambahkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  {bookError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{bookError}</AlertDescription>
                    </Alert>
                  )}
                  {bookSuccess && (
                    <Alert className="border-green-500 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{bookSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Buku *</Label>
                      <Input
                        id="title"
                        placeholder="Contoh: Sapiens"
                        value={bookForm.title}
                        onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                        disabled={bookLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">Penulis *</Label>
                      <Input
                        id="author"
                        placeholder="Contoh: Yuval Noah Harari"
                        value={bookForm.author}
                        onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                        disabled={bookLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Deskripsi singkat tentang buku..."
                      value={bookForm.description}
                      onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                      disabled={bookLoading}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImageUrl">URL Cover</Label>
                    <Input
                      id="coverImageUrl"
                      placeholder="https://covers.openlibrary.org/..."
                      value={bookForm.coverImageUrl}
                      onChange={(e) => setBookForm({ ...bookForm, coverImageUrl: e.target.value })}
                      disabled={bookLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tokopediaUrl">URL Tokopedia</Label>
                      <Input
                        id="tokopediaUrl"
                        placeholder="https://www.tokopedia.com/..."
                        value={bookForm.tokopediaUrl}
                        onChange={(e) => setBookForm({ ...bookForm, tokopediaUrl: e.target.value })}
                        disabled={bookLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="openlibraryId">OpenLibrary ID</Label>
                      <Input
                        id="openlibraryId"
                        placeholder="OL26344837M"
                        value={bookForm.openlibraryId}
                        onChange={(e) => setBookForm({ ...bookForm, openlibraryId: e.target.value })}
                        disabled={bookLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={bookLoading}>
                    {bookLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      'Tambah Buku'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add people Form */}
          <TabsContent value="people">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Orang Baru</CardTitle>
                <CardDescription>
                  Tambahkan orang yang merekomendasikan buku
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlepeopleSubmit} className="space-y-4">
                  {peopleError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{peopleError}</AlertDescription>
                    </Alert>
                  )}
                  {peopleSuccess && (
                    <Alert className="border-green-500 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{peopleSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nama *</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Elon Musk"
                      value={peopleForm.name}
                      onChange={(e) => setpeopleForm({ ...peopleForm, name: e.target.value })}
                      disabled={peopleLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Deskripsi singkat tentang orang ini..."
                      value={peopleForm.bio}
                      onChange={(e) => setpeopleForm({ ...peopleForm, bio: e.target.value })}
                      disabled={peopleLoading}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">URL Avatar</Label>
                    <Input
                      id="avatarUrl"
                      placeholder="https://example.com/avatar.jpg"
                      value={peopleForm.avatarUrl}
                      onChange={(e) => setpeopleForm({ ...peopleForm, avatarUrl: e.target.value })}
                      disabled={peopleLoading}
                    />
                  </div>

                  <Button type="submit" disabled={peopleLoading}>
                    {peopleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      'Tambah Orang'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Recommendation Form */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Rekomendasi Baru</CardTitle>
                <CardDescription>
                  Hubungkan orang dengan buku yang mereka rekomendasikan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecommendationSubmit} className="space-y-4">
                  {recommendationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recommendationError}</AlertDescription>
                    </Alert>
                  )}
                  {recommendationSuccess && (
                    <Alert className="border-green-500 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{recommendationSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* people Search */}
                    <div className="space-y-2 relative" ref={peopleRef}>
                      <Label htmlFor="peopleSearch">Cari Orang *</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="peopleSearch"
                          placeholder="Ketik nama orang..."
                          value={peopleSearch}
                          onChange={(e) => {
                            setpeopleSearch(e.target.value);
                            setShowpeopleDropdown(true);
                          }}
                          onFocus={() => setShowpeopleDropdown(true)}
                          disabled={recommendationLoading}
                          className="pl-9 pr-9"
                        />
                        {recommendationForm.peopleId && (
                          <button
                            type="button"
                            onClick={clearpeopleSelection}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Dropdown Results */}
                      {showpeopleDropdown && peopleSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredPeople.length > 0 ? (
                            filteredPeople.map((people) => (
                              <button
                                key={people.uuid || people.id}
                                type="button"
                                onClick={() => handlepeopleSelect(people)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                              >
                                <div className="font-medium">{people.name}</div>
                                {people.bio && (
                                  <div className="text-sm text-muted-foreground truncate">{people.bio}</div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              Tidak ada hasil
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {recommendationForm.peopleId ? (
                          <span className="text-green-600 font-medium">✓ Terpilih: {recommendationForm.peopleName}</span>
                        ) : (
                          `${people.length} orang tersedia`
                        )}
                      </p>
                    </div>

                    {/* Book Search */}
                    <div className="space-y-2 relative" ref={bookRef}>
                      <Label htmlFor="bookSearch">Cari Buku *</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bookSearch"
                          placeholder="Ketik judul atau penulis..."
                          value={bookSearch}
                          onChange={(e) => {
                            setBookSearch(e.target.value);
                            setShowBookDropdown(true);
                          }}
                          onFocus={() => setShowBookDropdown(true)}
                          disabled={recommendationLoading}
                          className="pl-9 pr-9"
                        />
                        {recommendationForm.bookId && (
                          <button
                            type="button"
                            onClick={clearBookSelection}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Dropdown Results */}
                      {showBookDropdown && bookSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                              <button
                                key={book.uuid || book.id}
                                type="button"
                                onClick={() => handleBookSelect(book)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                              >
                                <div className="font-medium">{book.title}</div>
                                <div className="text-sm text-muted-foreground">{book.author}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              Tidak ada hasil
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {recommendationForm.bookId ? (
                          <span className="text-green-600 font-medium">✓ Terpilih: {recommendationForm.bookTitle}</span>
                        ) : (
                          `${books.length} buku tersedia`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quote Field */}
                  <div className="space-y-2">
                    <Label htmlFor="quote">Kutipan / Alasan Rekomendasi</Label>
                    <Textarea
                      id="quote"
                      placeholder="Contoh: Buku ini mengubah cara saya memandang sejarah manusia..."
                      value={recommendationForm.quote}
                      onChange={(e) => setRecommendationForm({ ...recommendationForm, quote: e.target.value })}
                      disabled={recommendationLoading}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Masukkan kutipan atau alasan mengapa orang ini merekomendasikan buku tersebut
                    </p>
                  </div>

                  {/* Source Field */}
                  <div className="space-y-2">
                    <Label htmlFor="source">Sumber (URL)</Label>
                    <Input
                      id="source"
                      type="url"
                      placeholder="https://twitter.com/username/status/..."
                      value={recommendationForm.source}
                      onChange={(e) => setRecommendationForm({ ...recommendationForm, source: e.target.value })}
                      disabled={recommendationLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Link ke sumber kutipan (Twitter, artikel, podcast, dll)
                    </p>
                  </div>

                  {/* Preview */}
                  {recommendationForm.peopleId && recommendationForm.bookId && (
                    <Alert className="border-blue-500 bg-blue-50">
                      <Link2 className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900">
                        <strong>Preview:</strong> {recommendationForm.peopleName} merekomendasikan &quot;{recommendationForm.bookTitle}&quot;
                        {recommendationForm.quote && (
                          <div className="mt-2 italic text-sm">
                            &quot;{recommendationForm.quote}&quot;
                          </div>
                        )}
                        {recommendationForm.source && (
                          <div className="mt-1 text-xs">
                            Sumber: <a href={recommendationForm.source} target="_blank" rel="noopener noreferrer" className="underline">{recommendationForm.source}</a>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    disabled={recommendationLoading || !recommendationForm.peopleId || !recommendationForm.bookId}
                  >
                    {recommendationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      'Tambah Rekomendasi'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Rekobu - Rekomendasi Buku Terpercaya</p>
        </div>
      </footer>
    </div>
  );
}