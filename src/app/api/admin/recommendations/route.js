import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan anon key jika service role key tidak ada
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { person_id, book_id } = body;

    // Validasi input
    if (!person_id || !book_id) {
      return NextResponse.json(
        { error: 'Person ID dan Book ID harus diisi!' },
        { status: 400 }
      );
    }

    // Check if recommendation already exists
    const { data: existing, error: checkError } = await supabase
      .from('recommendations')
      .select('id')
      .eq('person_id', person_id)
      .eq('book_id', book_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError);
      throw checkError;
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Rekomendasi ini sudah ada!' },
        { status: 400 }
      );
    }

    // Insert new recommendation
    const { data, error } = await supabase
      .from('recommendations')
      .insert([{ person_id, book_id }])
      .select();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return NextResponse.json(
      { 
        message: 'Rekomendasi berhasil ditambahkan!',
        recommendation: data[0] 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding recommendation:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan rekomendasi' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        people:person_id(uuid, name),
        books:book_id(uuid, title, author)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ recommendations: data || [] });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data rekomendasi', recommendations: [] },
      { status: 500 }
    );
  }
}