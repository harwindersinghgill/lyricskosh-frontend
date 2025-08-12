// app/lyrics/[slug]/page.tsx

// Define the types for a single post's data
type Post = {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
};

// This function fetches a single post from WordPress using its slug
async function getPost(slug: string) {
  const base64 = require('base-64');

  const headers = {
    'Authorization': 'Basic ' + base64.encode(`${process.env.WP_USER}:${process.env.WP_PASSWORD}`),
    'CF-Access-Client-Id': process.env.CF_CLIENT_ID || '',
    'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET || ''
  };

  // We add `&slug=${slug}` to get the specific post we want
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,content&slug=${slug}`, {
    headers: headers,
    // Use Next.js's caching feature to re-fetch data periodically
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data for the post');
  }

  const posts: Post[] = await res.json();
  // The API returns an array, so we return the first (and only) item
  return posts[0];
}

// This is the main component for the lyrics page
export default async function LyricPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          // We use dangerouslySetInnerHTML because WordPress titles can contain special characters
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div 
          className="prose lg:prose-xl" // Basic styling for the content
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </div>
    </main>
  );
}