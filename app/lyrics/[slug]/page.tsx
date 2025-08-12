// app/lyrics/[slug]/page.tsx
import { getPostBySlug } from "@/lib/data-fetching";
import { notFound } from "next/navigation";

export default async function LyricPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl">
        <h1
          className="text-4xl font-bold mb-8 text-center"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div
          className="prose lg:prose-xl dark:prose-invert" // Added dark mode prose styles
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </div>
    </main>
  );
}