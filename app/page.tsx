// app/page.tsx
import { getAllPosts } from "@/lib/data-fetching";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <main className="flex flex-col items-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center my-12">
            <h1 className="text-5xl font-extrabold tracking-tight">A Treasury of Lyrics</h1>
            <p className="mt-4 text-lg text-secondary dark:text-dark-secondary">Discover the words behind the music.</p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold border-b-2 border-primary dark:border-dark-primary pb-2 mb-6">Latest Lyrics</h2>
          
          {posts.length === 0 ? (
            <p className="text-secondary dark:text-dark-secondary">No posts available right now.</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <a 
                    href={`/lyrics/${post.slug}`} 
                    className="text-xl font-semibold hover:text-primary dark:hover:text-dark-primary transition-colors"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered.replace(/ \|/g, ' • ') }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}