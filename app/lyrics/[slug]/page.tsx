// app/lyrics/[slug]/page.tsx
import { getAllPosts, getPostBySlug } from "@/lib/data-fetching";
import { notFound } from "next/navigation";

// This new function fetches all slugs at build time to pre-render the pages
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function LyricPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound(); // Use Next.js's built-in 404 page
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