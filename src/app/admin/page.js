'use client';

import { useState, useEffect } from 'react';
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
import { Book, User, LogOut, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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

    // Validasi
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

    // Validasi
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
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="books">Tambah Buku</TabsTrigger>
            <TabsTrigger value="people">Tambah Orang</TabsTrigger>
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
        </Tabs>
      </main>
    </div>
  );
}
