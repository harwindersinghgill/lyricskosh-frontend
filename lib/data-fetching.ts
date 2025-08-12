// lib/data-fetching.ts
import 'server-only';

// This is the final, simplified authentication helper.
// It uses the built-in `btoa` function which is compatible with the Edge Runtime.
function getAuthHeaders() {
  const WP_USER = process.env.WP_USER ?? '';
  const WP_PASSWORD = process.env.WP_PASSWORD ?? '';
  const credentials = `${WP_USER}:${WP_PASSWORD}`;
  const token = btoa(credentials); // Using the native btoa function

  return {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json',
    'CF-Access--Id': process.env.CF_CLIENT_ID ?? '',
    'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET ?? ''
  };
}

// Define the type for our Post objects
export type Post = {
  id: number;
  title: { rendered: string; };
  content: { rendered: string; };
  slug: string;
};

// --- Function to get ALL posts for the homepage ---
export async function getAllPosts(): Promise<Post[]> {
  const headers = getAuthHeaders();
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`, {
    headers: headers,
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

// --- Function to get a SINGLE post by its slug ---
export async function getPostBySlug(slug: string): Promise<Post> {
  const headers = getAuthHeaders();
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  const posts: Post[] = await res.json();
  return posts[0];
}