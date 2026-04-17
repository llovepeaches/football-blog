import { getAllPosts, getAllTags } from '@/lib/posts';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return <HomeClient posts={posts} tags={tags} />;
}
