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

// This is the only function we need now for the lyrics pages.
export async function getPostBySlug(slug: string): Promise<Post> {
  const headers = getAuthHeaders();
  // We remove the revalidate option to ensure the page is always dynamic
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    cache: 'no-store' // This forces dynamic rendering
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  const posts: Post[] = await res.json();
  return posts[0];
}