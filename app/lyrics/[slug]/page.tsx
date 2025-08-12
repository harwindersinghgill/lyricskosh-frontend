// app/lyrics/[slug]/page.tsx
import { getPostBySlug } from "@/lib/data-fetching";
import { notFound } from "next/navigation";

// If you previously exported `runtime = 'edge'`, it's fine to keep it if you need edge.
// export const runtime = 'edge';

export default async function LyricPage(props: any) {
  const slug = props?.params?.slug;
  if (!slug) {
    return notFound();
  }

  const post = await getPostBySlug(String(slug));
  if (!post) {
    return notFound();
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
