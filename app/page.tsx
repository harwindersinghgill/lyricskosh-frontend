// app/page.tsx
import { getAllPosts } from "@/lib/data-fetching";

export default async function HomePage() {
  // getAllPosts() now returns [] instead of throwing on fetch errors
  const posts = await getAllPosts();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Lyricskosh</h1>

      <div className="w-full max-w-2xl">
        <h2 className="text-2xl mb-4">Latest Lyrics</h2>

        {posts.length === 0 ? (
          <p className="text-gray-600">No posts available right now.</p>
        ) : (
          <ul className="list-disc pl-5">
            {posts.map((post) => (
              <li key={post.id} className="mb-2">
                <a
                  href={`/lyrics/${post.slug}`}
                  className="text-lg text-blue-600 hover:underline"
                  // keep using dangerouslySetInnerHTML for the WP title HTML
                  dangerouslySetInnerHTML={{ __html: post.title.rendered.replace(/ \|/g, " ") }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
