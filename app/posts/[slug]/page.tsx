import { getPostBySlug, getAllPosts, markdownToHtml } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: '文章未找到' };
  return {
    title: `${post.title} | 每日足球简报`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const htmlContent = await markdownToHtml(post.content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Article */}
        <article className="flex-1 min-w-0">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-[#f5c842] transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            返回文章列表
          </Link>

          {/* Header */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden mb-8">
            {/* Cover */}
            <div className="relative h-48 sm:h-64 bg-gradient-to-br from-[#0a4f2e]/60 to-[#0d1117] flex items-center justify-center">
              <span className="text-8xl opacity-10 select-none">⚽</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent" />
            </div>

            {/* Meta */}
            <div className="p-6 sm:p-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#f5c842]/10 text-[#f5c842] border border-[#f5c842]/20 hover:bg-[#f5c842]/20 transition-colors"
                  >
                    <Tag size={10} />
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                {post.title}
              </h1>

              {/* Author & Date */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-sm text-[#8b949e]">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-[#f5c842]" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#f5c842]" />
                    {post.date}
                  </span>
                </div>
                <ShareButton title={post.title} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 sm:p-8">
            <div
              className="prose-football"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Tags footer */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-[#8b949e] mr-1">相关标签：</span>
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="text-sm px-3 py-1 rounded-full bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-[#f5c842] hover:border-[#f5c842]/30 transition-all"
              >
                # {tag}
              </Link>
            ))}
          </div>
        </article>

        {/* Sidebar TOC placeholder */}
        <aside className="lg:w-64 hidden lg:block">
          <div className="sticky top-24 bg-[#161b22] border border-[#21262d] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">文章信息</h3>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-[#8b949e] text-xs mb-0.5">发布时间</p>
                <p className="text-white font-medium">{post.date}</p>
              </div>
              <div>
                <p className="text-[#8b949e] text-xs mb-0.5">作者</p>
                <p className="text-white font-medium">{post.author}</p>
              </div>
              <div>
                <p className="text-[#8b949e] text-xs mb-1.5">标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="text-xs px-2 py-0.5 rounded-full bg-[#f5c842]/10 text-[#f5c842] border border-[#f5c842]/20 hover:bg-[#f5c842]/20 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
