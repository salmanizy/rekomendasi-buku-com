import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rekobu.com';

    // Create a fresh Supabase client for sitemap generation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Static pages (always include these)
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    // If Supabase is not configured, return only static pages
    if (!supabaseUrl || !supabaseKey) {
        console.log('Sitemap: Supabase not configured, returning static pages only');
        return staticPages;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch all people for dynamic routes
        const { data: people, error: peopleError } = await supabase
            .from('people')
            .select('slug, updated_at')
            .order('created_at', { ascending: false });

        if (peopleError) {
            console.error('Sitemap: Error fetching people:', peopleError);
        }

        // Fetch all books for book pages
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('id, updated_at')
            .order('created_at', { ascending: false });

        if (booksError) {
            console.error('Sitemap: Error fetching books:', booksError);
        }

        // People recommendation pages
        const peoplePages = (people || []).map((person) => ({
            url: `${baseUrl}/people/recommended-books/${person.slug}`,
            lastModified: person.updated_at ? new Date(person.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Book detail pages
        const bookPages = (books || []).map((book) => ({
            url: `${baseUrl}/book/${book.id}`,
            lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        console.log(`Sitemap: Generated with ${peoplePages.length} people and ${bookPages.length} books`);

        return [...staticPages, ...peoplePages, ...bookPages];
    } catch (error) {
        console.error('Sitemap: Error generating sitemap:', error);
        return staticPages;
    }
}
