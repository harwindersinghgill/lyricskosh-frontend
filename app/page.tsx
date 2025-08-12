// app/page.tsx
import { getPostsByCategory } from "@/lib/data-fetching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function HomePage() {
  // Fetch posts for each language category in parallel
  const [hindiPosts, punjabiPosts, tamilPosts] = await Promise.all([
    getPostsByCategory("hindi"),
    getPostsByCategory("punjabi"),
    getPostsByCategory("tamil"),
  ]);

  return (
    <main className="flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center my-8">
            <h1 className="text-5xl font-extrabold tracking-tight">A Treasury of Lyrics</h1>
            <p className="mt-4 text-lg text-secondary dark:text-dark-secondary">Discover the words behind the music.</p>
        </div>
        
        <Tabs defaultValue="hindi" className="w-full mt-12">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/20 dark:bg-dark-secondary/20">
            <TabsTrigger value="hindi">Hindi</TabsTrigger>
            <TabsTrigger value="punjabi">Punjabi</TabsTrigger>
            <TabsTrigger value="tamil">Tamil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hindi">
            <PostList posts={hindiPosts} />
          </TabsContent>
          <TabsContent value="punjabi">
            <PostList posts={punjabiPosts} />
          </TabsContent>
          <TabsContent value="tamil">
            <PostList posts={tamilPosts} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

// A reusable component to display a list of posts in cards
function PostList({ posts }: { posts: Awaited<ReturnType<typeof getPostsByCategory>> }) {
  if (posts.length === 0) {
    return <p className="text-center text-secondary dark:text-dark-secondary py-8">No posts available in this category.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {posts.map((post) => (
        <a href={`/lyrics/${post.slug}`} key={post.id} className="block">
          <Card className="h-full bg-background/50 dark:bg-dark-background/50 hover:bg-secondary/20 dark:hover:bg-dark-secondary/20 transition-colors">
            <CardHeader>
              <CardTitle 
                className="text-lg font-semibold"
                dangerouslySetInnerHTML={{ __html: post.title.rendered.split(' | ')[0] }}
              />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary dark:text-dark-secondary"
                 dangerouslySetInnerHTML={{ __html: post.title.rendered.split(' | ')[1] || '' }}
              />
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}