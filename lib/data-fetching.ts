// lib/data-fetching.ts
import 'server-only';
// THIS LINE IS CRITICAL AND HAS BEEN RESTORED
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

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
    const headers = getAuthHeaders();
    const catRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/language?slug=${categorySlug}`, { headers });
    if (!catRes.ok) {
        console.error(`Failed to fetch category ID for slug: ${categorySlug}`);
        return [];
    }
    const categories = await catRes.json();
    if (categories.length === 0) {
        return [];
    }
    const categoryId = categories[0].id;
    
    const postsRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug&language=${categoryId}&per_page=12`, { headers, next: { revalidate: 3600 } });
    if (!postsRes.ok) {
        console.error(`Failed to fetch posts for category ${categorySlug}`);
        return [];
    }
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