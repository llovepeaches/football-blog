'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#30363d] transition-all"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Share2 size={13} />}
      {copied ? '已复制链接' : '分享'}
    </button>
  );
}
