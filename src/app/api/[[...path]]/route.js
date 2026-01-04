//api/[[...path]]/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler
export async function GET(request) {
  try {
    const { pathname } = new URL(request.url);
    console.log('API GET request for:', pathname);

    // Get all books
    if (pathname === '/api/books') {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase books error:', error);
        throw error;
      }
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
          people_id,
          quote,
          source,
          people:people_id (
            id,
            name,
            bio,
            avatar_url,
            slug
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
        .select('id, name, bio, avatar_url, slug')
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
          type: 'people',
          id: person.id,
          title: person.name,
          subtitle: person.bio,
          image: person.avatar_url,
          url: `/people/recommended-books/${person.slug}`
        }))
      ];

      return NextResponse.json({ results });
    }

    // Get all people
    if (pathname === '/api/people') {
      console.log('Fetching all people...');
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase people error:', error);
        throw error;
      }
      console.log(`Found ${data?.length || 0} people`);
      return NextResponse.json({ people: data || [] });
    }

    // Get single person by slug with their recommendations
    if (pathname.startsWith('/api/people/by-slug/')) {
      const slug = pathname.split('/').pop();

      console.log('=== Fetching Person Detail by Slug ===');
      console.log('Slug:', slug);

      // Fetch person details by slug
      const { data: person, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('slug', slug)
        .single();

      if (personError) {
        console.error('Person fetch error:', personError);
        throw personError;
      }

      console.log('Person found:', person);

      // Get books recommended by this person
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select(`
          book_id,
          quote,
          source,
          books:book_id (
            id,
            title,
            author,
            cover_image_url,
            tokopedia_url,
            description,
            openlibrary_id
          )
        `)
        .eq('people_id', person.id);

      if (recError) {
        console.error('Recommendations fetch error:', recError);
      }

      console.log('Recommendations raw:', recommendations);

      // Map the results correctly
      const books = recommendations?.map(r => ({
        id: r.books?.id,
        title: r.books?.title,
        author: r.books?.author,
        cover_image_url: r.books?.cover_image_url,
        tokopedia_url: r.books?.tokopedia_url,
        description: r.books?.description,
        openlibrary_id: r.books?.openlibrary_id,
        quote: r.quote,
        source: r.source
      })).filter(book => book.id) || [];

      console.log('Books mapped:', books);
      console.log('Total books:', books.length);

      return NextResponse.json({ person, books });
    }

    // Get single person with their recommendations - FIXED WITH CORRECT QUERY
    if (pathname.startsWith('/api/people/')) {
      const peopleId = pathname.split('/').pop();

      console.log('=== Fetching Person Detail ===');
      console.log('People ID:', peopleId);

      // Fetch person details
      const { data: person, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', peopleId)
        .single();

      if (personError) {
        console.error('Person fetch error:', personError);
        throw personError;
      }

      console.log('Person found:', person);

      // FIXED: Get books recommended by this person with correct Supabase syntax
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select(`
          book_id,
          quote,
          source,
          books:book_id (
            id,
            title,
            author,
            cover_image_url,
            tokopedia_url,
            description,
            openlibrary_id
          )
        `)
        .eq('people_id', peopleId);

      if (recError) {
        console.error('Recommendations fetch error:', recError);
        // Don't throw, just log and continue with empty array
      }

      console.log('Recommendations raw:', recommendations);

      // Map the results correctly
      const books = recommendations?.map(r => ({
        id: r.books?.id,
        title: r.books?.title,
        author: r.books?.author,
        cover_image_url: r.books?.cover_image_url,
        tokopedia_url: r.books?.tokopedia_url,
        description: r.books?.description,
        openlibrary_id: r.books?.openlibrary_id,
        quote: r.quote,
        source: r.source
      })).filter(book => book.id) || []; // Filter out null/undefined books

      console.log('Books mapped:', books);
      console.log('Total books:', books.length);

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

    // Admin - Add people
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
        people: data
      });
    }

    // Admin - Add recommendation
    if (pathname === '/api/admin/recommendations') {
      const { people_id, book_id, quote, source } = body;

      if (!people_id || !book_id) {
        return NextResponse.json(
          { error: 'people ID dan Book ID harus diisi!' },
          { status: 400 }
        );
      }

      // Check if recommendation already exists
      const { data: existingRec } = await supabase
        .from('recommendations')
        .select('id')
        .eq('people_id', people_id)
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
          people_id,
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