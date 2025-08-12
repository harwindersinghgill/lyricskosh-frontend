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
async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?_fields=id,title,slug`);
  
  // Check if the request was successful
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data from WordPress');
  }

  // Parse the JSON response
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