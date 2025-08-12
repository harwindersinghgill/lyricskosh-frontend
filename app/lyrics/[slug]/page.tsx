// app/lyrics/[slug]/page.tsx
import { getPostBySlug } from "@/lib/data-fetching";

// This is the simplified component definition that resolves the build error.
export default async function LyricPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    // This could be replaced with a call to notFound() from 'next/navigation'
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
          className="prose lg:prose-xl" // Basic styling for the content
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </div>
    </main>
  );
}