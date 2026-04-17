import { NextRequest, NextResponse } from 'next/server';
import { savePost, getAllPosts } from '@/lib/posts';
import matter from 'gray-matter';
import path from 'path';

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawContent = formData.get('content') as string | null;
    const slug = formData.get('slug') as string | null;

    let content = '';
    let filename = '';

    if (file) {
      content = await file.text();
      filename = file.name.replace(/\.md$/, '');
    } else if (rawContent && slug) {
      content = rawContent;
      filename = slug;
    } else {
      return NextResponse.json({ error: '缺少文章内容或文件' }, { status: 400 });
    }

    // Validate front matter
    const { data } = matter(content);
    if (!data.title) {
      return NextResponse.json({ error: '文章缺少 title 字段' }, { status: 400 });
    }

    // Sanitize filename
    const safeSlug = filename
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    savePost(safeSlug, content);

    return NextResponse.json({
      success: true,
      slug: safeSlug,
      title: data.title,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: '缺少 slug' }, { status: 400 });

    const fs = await import('fs');
    const postPath = path.join(process.cwd(), 'posts', `${slug}.md`);
    if (fs.existsSync(postPath)) {
      fs.unlinkSync(postPath);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
