export function toMarkdownWikiLinks(content: string): string {
  return content.replace(/\[\[([^\[\]\n]+)\]\]/g, (_, rawTitle: string) => {
    const title = rawTitle.trim().replace(/\s+/g, " ");
    if (!title) return rawTitle;
    return `[${title}](#wiki:${encodeURIComponent(title)})`;
  });
}

export function wikiTitleFromHref(href: string | undefined): string | null {
  if (!href?.startsWith("#wiki:")) return null;
  return decodeURIComponent(href.slice(6));
}
