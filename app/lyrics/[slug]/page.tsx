// app/lyrics/[slug]/page.tsx

import 'server-only'; // Ensures this code only runs on the server

// Define the types for our data
type Post = {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  slug: string;
};

// --- NEW: This function tells Next.js which pages to build ---
export async function generateStaticParams() {
  const base64 = require('base-64');
  const headers = {
    'Authorization': 'Basic ' + base64.encode(`${process.env.WP_USER}:${process.env.WP_PASSWORD}`),
    'CF-Access-Client-Id': process.env.CF_CLIENT_ID || '',
    'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET || ''
  };

  // Fetch all posts to get their slugs
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=slug`, { headers });
  const posts: Post[] = await res.json();

  // Return an array of objects, where each object has a `slug` property
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// This function fetches a single post from WordPress using its slug
async function getPost(slug: string) {
  const base64 = require('base-64');
  const headers = {
    'Authorization': 'Basic ' + base64.encode(`${process.env.WP_USER}:${process.env.WP_PASSWORD}`),
    'CF-Access-Client-Id': process.env.CF_CLIENT_ID || '',
    'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET || ''
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data for the post');
  }

  const posts: Post[] = await res.json();
  return posts[0];
}

// This is the main component for the lyrics page
export default async function LyricPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div 
          className="prose lg:prose-xl"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </div>
    </main>
  );
}