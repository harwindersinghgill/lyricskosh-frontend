// app/lyrics/[slug]/page.tsx
import { getPostBySlug } from "@/lib/data-fetching";

// Define the correct props interface directly in the file.
interface LyricPageProps {
  params: {
    slug: string;
  };
}

export default async function LyricPage({ params }: LyricPageProps) {
  const post = await getPostBySlug(params.slug);

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