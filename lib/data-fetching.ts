// lib/data-fetching.ts
import 'server-only';

const encodeBase64 = (input: string): string => {
  if (typeof btoa !== 'undefined') return btoa(input);
  if (typeof Buffer !== 'undefined') return Buffer.from(input).toString('base64');
  throw new Error('No base64 encoder available in this runtime');
};

function buildHeaders() {
  const WP_USER = process.env.WP_USER ?? '';
  const WP_PASSWORD = process.env.WP_PASSWORD ?? '';
  const CF_CLIENT_ID = process.env.CF_CLIENT_ID ?? '';
  const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET ?? '';

  return {
    'Authorization': `Basic ${encodeBase64(`${WP_USER}:${WP_PASSWORD}`)}`,
    'Content-Type': 'application/json',
    'CF-Access-Client-Id': CF_CLIENT_ID,
    'CF-Access-Client-Secret': CF_CLIENT_SECRET,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  } as Record<string, string>;
}

export type Post = {
  id: number;
  title: { rendered: string; };
  content: { rendered: string; };
  slug: string;
};

async function safeFetch(url: string, init?: RequestInit) {
  console.log(`[data-fetching] Attempting to fetch: ${url}`);
  const res = await fetch(url, init);

  if (!res.ok) {
    const text = await res.text();
    console.error('[data-fetching] ERROR:', {
      status: res.status,
      statusText: res.statusText,
      url: url,
      responseBody: text.slice(0, 200) + (text.length > 200 ? '...' : '')
    });
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getAllPosts(): Promise<Post[]> {
  const headers = buildHeaders();
  const url = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`;
  return safeFetch(url, { headers, next: { revalidate: 3600 } });
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const headers = buildHeaders();
  const url = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${encodeURIComponent(slug)}`;
  const posts: Post[] = await safeFetch(url, { headers, next: { revalidate: 3600 } });
  return posts[0];
}