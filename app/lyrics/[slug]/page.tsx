// app/lyrics/[slug]/page.tsx

// Tell Next/Cloudflare to run this route on the Edge runtime.
export const runtime = 'edge';

import { getPostBySlug } from "@/lib/data-fetching";

export default async function LyricPage(props: any) {
  const slug = props?.params?.slug;

  if (!slug) {
    return <div>Post not found.</div>;
  }
  
  const post = await getPostBySlug(slug);

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