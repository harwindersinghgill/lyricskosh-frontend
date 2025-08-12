// lib/data-fetching.ts
import 'server-only';

// Edge-friendly Base64 encoder
const encodeBase64 = (input: string): string => {
  if (typeof btoa !== 'undefined') {
    return btoa(input);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input).toString('base64');
  }
  throw new Error('No base64 encoder available in this runtime');
};

const headers = {
  'Authorization': 'Basic ' + encodeBase64(`${process.env.WP_USER ?? ''}:${process.env.WP_PASSWORD ?? ''}`),
  'Content-Type': 'application/json',
  'CF-Access-Client-Id': process.env.CF_CLIENT_ID ?? '',
  'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET ?? ''
};

export type Post = {
  id: number;
  title: { rendered: string; };
  content: { rendered: string; };
  slug: string;
};

export async function getAllPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`, {
    headers: headers,
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json() as Promise<Post[]>;
}

export async function getPostBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  const posts: Post[] = await res.json();
  return posts[0];
}
// Trigger redeploy