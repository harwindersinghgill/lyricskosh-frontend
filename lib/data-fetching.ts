// lib/data-fetching.ts
import 'server-only';
const base64 = require('base-64');

// Centralized headers for all our API calls
const headers = {
    'Authorization': 'Basic ' + base64.encode(`${process.env.WP_USER}:${process.env.WP_PASSWORD}`),
    'Content-Type': 'application/json',
    'CF-Access-Client-Id': process.env.CF_CLIENT_ID || '',
    'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET || ''
};

// Define the type for our Post objects
export type Post = {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  slug: string;
};

// --- Function to get ALL posts for the homepage ---
export async function getAllPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`, {
    headers: headers,
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  const posts: Post[] = await res.json();
  return posts;
}

// --- Function to get a SINGLE post by its slug ---
export async function getPostBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }

  const posts: Post[] = await res.json();
  return posts[0];
}