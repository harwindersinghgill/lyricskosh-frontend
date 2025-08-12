// app/page.tsx
import { getPostsByCategory } from "@/lib/data-fetching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function HomePage() {
  const [malayalamPosts, hindiPosts, punjabiPosts] = await Promise.all([
    getPostsByCategory("malayalam"),
    getPostsByCategory("hindi"),
    getPostsByCategory("punjabi"),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center my-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-hover dark:from-dark-primary dark:to-dark-hover">
            A Treasury of Lyrics
          </h1>
          <p className="mt-4 text-lg text-secondary dark:text-dark-secondary">Discover the words behind the music.</p>
      </div>
      
      <Tabs defaultValue="malayalam" className="w-full mt-12">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/10 dark:bg-dark-secondary/10">
          <TabsTrigger value="malayalam">Malayalam</TabsTrigger>
          <TabsTrigger value="hindi">Hindi</TabsTrigger>
          <TabsTrigger value="punjabi">Punjabi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="malayalam">
          <PostGrid posts={malayalamPosts} />
        </TabsContent>
        <TabsContent value="hindi">
          <PostGrid posts={hindiPosts} />
        </TabsContent>
        <TabsContent value="punjabi">
          <PostGrid posts={punjabiPosts} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function PostGrid({ posts }: { posts: Awaited<ReturnType<typeof getPostsByCategory>> }) {
  if (!posts || posts.length === 0) {
    return <p className="text-center text-secondary dark:text-dark-secondary py-12">No posts available in this category.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
      {posts.map((post) => {
        const titleParts = post.title.rendered.split(' | ');
        const songTitle = titleParts[0];
        const artists = titleParts.slice(1).join(', ');

        return (
          <a href={`/lyrics/${post.slug}`} key={post.id} className="block group">
            <Card className="h-full border-secondary/20 dark:border-dark-secondary/20 group-hover:border-primary dark:group-hover:border-dark-primary transition-all duration-300 transform group-hover:scale-105">
              <CardHeader>
                <CardTitle 
                  className="text-lg font-bold text-text dark:text-dark-text"
                  dangerouslySetInnerHTML={{ __html: songTitle }}
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary dark:text-dark-secondary truncate"
                   dangerouslySetInnerHTML={{ __html: artists }}
                />
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
}