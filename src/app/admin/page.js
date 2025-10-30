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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Book, User, LogOut, AlertCircle, CheckCircle2, Loader2, Link2, Search, X } from 'lucide-react';

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
    version: 'imported',
    tokopediaUrl: '',
    openlibraryId: ''
  });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [bookLoading, setBookLoading] = useState(false);

  // Person form state
  const [personForm, setPersonForm] = useState({
    name: '',
    bio: '',
    avatarUrl: ''
  });
  const [personError, setPersonError] = useState('');
  const [personSuccess, setPersonSuccess] = useState('');
  const [personLoading, setPersonLoading] = useState(false);

  // Recommendation form state
  const [recommendationForm, setRecommendationForm] = useState({
    personId: '',
    bookId: '',
    personName: '',
    bookTitle: ''
  });
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationSuccess, setRecommendationSuccess] = useState('');
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Search states
  const [personSearch, setPersonSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const personRef = useRef(null);
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
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personRef.current && !personRef.current.contains(event.target)) {
        setShowPersonDropdown(false);
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
      const booksData = await booksRes.json();
      const peopleData = await peopleRes.json();
      setBooks(booksData.books || []);
      setPeople(peopleData.people || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
          version: 'imported',
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

  const handlePersonSubmit = async (e) => {
    e.preventDefault();
    setPersonError('');
    setPersonSuccess('');

    if (!personForm.name) {
      setPersonError('Nama harus diisi!');
      return;
    }

    setPersonLoading(true);

    try {
      const response = await fetch('/api/admin/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personForm)
      });

      const data = await response.json();

      if (response.ok) {
        setPersonSuccess('Orang berhasil ditambahkan!');
        setPersonForm({
          name: '',
          bio: '',
          avatarUrl: ''
        });
        fetchData();
        setTimeout(() => setPersonSuccess(''), 3000);
      } else {
        setPersonError(data.error || 'Gagal menambahkan orang!');
      }
    } catch (error) {
      console.error('Error:', error);
      setPersonError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setPersonLoading(false);
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setRecommendationError('');
    setRecommendationSuccess('');

    if (!recommendationForm.personId || !recommendationForm.bookId) {
      setRecommendationError('Person dan Buku harus dipilih!');
      return;
    }

    setRecommendationLoading(true);

    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: recommendationForm.personId,
          book_id: recommendationForm.bookId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendationSuccess('Rekomendasi berhasil ditambahkan!');
        setRecommendationForm({
          personId: '',
          bookId: '',
          personName: '',
          bookTitle: ''
        });
        setPersonSearch('');
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
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(personSearch.toLowerCase())
  );

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // Handle person selection
  const handlePersonSelect = (person) => {
    setRecommendationForm({
      ...recommendationForm,
      personId: person.uuid || person.id,
      personName: person.name
    });
    setPersonSearch(person.name);
    setShowPersonDropdown(false);
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

  // Clear person selection
  const clearPersonSelection = () => {
    setRecommendationForm({
      ...recommendationForm,
      personId: '',
      personName: ''
    });
    setPersonSearch('');
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
            <TabsTrigger value="books">Tambah Buku</TabsTrigger>
            <TabsTrigger value="people">Tambah Orang</TabsTrigger>
            <TabsTrigger value="recommendations">Tambah Rekomendasi</TabsTrigger>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Versi *</Label>
                      <Select
                        value={bookForm.version}
                        onValueChange={(value) => setBookForm({ ...bookForm, version: value })}
                        disabled={bookLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imported">English (Imported)</SelectItem>
                          <SelectItem value="translated">Indonesian (Terjemahan)</SelectItem>
                        </SelectContent>
                      </Select>
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

          {/* Add Person Form */}
          <TabsContent value="people">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Orang Baru</CardTitle>
                <CardDescription>
                  Tambahkan orang yang merekomendasikan buku
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonSubmit} className="space-y-4">
                  {personError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{personError}</AlertDescription>
                    </Alert>
                  )}
                  {personSuccess && (
                    <Alert className="border-green-500 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{personSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nama *</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Elon Musk"
                      value={personForm.name}
                      onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                      disabled={personLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Deskripsi singkat tentang orang ini..."
                      value={personForm.bio}
                      onChange={(e) => setPersonForm({ ...personForm, bio: e.target.value })}
                      disabled={personLoading}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">URL Avatar</Label>
                    <Input
                      id="avatarUrl"
                      placeholder="https://example.com/avatar.jpg"
                      value={personForm.avatarUrl}
                      onChange={(e) => setPersonForm({ ...personForm, avatarUrl: e.target.value })}
                      disabled={personLoading}
                    />
                  </div>

                  <Button type="submit" disabled={personLoading}>
                    {personLoading ? (
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
                    {/* Person Search */}
                    <div className="space-y-2 relative" ref={personRef}>
                      <Label htmlFor="personSearch">Cari Orang *</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="personSearch"
                          placeholder="Ketik nama orang..."
                          value={personSearch}
                          onChange={(e) => {
                            setPersonSearch(e.target.value);
                            setShowPersonDropdown(true);
                          }}
                          onFocus={() => setShowPersonDropdown(true)}
                          disabled={recommendationLoading}
                          className="pl-9 pr-9"
                        />
                        {recommendationForm.personId && (
                          <button
                            type="button"
                            onClick={clearPersonSelection}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Dropdown Results */}
                      {showPersonDropdown && personSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredPeople.length > 0 ? (
                            filteredPeople.map((person) => (
                              <button
                                key={person.uuid || person.id}
                                type="button"
                                onClick={() => handlePersonSelect(person)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                              >
                                <div className="font-medium">{person.name}</div>
                                {person.bio && (
                                  <div className="text-sm text-muted-foreground truncate">{person.bio}</div>
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
                        {recommendationForm.personId ? (
                          <span className="text-green-600 font-medium">✓ Terpilih: {recommendationForm.personName}</span>
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

                  {/* Preview */}
                  {recommendationForm.personId && recommendationForm.bookId && (
                    <Alert className="border-blue-500 bg-blue-50">
                      <Link2 className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900">
                        <strong>Preview:</strong> {recommendationForm.personName} merekomendasikan "{recommendationForm.bookTitle}"
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    disabled={recommendationLoading || !recommendationForm.personId || !recommendationForm.bookId}
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
    </div>
  );
}