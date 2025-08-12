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

// This function now handles pagination to get ALL posts, not just the first 10
export async function getAllPosts(): Promise<Post[]> {
  const headers = getAuthHeaders();
  const allPosts: Post[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug&per_page=100&page=${page}`, {
      headers: headers,
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const posts: Post[] = await res.json();
    if (posts.length === 0) {
      break; // No more posts to fetch
    }
    allPosts.push(...posts);
    page++;
  }
  return allPosts;
}

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