import json

import anthropic

from claude_util import extract_text, get_client, strip_code_fence
from config import settings
from models import GeneratePublicPageResponse, PublicPageSection

GENERATE_PUBLIC_PAGE_PROMPT = """You are drafting factual, AEO-friendly public content for a
B2B supplier's marketplace profile page. This will be read by potential
buyers browsing the web AND by AI answer engines (someone asking an AI
assistant "who manufactures X").

Supplier profile data:
{profile_json}

Product lines:
{product_lines_json}

Write:
- headline: one line, specific (company name + what they make + where
  they are based)
- summary: 2-3 factual sentences overviewing the company
- sections: 2-4 sections such as "Capabilities", "Certifications &
  Quality", "Markets Served" -- each with a heading and a factual body
  paragraph

Ground everything ONLY in the data given above. Do not invent
certifications, capacity figures, years of experience, or any claim not
present in the source data.

Return a JSON object with this exact structure:
{{
  "headline": "...",
  "summary": "...",
  "sections": [{{"heading": "...", "body": "..."}}]
}}

Only return valid JSON. No commentary outside the JSON object.
"""


async def generate_public_page(supplier_profile: dict, product_lines: list[dict]) -> GeneratePublicPageResponse:
    client = get_client()
    prompt = GENERATE_PUBLIC_PAGE_PROMPT.format(
        profile_json=json.dumps(supplier_profile, default=str, indent=2),
        product_lines_json=json.dumps(product_lines, default=str, indent=2),
    )
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1536,
            system="You draft factual public B2B supplier content for search/AI discoverability. Return only valid JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    raw_text = strip_code_fence(extract_text(response))
    try:
        raw = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned non-JSON output: {raw_text!r}") from exc

    sections = [
        PublicPageSection(heading=s["heading"], body=s["body"])
        for s in raw.get("sections", [])
        if "heading" in s and "body" in s
    ]
    return GeneratePublicPageResponse(
        headline=raw.get("headline", ""),
        summary=raw.get("summary", ""),
        sections=sections,
    )
