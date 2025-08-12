// app/lyrics/[slug]/page.tsx

// Define a more explicit type for the page's props, as expected by Next.js
type PageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Define the type for a single post's data
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

// This is the main component for the lyrics page. Note the updated type for props.
export default async function LyricPage({ params }: PageProps) {
  const post = await getPost(params.slug);

  // Add a check in case a post is not found
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