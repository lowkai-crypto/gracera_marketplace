import json

import anthropic
import httpx
import trafilatura

from claude_util import get_client, strip_code_fence
from config import settings
from models import EXTRACTABLE_FIELDS, ExtractedField
from url_safety import UnsafeUrlError, assert_safe_url

MAX_REDIRECTS = 3
MAX_RESPONSE_BYTES = 2 * 1024 * 1024  # 2 MB
TIMEOUT_SECONDS = 10.0
MIN_TEXT_LENGTH = 200  # below this, not worth sending to Claude
USER_AGENT = "GraceraBot/1.0 (+https://gracera.ai; profile pre-fill)"


async def fetch_page(url: str) -> str:
    """Fetches `url` and returns its raw HTML.

    Manually follows redirects (rather than letting httpx auto-follow) so
    every hop can be checked against assert_safe_url — a redirect to an
    internal address is exactly the SSRF bypass this guards against.
    """
    assert_safe_url(url)
    current_url = url

    async with httpx.AsyncClient(follow_redirects=False, timeout=TIMEOUT_SECONDS) as client:
        for _ in range(MAX_REDIRECTS + 1):
            try:
                response = await client.get(current_url, headers={"User-Agent": USER_AGENT})
            except httpx.HTTPError as exc:
                raise ValueError(f"Could not fetch URL: {exc}") from exc

            if response.is_redirect:
                location = response.headers.get("location")
                if not location:
                    raise ValueError("Redirect response had no Location header")
                next_url = str(httpx.URL(current_url).join(location))
                assert_safe_url(next_url)
                current_url = next_url
                continue

            response.raise_for_status()
            content_length = response.headers.get("content-length")
            if content_length and int(content_length) > MAX_RESPONSE_BYTES:
                raise ValueError("Response too large")
            body = response.content[:MAX_RESPONSE_BYTES]
            return body.decode(response.encoding or "utf-8", errors="ignore")

        raise ValueError("Too many redirects")


EXTRACTION_PROMPT = """You are extracting factual business information from a
company's own website to help pre-fill their B2B marketplace profile.

Website text (main content only, boilerplate already stripped):
---
{page_text}
---

Extract these fields where the text supports them. For each field you can
find, return the value AND a confidence level:
- "high": stated explicitly and unambiguously
- "medium": stated but with some inference required
- "low": a guess based on indirect signals

Only include a field if you found some evidence for it — omit fields you
cannot support from the text at all. Do not invent or estimate business
data (MOQ, pricing, certifications) that isn't explicitly present.

Fields to look for:
- company_name (string)
- display_name (string — brand/trade name if different from legal name)
- tagline (string — a short one-line description, e.g. from a hero/meta description)
- description (string — a factual paragraph about what the company does)
- country (string — ISO 3166-1 alpha-2 code of headquarters, e.g. "KR")
- categories (array of strings — product/service categories)
- target_geographies (array of strings — ISO country codes they export/sell to, if stated)
- languages_spoken (array of strings — ISO 639-1 codes, inferred from site language(s) or content)
- certifications (array of strings — only if explicitly named, e.g. "ISO 9001", "FDA registered")
- primary_contact_email (string — a general business contact email, if listed)
- primary_contact_phone (string — a general business phone number, if listed)

Return a JSON object with this exact structure:
{{
  "fields": {{
    "<field_name>": {{"value": <string or array>, "confidence": "high"|"medium"|"low"}}
  }}
}}

Only return valid JSON. No commentary outside the JSON object.
"""


async def extract_fields_from_text(page_text: str) -> dict[str, ExtractedField]:
    client = get_client()
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1536,
            system="You extract factual business data from web page text. Return only valid JSON.",
            messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(page_text=page_text)}],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    text = strip_code_fence(response.content[0].text)
    try:
        raw = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned non-JSON output: {text!r}") from exc

    raw_fields = raw.get("fields", {})
    return {
        name: ExtractedField(**raw_fields[name])
        for name in EXTRACTABLE_FIELDS
        if name in raw_fields
    }


async def extract_website(url: str) -> tuple[dict[str, ExtractedField], list[str]]:
    """Fetches `url`, extracts readable text, and asks Claude to structure
    it into profile fields. Returns (fields, warnings)."""
    warnings: list[str] = []

    try:
        html = await fetch_page(url)
    except UnsafeUrlError:
        raise
    except ValueError as exc:
        return {}, [str(exc)]

    page_text = trafilatura.extract(html) or ""
    if len(page_text) < MIN_TEXT_LENGTH:
        # Likely a JS-rendered SPA we can't read without headless rendering
        # (deferred — see plan), or a genuinely thin page. Don't waste a
        # Claude call on near-empty input.
        warnings.append(
            "Couldn't extract much readable content from this page — it may require "
            "JavaScript to render. Try filling the form manually or use a different page."
        )
        return {}, warnings

    fields = await extract_fields_from_text(page_text)
    if not fields:
        warnings.append("No confident fields could be extracted from this page.")
    return fields, warnings
