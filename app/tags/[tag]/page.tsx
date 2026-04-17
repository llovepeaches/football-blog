import { getAllTags, getPostsByTag } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { Tag, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(t => ({ tag: encodeURIComponent(t.tag) }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return { title: `#${decoded} | 每日足球简报` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        href="/tags"
        className="inline-flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-[#f5c842] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        所有标签
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#f5c842]/10 border border-[#f5c842]/20 flex items-center justify-center">
          <Tag size={20} className="text-[#f5c842]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">#{decoded}</h1>
          <p className="text-sm text-[#8b949e]">{posts.length} 篇相关文章</p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
