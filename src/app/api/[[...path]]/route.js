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
          quote,
          source,
          people (
            id,
            name,
            bio,
            avatar_url
          )
        `)
        .eq('book_id', bookId);
      
      if (recError) throw recError;
      
      const people = recommendations?.map(r => ({
        ...r.people,
        quote: r.quote,
        source: r.source
      })) || [];
      
      return NextResponse.json({ book, people });
    }
    
    // Search endpoint for autocomplete
    if (pathname === '/api/search') {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q')?.toLowerCase() || '';
      
      if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
      }
      
      // Search books
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, title, author, cover_image_url')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(5);
      
      if (booksError) console.error('Books search error:', booksError);
      
      // Search people
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('id, name, bio, avatar_url')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      if (peopleError) console.error('People search error:', peopleError);
      
      const results = [
        ...(books || []).map(book => ({
          type: 'book',
          id: book.id,
          title: book.title,
          subtitle: book.author,
          image: book.cover_image_url,
          url: `/book/${book.id}`
        })),
        ...(people || []).map(person => ({
          type: 'person',
          id: person.id,
          title: person.name,
          subtitle: person.bio,
          image: person.avatar_url,
          url: `/person/${person.id}`
        }))
      ];
      
      return NextResponse.json({ results });
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
          quote,
          source,
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
      
      const books = recommendations?.map(r => ({
        ...r.books,
        quote: r.quote,
        source: r.source
      })) || [];
      
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
    
    // Admin - Add recommendation
    if (pathname === '/api/admin/recommendations') {
      const { person_id, book_id, quote, source } = body;
      
      if (!person_id || !book_id) {
        return NextResponse.json(
          { error: 'Person ID dan Book ID harus diisi!' },
          { status: 400 }
        );
      }
      
      // Check if recommendation already exists
      const { data: existingRec } = await supabase
        .from('recommendations')
        .select('id')
        .eq('person_id', person_id)
        .eq('book_id', book_id)
        .limit(1);
      
      if (existingRec && existingRec.length > 0) {
        return NextResponse.json(
          { error: 'Rekomendasi ini sudah ada!' },
          { status: 400 }
        );
      }
      
      const { data, error } = await supabase
        .from('recommendations')
        .insert([{
          person_id,
          book_id,
          quote: quote || null,
          source: source || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ 
        message: 'Rekomendasi berhasil ditambahkan!',
        recommendation: data 
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