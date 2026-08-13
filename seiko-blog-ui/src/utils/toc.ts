export interface Heading {
  level: number;
  text: string;
  id: string;
  /** 标题在 markdown 原文中的行号（从 1 开始） */
  line: number;
}

/**
 * 移除 markdown 内联标记，保留纯文本
 */
export function stripMarkdown(text: string): string {
  return (
    text
      // 内联代码 `code`
      .replace(/`([^`]+)`/g, "$1")
      // 粗体 **text**
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      // 斜体 *text*
      .replace(/\*([^*]+)\*/g, "$1")
      // 链接 [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // 删除线 ~~text~~
      .replace(/~~([^~]+)~~/g, "$1")
      // HTML 标签
      .replace(/<[^>]+>/g, "")
  );
}

/**
 * 将文本转换为 URL-friendly 的 ID
 * 保留中文字符，空格转连字符，移除特殊字符
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s一-龥-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/**
 * 从 markdown 内容中提取 h1-h3 标题
 * 自动处理重复 slug（加 -1, -2 后缀）
 * 自动跳过围栏代码块（fenced code block）中的内容
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  let inCodeBlock = false;

  content.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;

    // 围栏代码块开始/结束：行首三个或以上反引号/波浪线
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    // 跳过代码块内的行（避免把代码注释 #... 误当成标题）
    if (inCodeBlock) return;

    // 匹配 h1-h3：行首的 # 标记 + 空格 + 内容
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) return;

    const level = match[1].length;
    const rawText = stripMarkdown(match[2].trim());
    if (!rawText) return;

    const baseSlug = slugify(rawText);
    // 如果 slug 为空（比如全是特殊字符），用行号兜底
    const slug = baseSlug || `heading-${headings.length}`;

    const count = seen.get(slug) || 0;
    const id = count > 0 ? `${slug}-${count}` : slug;
    seen.set(slug, count + 1);

    headings.push({ level, text: rawText, id, line: lineNumber });
  });

  return headings;
}
