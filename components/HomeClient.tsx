'use client';

import { useState } from 'react';
import { PostMeta } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import { Tag, Search, X } from 'lucide-react';

interface HomeClientProps {
  posts: PostMeta[];
  tags: { tag: string; count: number }[];
}

export default function HomeClient({ posts, tags }: HomeClientProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = posts.filter(post => {
    const matchTag = !selectedTag || post.tags.includes(selectedTag);
    const matchSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#21262d]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(10,79,46,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,200,66,0.06),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5c842]/10 border border-[#f5c842]/20 text-[#f5c842] text-xs font-medium mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5c842] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f5c842]"></span>
              </span>
              每日更新 · 最新赛报
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              每日足球<span className="text-[#f5c842]">简报</span>
            </h1>
            <p className="text-[#8b949e] text-lg leading-relaxed">
              聚焦全球顶级联赛与赛事，每天为你带来最新的赛事简报、战术分析与转会动态。
            </p>
            <p className="text-sm text-[#8b949e]/60 mt-2">共 {posts.length} 篇文章</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
              <input
                type="text"
                placeholder="搜索文章标题或摘要..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#161b22] border border-[#21262d] rounded-xl text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-[#f5c842]/40 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Active filter */}
            {(selectedTag || searchQuery) && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <span className="text-[#8b949e]">筛选结果：</span>
                {selectedTag && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5c842]/10 text-[#f5c842] border border-[#f5c842]/20">
                    <Tag size={11} />
                    {selectedTag}
                    <button onClick={() => setSelectedTag(null)} className="ml-1 hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                )}
                <span className="text-[#8b949e]">{filtered.length} 篇</span>
              </div>
            )}

            {/* Posts */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-[#8b949e]">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-medium">暂无匹配的文章</p>
                <p className="text-sm mt-1">试试其他关键词或标签</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.length > 0 && (
                  <PostCard post={filtered[0]} featured />
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {filtered.slice(1).map(post => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 space-y-6">
            {/* Tags cloud */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Tag size={14} className="text-[#f5c842]" />
                文章标签
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!selectedTag
                    ? 'bg-[#f5c842]/10 text-[#f5c842] border-[#f5c842]/20'
                    : 'bg-transparent text-[#8b949e] border-[#21262d] hover:border-[#f5c842]/30 hover:text-white'
                    }`}
                >
                  全部 ({posts.length})
                </button>
                {tags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTag === tag
                      ? 'bg-[#f5c842]/10 text-[#f5c842] border-[#f5c842]/20'
                      : 'bg-transparent text-[#8b949e] border-[#21262d] hover:border-[#f5c842]/30 hover:text-white'
                      }`}
                  >
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">博客统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8b949e]">文章总数</span>
                  <span className="text-sm font-bold text-[#f5c842]">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8b949e]">标签总数</span>
                  <span className="text-sm font-bold text-[#f5c842]">{tags.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8b949e]">最新更新</span>
                  <span className="text-sm font-bold text-white">{posts[0]?.date || '-'}</span>
                </div>
              </div>
            </div>

            {/* Featured Tags links */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">热门赛事</h3>
              <div className="space-y-2">
                {['欧冠', '英超', '西甲', '世界杯'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t === selectedTag ? null : t)}
                    className="w-full flex justify-between items-center text-sm text-[#8b949e] hover:text-white transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] group-hover:scale-125 transition-transform" />
                      {t}
                    </span>
                    <span className="text-xs">
                      {posts.filter(p => p.tags.includes(t)).length} 篇
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
