import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler
export async function GET(request) {
  try {
    const { pathname } = new URL(request.url);
    
    // Get all books
    if (pathname === '/api/books') {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ books: data || [] });
    }
    
    // Get single book with recommendations
    if (pathname.startsWith('/api/books/')) {
      const bookId = pathname.split('/').pop();
      
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      
      if (bookError) throw bookError;
      
      // Get people who recommend this book
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select(`
          person_id,
          people (
            id,
            name,
            bio,
            avatar_url
          )
        `)
        .eq('book_id', bookId);
      
      if (recError) throw recError;
      
      const people = recommendations?.map(r => r.people) || [];
      
      return NextResponse.json({ book, people });
    }
    
    // Get all people
    if (pathname === '/api/people') {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ people: data || [] });
    }
    
    // Get single person with their recommendations
    if (pathname.startsWith('/api/people/')) {
      const personId = pathname.split('/').pop();
      
      const { data: person, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .single();
      
      if (personError) throw personError;
      
      // Get books recommended by this person
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select(`
          book_id,
          books (
            id,
            title,
            author,
            cover_image_url,
            version,
            tokopedia_url
          )
        `)
        .eq('person_id', personId);
      
      if (recError) throw recError;
      
      const books = recommendations?.map(r => r.books) || [];
      
      return NextResponse.json({ person, books });
    }
    
    return NextResponse.json({ message: 'API Route' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request) {
  try {
    const { pathname } = new URL(request.url);
    const body = await request.json();
    
    // Login endpoint
    if (pathname === '/api/auth/login') {
      const { username, password } = body;
      
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Username dan password harus diisi!' },
          { status: 400 }
        );
      }
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .limit(1);
      
      if (error) throw error;
      
      if (!users || users.length === 0) {
        return NextResponse.json(
          { error: 'Username atau password salah!' },
          { status: 401 }
        );
      }
      
      const user = users[0];
      
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
      
      // Return user data (exclude password)
      const { password: _, ...userData } = user;
      return NextResponse.json({ 
        message: 'Login berhasil!',
        user: userData 
      });
    }
    
    // Register endpoint
    if (pathname === '/api/auth/register') {
      const { username, password, fullName, email } = body;
      
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Username dan password harus diisi!' },
          { status: 400 }
        );
      }
      
      // Check if username already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .limit(1);
      
      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'Username sudah digunakan!' },
          { status: 400 }
        );
      }
      
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          username,
          password,
          full_name: fullName || null,
          email: email || null,
          role: 'user'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ 
        message: 'Registrasi berhasil!',
        user: { id: newUser.id, username: newUser.username }
      });
    }
    
    // Admin - Add book
    if (pathname === '/api/admin/books') {
      const { title, author, description, coverImageUrl, version, tokopediaUrl, openlibraryId } = body;
      
      if (!title || !author) {
        return NextResponse.json(
          { error: 'Judul dan penulis harus diisi!' },
          { status: 400 }
        );
      }
      
      const { data, error } = await supabase
        .from('books')
        .insert([{
          title,
          author,
          description: description || null,
          cover_image_url: coverImageUrl || null,
          version: version || 'imported',
          tokopedia_url: tokopediaUrl || null,
          openlibrary_id: openlibraryId || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ 
        message: 'Buku berhasil ditambahkan!',
        book: data 
      });
    }
    
    // Admin - Add person
    if (pathname === '/api/admin/people') {
      const { name, bio, avatarUrl } = body;
      
      if (!name) {
        return NextResponse.json(
          { error: 'Nama harus diisi!' },
          { status: 400 }
        );
      }
      
      const { data, error } = await supabase
        .from('people')
        .insert([{
          name,
          bio: bio || null,
          avatar_url: avatarUrl || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ 
        message: 'Orang berhasil ditambahkan!',
        person: data 
      });
    }
    
    return NextResponse.json({ message: 'POST endpoint', pathname, body });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
