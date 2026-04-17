import { getAllTags, getAllPosts } from '@/lib/posts';
import Link from 'next/link';
import { Tag, Hash } from 'lucide-react';

export default function TagsPage() {
  const tags = getAllTags();
  const posts = getAllPosts();

  const maxCount = Math.max(...tags.map(t => t.count), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#f5c842] text-sm font-medium mb-2">
          <Tag size={14} />
          标签分类
        </div>
        <h1 className="text-3xl font-black text-white mb-2">所有标签</h1>
        <p className="text-[#8b949e]">共 {tags.length} 个标签，{posts.length} 篇文章</p>
      </div>

      {/* Tag cloud */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-[#8b949e] mb-4 uppercase tracking-wider">标签云</h2>
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => {
            const size = 0.85 + (count / maxCount) * 0.6;
            return (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#21262d] text-[#8b949e] hover:text-[#f5c842] hover:border-[#f5c842]/30 hover:bg-[#f5c842]/5 transition-all"
                style={{ fontSize: `${size}rem` }}
              >
                <Hash size={Math.round(10 + (count / maxCount) * 4)} />
                {tag}
                <span className="text-xs opacity-60">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tags list */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tags.map(({ tag, count }) => {
          const tagPosts = posts.filter(p => p.tags.includes(tag));
          return (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group bg-[#161b22] border border-[#21262d] rounded-xl p-4 hover:border-[#f5c842]/30 hover:bg-[#161b22]/80 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f5c842]/10 border border-[#f5c842]/20 flex items-center justify-center">
                  <Hash size={16} className="text-[#f5c842]" />
                </div>
                <span className="text-2xl font-black text-[#f5c842]">{count}</span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-[#f5c842] transition-colors mb-1">
                {tag}
              </h3>
              <p className="text-xs text-[#8b949e]">
                {tagPosts.slice(0, 2).map(p => p.title).join('、').slice(0, 40)}
                {tagPosts.length > 2 ? '...' : ''}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
