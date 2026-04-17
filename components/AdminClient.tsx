'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, FileText, Trash2, Eye, Check,
  AlertCircle, Plus, RefreshCw, ChevronRight,
  Tag
} from 'lucide-react';
import Link from 'next/link';

interface PostSummary {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  author: string;
  excerpt: string;
}

const TEMPLATE = `---
title: "文章标题"
date: "${new Date().toISOString().split('T')[0]}"
tags: ["欧冠", "英超"]
excerpt: "文章摘要，一两句话描述主要内容"
author: "足球简报编辑部"
---

# 文章标题

在这里写正文内容，支持完整的 Markdown 语法。

## 比赛概况

...

## 数据分析

| 数据项 | 主队 | 客队 |
|--------|------|------|
| 控球率 | 55% | 45% |

> 引用内容

**加粗** *斜体* \`代码\`
`;

export default function AdminClient() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'write' | 'manage'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [editorContent, setEditorContent] = useState(TEMPLATE);
  const [preview, setPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setMessage({ type: 'error', text: '获取文章列表失败' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      showMessage('error', '仅支持 .md 或 .markdown 文件');
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/posts', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `《${data.title}》已成功导入！`);
        fetchPosts();
      } else {
        showMessage('error', data.error || '导入失败');
      }
    } catch {
      showMessage('error', '网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  };

  const handleWriteSubmit = async () => {
    if (!editorContent.trim()) return;
    setUploading(true);
    const titleMatch = editorContent.match(/title:\s*["']?([^"'\n]+)["']?/);
    const title = titleMatch?.[1] || 'untitled';
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);

    const form = new FormData();
    form.append('content', editorContent);
    form.append('slug', slug);
    try {
      const res = await fetch('/api/posts', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `《${data.title}》发布成功！`);
        setEditorContent(TEMPLATE);
        fetchPosts();
        setActiveTab('manage');
      } else {
        showMessage('error', data.error || '发布失败');
      }
    } catch {
      showMessage('error', '网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`确定要删除《${title}》吗？此操作不可撤销。`)) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', '文章已删除');
        fetchPosts();
      } else {
        showMessage('error', data.error || '删除失败');
      }
    } catch {
      showMessage('error', '删除失败');
    }
  };

  const tabs = [
    { id: 'upload', label: '上传文件', icon: Upload },
    { id: 'write', label: '在线撰写', icon: FileText },
    { id: 'manage', label: `文章管理 (${posts.length})`, icon: FileText },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">后台管理</h1>
          <p className="text-sm text-[#8b949e]">导入、撰写和管理博客文章</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#30363d] transition-all"
        >
          <Eye size={14} />
          查看博客
        </Link>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#161b22] border border-[#21262d] rounded-xl mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === id
                ? 'bg-[#f5c842]/10 text-[#f5c842] border border-[#f5c842]/20'
                : 'text-[#8b949e] hover:text-white'
              }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
              ${dragOver
                ? 'border-[#f5c842]/60 bg-[#f5c842]/5'
                : 'border-[#21262d] hover:border-[#f5c842]/30 hover:bg-[#f5c842]/2 bg-[#161b22]'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={32} className="text-[#f5c842] animate-spin" />
                <p className="text-white font-medium">正在导入...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#f5c842]/10 border border-[#f5c842]/20 flex items-center justify-center">
                  <Upload size={28} className="text-[#f5c842]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg mb-1">拖拽或点击上传 Markdown 文件</p>
                  <p className="text-sm text-[#8b949e]">支持 .md / .markdown 格式，可批量上传</p>
                </div>
              </div>
            )}
          </div>

          {/* Format guide */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileText size={14} className="text-[#f5c842]" />
              Markdown 文件格式要求
            </h3>
            <pre className="text-xs text-[#8b949e] font-mono leading-relaxed overflow-x-auto bg-[#0d1117] rounded-lg p-4">{`---
title: "文章标题"          # 必填
date: "2025-04-15"         # 必填 YYYY-MM-DD
tags: ["欧冠", "英超"]     # 标签数组
excerpt: "摘要"            # 列表页显示的简介
author: "作者名"           # 作者
---

# 正文标题

正文内容支持全部 GFM Markdown 语法...`}</pre>
          </div>
        </div>
      )}

      {/* Tab: Write */}
      {activeTab === 'write' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPreview(false)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${!preview
                  ? 'border-[#f5c842]/20 bg-[#f5c842]/10 text-[#f5c842]'
                  : 'border-[#21262d] text-[#8b949e] hover:text-white'}`}
              >
                编辑
              </button>
              <button
                onClick={() => setPreview(true)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all flex items-center gap-1.5 ${preview
                  ? 'border-[#f5c842]/20 bg-[#f5c842]/10 text-[#f5c842]'
                  : 'border-[#21262d] text-[#8b949e] hover:text-white'}`}
              >
                <Eye size={13} />
                预览 Frontmatter
              </button>
            </div>
            <button
              onClick={handleWriteSubmit}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f5c842] text-[#0d1117] font-semibold text-sm hover:bg-[#f5c842]/90 transition-all disabled:opacity-50"
            >
              {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              发布文章
            </button>
          </div>

          {!preview ? (
            <textarea
              value={editorContent}
              onChange={e => setEditorContent(e.target.value)}
              className="w-full h-[60vh] bg-[#161b22] border border-[#21262d] rounded-2xl p-5 text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-[#f5c842]/30 resize-none"
              placeholder="在此输入 Markdown 内容..."
            />
          ) : (
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 h-[60vh] overflow-auto">
              <pre className="text-sm text-[#8b949e] font-mono whitespace-pre-wrap">{editorContent}</pre>
            </div>
          )}
          <p className="text-xs text-[#8b949e]">
            字数：{editorContent.length} 字符 · 行数：{editorContent.split('\n').length} 行
          </p>
        </div>
      )}

      {/* Tab: Manage */}
      {activeTab === 'manage' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#8b949e]">共 {posts.length} 篇文章</p>
            <button
              onClick={fetchPosts}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white transition-all"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-[#161b22] border border-[#21262d] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-[#161b22] border border-dashed border-[#21262d] rounded-2xl">
              <p className="text-3xl mb-3">📝</p>
              <p className="text-white font-medium">暂无文章</p>
              <p className="text-sm text-[#8b949e] mt-1">切换到「上传文件」或「在线撰写」来添加文章</p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map(post => (
                <div
                  key={post.slug}
                  className="flex items-center gap-4 p-4 bg-[#161b22] border border-[#21262d] rounded-xl hover:border-[#21262d]/80 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">{post.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <Tag size={9} />
                        {post.tags.slice(0, 3).join(' · ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="p-2 text-[#8b949e] hover:text-[#f5c842] transition-colors"
                      title="查看文章"
                    >
                      <ChevronRight size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug, post.title)}
                      className="p-2 text-[#8b949e] hover:text-red-400 transition-colors"
                      title="删除文章"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
