import re

WIKI_LINK_PATTERN = re.compile(r"\[\[([^\[\]\n]+)\]\]")


def extract_wiki_links(content: str) -> list[str]:
    links: list[str] = []
    seen: set[str] = set()
    for match in WIKI_LINK_PATTERN.findall(content):
        title = " ".join(match.strip().split())
        key = title.casefold()
        if title and key not in seen:
            links.append(title)
            seen.add(key)
    return links
