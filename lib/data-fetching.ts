// lib/data-fetching.ts
import 'server-only';

// Define the shape of the environment object that Cloudflare provides
interface Env {
  WP_USER: string;
  WP_PASSWORD?: string; // Optional because we might use a different auth method later
  CF_CLIENT_ID?: string;
  CF_CLIENT_SECRET?: string;
  NEXT_PUBLIC_WORDPRESS_API_URL: string;
}

// Helper function to get the environment. It will be passed by the runtime.
// This is a placeholder; Next.js on Cloudflare will handle passing the env.
// For now, we will assume it's available on `process.env` for local dev.
const getEnv = (): Env => process.env as any;

// A helper to construct headers once
function getAuthHeaders(env: Env) {
  const base64 = require('base-64');
  return {
    'Authorization': 'Basic ' + base64.encode(`${env.WP_USER}:${env.WP_PASSWORD}`),
    'Content-Type': 'application/json',
    'CF-Access-Client-Id': env.CF_CLIENT_ID || '',
    'CF-Access-Client-Secret': env.CF_CLIENT_SECRET || ''
  };
}

export type Post = {
  id: number;
  title: { rendered: string; };
  content: { rendered: string; };
  slug: string;
};

export async function getAllPosts() {
  const env = getEnv();
  const headers = getAuthHeaders(env);
  const res = await fetch(`${env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`, {
    headers: headers,
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json() as Promise<Post[]>;
}

export async function getPostBySlug(slug: string) {
  const env = getEnv();
  const headers = getAuthHeaders(env);
  const res = await fetch(`${env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  const posts: Post[] = await res.json();
  return posts[0];
}