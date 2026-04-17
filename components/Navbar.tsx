'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Rss, Music, Tag, User, Upload, Home } from 'lucide-react';

const navLinks = [
  { href: '/', label: '首页', icon: Home },
  { href: '/tags', label: '标签', icon: Tag },
  { href: '/music', label: '音乐', icon: Music },
  { href: '/about', label: '关于', icon: User },
  { href: '/admin', label: '导入', icon: Upload },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#21262d] bg-[#0d1117]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#f5c842] flex items-center justify-center shadow-lg shadow-[#f5c842]/20 group-hover:shadow-[#f5c842]/40 transition-shadow">
              <span className="text-[#0d1117] text-xl font-black leading-none">⚽</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white leading-tight tracking-tight">每日足球简报</p>
              <p className="text-[10px] text-[#8b949e] leading-tight">Football Daily Briefing</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-[#f5c842]/10 text-[#f5c842]'
                      : 'text-[#8b949e] hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* RSS + Mobile toggle */}
          <div className="flex items-center gap-2">
            <a
              href="/api/rss"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-[#f5c842] hover:border-[#f5c842]/30 text-xs font-medium transition-all"
              title="RSS订阅"
            >
              <Rss size={13} />
              RSS
            </a>
            <button
              className="md:hidden p-2 text-[#8b949e] hover:text-white"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#21262d] bg-[#0d1117] px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active ? 'bg-[#f5c842]/10 text-[#f5c842]' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
