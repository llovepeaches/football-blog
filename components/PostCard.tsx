import Link from 'next/link';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { PostMeta } from '@/lib/posts';

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const tagColors: Record<string, string> = {
    '欧冠': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    '英超': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    '西甲': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    '德甲': 'bg-red-500/10 text-red-400 border-red-500/20',
    '世界杯': 'bg-[#f5c842]/10 text-[#f5c842] border-[#f5c842]/20',
    '转会市场': 'bg-green-500/10 text-green-400 border-green-500/20',
  };
  const defaultTagColor = 'bg-[#21262d] text-[#8b949e] border-[#30363d]';

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group block rounded-2xl border border-[#21262d] bg-[#161b22] hover:border-[#f5c842]/30 hover:bg-[#161b22]/80 transition-all duration-300 overflow-hidden
        ${featured ? 'md:flex' : ''}`}
    >
      {/* Cover placeholder with gradient */}
      <div className={`relative overflow-hidden ${featured ? 'md:w-2/5 h-48 md:h-auto' : 'h-44'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a4f2e]/80 to-[#0d1117] flex items-center justify-center">
          <span className="text-6xl opacity-20 select-none">⚽</span>
        </div>
        {/* Tag badge on cover */}
        {post.tags[0] && (
          <div className="absolute top-3 left-3">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tagColors[post.tags[0]] || defaultTagColor}`}>
              {post.tags[0]}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#f5c842]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col ${featured ? 'md:p-7 flex-1' : ''}`}>
        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-[#8b949e] mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <User size={11} />
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h2 className={`font-bold text-white group-hover:text-[#f5c842] transition-colors mb-2 leading-snug line-clamp-2
          ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}>
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-[#8b949e] line-clamp-2 leading-relaxed mb-4 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {post.tags.map(tag => (
            <span
              key={tag}
              className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${tagColors[tag] || defaultTagColor}`}
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[#8b949e] group-hover:text-[#f5c842] transition-colors">
            阅读全文
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
