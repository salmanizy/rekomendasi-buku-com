'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Book, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // Validasi required fields
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Username, password, dan konfirmasi password harus diisi!');
      return false;
    }

    // Validasi username length
    if (formData.username.length < 3) {
      setError('Username minimal 3 karakter!');
      return false;
    }

    // Validasi username format (hanya huruf, angka, underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username hanya boleh mengandung huruf, angka, dan underscore!');
      return false;
    }

    // Validasi password length
    if (formData.password.length < 3) {
      setError('Password minimal 3 karakter!');
      return false;
    }

    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return false;
    }

    // Validasi email format (jika diisi)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Format email tidak valid!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect ke login dengan success message
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Registrasi gagal!');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Book className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">diabros</h1>
          </Link>
          <p className="text-muted-foreground">Rekomendasi Buku Indonesia</p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Akun Baru</CardTitle>
            <CardDescription>
              Buat akun untuk mendapatkan rekomendasi buku personal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="minimal 3 karakter"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="minimal 3 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password <span className="text-destructive">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ketik ulang password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Sudah punya akun? </span>
                <Link href="/login" className="text-primary hover:underline">
                  Login di sini
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/" className="hover:underline">
                  Kembali ke beranda
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
