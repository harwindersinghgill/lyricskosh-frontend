// lib/data-fetching.ts
import 'server-only';
const base64 = require('base-64');

function getAuthHeaders() {
  const WP_USER = process.env.WP_USER ?? '';
  const WP_PASSWORD = process.env.WP_PASSWORD ?? '';
  return {
    'Authorization': 'Basic ' + base64.encode(`${WP_USER}:${WP_PASSWORD}`),
    'Content-Type': 'application/json',
  };
}

export type Post = {
  id: number;
  title: { rendered: string; };
  content: { rendered: string; };
  slug: string;
};

// RESTORED AND CORRECTED: This function is for the homepage and now queries the 'language' taxonomy
export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
    const headers = getAuthHeaders();
    // First, get the category ID from the 'language' taxonomy slug
    const catRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/language?slug=${categorySlug}`, { headers });
    if (!catRes.ok) return [];
    const categories = await catRes.json();
    if (categories.length === 0) return [];
    const categoryId = categories[0].id;

    // Now, fetch posts using that category ID
    const postsRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug&language=${categoryId}&per_page=12`, { headers, next: { revalidate: 3600 } });
    if (!postsRes.ok) return [];
    return postsRes.json();
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const headers = getAuthHeaders();
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  const posts: Post[] = await res.json();
  return posts[0];
}