import { getAllPosts, getAllTags } from '@/lib/posts';
import Link from 'next/link';
import { Globe, Newspaper, Tag, Music, Mail, Code2, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  const leagues = [
    { name: '英超', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', desc: '英格兰顶级职业联赛' },
    { name: '西甲', icon: '🇪🇸', desc: '西班牙足球甲级联赛' },
    { name: '德甲', icon: '🇩🇪', desc: '德国足球甲级联赛' },
    { name: '意甲', icon: '🇮🇹', desc: '意大利足球甲级联赛' },
    { name: '法甲', icon: '🇫🇷', desc: '法国足球甲级联赛' },
    { name: '欧冠', icon: '🏆', desc: 'UEFA冠军联赛' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="relative bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(10,79,46,0.4),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,200,66,0.08),transparent_70%)]" />
        <div className="relative p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#f5c842] flex items-center justify-center shadow-lg shadow-[#f5c842]/20 text-4xl flex-shrink-0">
              ⚽
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">每日足球简报</h1>
              <p className="text-[#8b949e] text-lg leading-relaxed max-w-xl">
                一个由足球爱好者创立的独立博客，专注于记录和分析全球顶级足球赛事。
                每天更新，为你带来最鲜活的赛事资讯。
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: '文章总数', value: posts.length, icon: Newspaper },
              { label: '标签分类', value: tags.length, icon: Tag },
              { label: '覆盖联赛', value: 6, icon: Globe },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-[#f5c842] mb-1">{value}+</div>
                <div className="text-xs text-[#8b949e] flex items-center justify-center gap-1">
                  <Icon size={11} />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About content */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Mission */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-[#f5c842]">🎯</span>
            我们的使命
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed">
            每日足球简报致力于为中文球迷提供高质量的足球资讯。我们深信，好的足球报道不应只是比分和进球，
            更应包含战术分析、球员表现、赛事背景与故事。
          </p>
          <p className="text-sm text-[#8b949e] leading-relaxed mt-3">
            我们的团队由一群真正热爱足球的人组成，每一篇文章都经过认真筛选与撰写。
          </p>
        </div>

        {/* Features */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-[#f5c842]">✨</span>
            博客特色
          </h2>
          <ul className="space-y-2 text-sm text-[#8b949e]">
            {[
              '每日更新顶级联赛赛事简报',
              '深度战术与技战术分析',
              '转会市场最新动态与估值数据',
              '世界杯预选赛实时追踪',
              '内置音乐播放器，阅读时享受足球旋律',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#f5c842] mt-0.5 flex-shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Covered leagues */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">覆盖赛事</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {leagues.map(({ name, icon, desc }) => (
            <Link
              key={name}
              href={`/tags/${encodeURIComponent(name)}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-[#21262d] hover:border-[#f5c842]/30 hover:bg-[#f5c842]/5 transition-all group"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-[#f5c842] transition-colors">{name}</p>
                <p className="text-xs text-[#8b949e]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">联系我们</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '发送邮件', icon: Mail, href: 'mailto:football@example.com', color: 'text-red-400' },
            { label: 'GitHub', icon: Code2, href: 'https://github.com', color: 'text-white' },
            { label: 'Twitter/X', icon: MessageCircle, href: 'https://x.com', color: 'text-sky-400' },
            { label: '音乐播放', icon: Music, href: '/music', color: 'text-[#f5c842]' },
          ].map(({ label, icon: Icon, href, color }) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-[#21262d] ${color} hover:border-current/30 hover:bg-current/5 text-sm font-medium transition-all`}
            >
              <Icon size={15} />
              {label}
            </a>
          ))}
        </div>
        <p className="text-sm text-[#8b949e] mt-4">
          如有投稿、合作或任何建议，欢迎通过上述方式联系我们。我们会在 24 小时内回复。
        </p>
      </div>
    </div>
  );
}
