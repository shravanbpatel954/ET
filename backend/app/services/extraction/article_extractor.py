"""Web article content extraction service."""

import asyncio
import re
from datetime import datetime
from html import unescape
from urllib.parse import urlparse

import httpx
from loguru import logger

from app.core.config import Settings
from app.core.ingestion_exceptions import ExtractionException
from app.ingestion.dto import ExtractionResult
from app.interfaces.extractor import IArticleExtractor


class ArticleExtractor(IArticleExtractor):
    """Fetches and extracts article content from news URLs."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def extract(self, url: str) -> ExtractionResult:
        html = await self._fetch_html(url)
        title, content, publish_date, metadata = await asyncio.to_thread(self._parse_html, html, url)

        if not content or len(content.strip()) < self._settings.min_text_length:
            raise ExtractionException(
                message="Insufficient article content extracted from URL",
                details={"url": url},
            )

        return ExtractionResult(
            content=content,
            title=title,
            source=url,
            publish_date=publish_date,
            metadata=metadata,
        )

    async def _fetch_html(self, url: str) -> str:
        headers = {"User-Agent": self._settings.article_user_agent}
        try:
            async with httpx.AsyncClient(
                timeout=self._settings.article_fetch_timeout,
                follow_redirects=True,
            ) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.text
        except httpx.HTTPError as exc:
            logger.warning("Article fetch failed for {}: {}", url, exc)
            raise ExtractionException(
                message="Failed to fetch article URL",
                details={"url": url, "error": str(exc)},
            ) from exc

    def _parse_html(self, html: str, url: str) -> tuple[str | None, str, datetime | None, dict]:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")

        title = None
        if soup.title and soup.title.string:
            title = unescape(soup.title.string.strip())

        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = unescape(og_title["content"].strip())

        publish_date = self._extract_publish_date(soup)
        metadata = self._extract_page_metadata(soup, url, title)
        content = self._extract_body_text(soup)

        # Fallback for SPAs (like React portfolios) that rely on client-side JS rendering.
        if not content or len(content.strip()) < self._settings.min_text_length:
            meta_desc_parts = []
            for name in [
                "description",
                "og:description",
                "twitter:description",
                "keywords",
                "application-name",
                "author",
            ]:
                tag = soup.find("meta", attrs={"name": name}) or soup.find("meta", attrs={"property": name})
                if tag and tag.get("content"):
                    meta_desc_parts.append(unescape(tag["content"].strip()))
            if meta_desc_parts:
                content = "\n".join(meta_desc_parts)

        if not content or len(content.strip()) < self._settings.min_text_length:
            visible_chunks = []
            for tag in soup.find_all(["title", "meta", "a", "button", "span", "div"]):
                if tag.name == "meta":
                    value = tag.get("content")
                    if value:
                        visible_chunks.append(unescape(value.strip()))
                    continue
                text = tag.get_text(separator=" ", strip=True)
                if text and len(text) > 2:
                    visible_chunks.append(unescape(text))
            content = "\n".join(dict.fromkeys(visible_chunks))

        if not title:
            title = urlparse(url).netloc

        return title, content, publish_date, metadata

    def _extract_page_metadata(self, soup, url: str, title: str | None) -> dict:
        parsed = urlparse(url)

        def meta_value(*names: str) -> str | None:
            for name in names:
                tag = soup.find("meta", attrs={"name": name}) or soup.find("meta", attrs={"property": name})
                if tag and tag.get("content"):
                    return unescape(tag["content"].strip())
            return None

        canonical_tag = soup.find("link", rel=lambda value: value and "canonical" in value)
        canonical = canonical_tag.get("href") if canonical_tag else None
        links = [
            tag.get("href") for tag in soup.find_all("a", href=True)
            if tag.get("href")
        ]
        scripts = [
            tag.get("src") for tag in soup.find_all("script", src=True)
            if tag.get("src")
        ]
        forms = soup.find_all("form")
        password_fields = soup.find_all("input", attrs={"type": "password"})

        return {
            "domain": parsed.netloc,
            "scheme": parsed.scheme,
            "path": parsed.path,
            "page_title": title,
            "description": meta_value("description", "og:description", "twitter:description"),
            "keywords": meta_value("keywords"),
            "author": meta_value("author"),
            "canonical_url": canonical,
            "form_count": len(forms),
            "password_field_count": len(password_fields),
            "link_count": len(links),
            "script_count": len(scripts),
            "external_link_count": sum(1 for link in links if link.startswith(("http://", "https://")) and parsed.netloc not in link),
            "external_script_count": sum(1 for script in scripts if script.startswith(("http://", "https://")) and parsed.netloc not in script),
        }

    def _extract_publish_date(self, soup) -> datetime | None:
        for attr in ("article:published_time", "og:published_time"):
            tag = soup.find("meta", property=attr)
            if tag and tag.get("content"):
                try:
                    return datetime.fromisoformat(tag["content"].replace("Z", "+00:00"))
                except ValueError:
                    continue
        time_tag = soup.find("time")
        if time_tag and time_tag.get("datetime"):
            try:
                return datetime.fromisoformat(time_tag["datetime"].replace("Z", "+00:00"))
            except ValueError:
                return None
        return None

    def _extract_body_text(self, soup) -> str:
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
            tag.decompose()

        article = soup.find("article")
        container = article or soup.find("main") or soup.body or soup
        paragraphs = [
            unescape(p.get_text(separator=" ", strip=True))
            for p in container.find_all(["p", "h1", "h2", "h3", "li"])
        ]
        text = "\n".join(p for p in paragraphs if p)
        if not text:
            text = container.get_text(separator="\n", strip=True)

        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
