export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rekobu.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/login/', '/register/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
