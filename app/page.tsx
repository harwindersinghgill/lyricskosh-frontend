// app/page.tsx

// Define a type for our Post objects for better code safety with TypeScript
type Post = {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
};

// This function fetches the data from our WordPress backend
// app/page.tsx -> getPosts function

async function getPosts() {
  // NEW: Import authentication libraries
  const base64 = require('base-64');

  // NEW: Create the headers for the server-side request
  const headers = {
    'Authorization': 'Basic ' + base64.encode(`${process.env.WP_USER}:${process.env.WP_PASSWORD}`),
    'CF-Access-Client-Id': process.env.CF_CLIENT_ID || '',
    'CF-Access-Client-Secret': process.env.CF_CLIENT_SECRET || ''
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`, {
    // NEW: Add the headers to the fetch request
    headers: headers
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data from WordPress');
  }

  const posts: Post[] = await res.json();
  return posts;
}

// This is the main Homepage component. It's an async function because we need to wait for the data.
export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Lyricskosh</h1>
      
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl mb-4">Latest Lyrics</h2>
        <ul className="list-disc pl-5">
          {posts.map((post) => (
            <li key={post.id} className="mb-2">
              <a 
                href={`/lyrics/${post.slug}`} 
                className="text-lg text-blue-600 hover:underline"
              >
                {/* We use a regular expression to clean up the title from WordPress */}
                {post.title.rendered.replace(/ \|/g, ' ')}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}