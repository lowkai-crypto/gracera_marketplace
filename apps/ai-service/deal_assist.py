import json

import anthropic

from claude_util import extract_text, get_client, strip_code_fence
from config import settings

DRAFT_PROMPT = """You are helping a B2B marketplace user draft a professional
message to the other party in an active deal.

The other party (for context on who you are writing to):
{counterpart_context_json}

What this match/deal is about: {match_summary}

Recent message history (most recent last):
{recent_messages_json}

What the user wants to say or ask: {intent}

Write ONE professional, concrete message accomplishing this, grounded in
the actual context above (reference real specifics like quantities or
certifications where relevant, not generic filler).{language_instruction}

Return only the message text itself. No preamble, no quotation marks
around it, no commentary.
"""

TRANSLATE_PROMPT = """Translate the following business message into
{target_language}, preserving tone and meaning. Keep it business-
appropriate.

Message:
---
{text}
---

Return only the translated text. No preamble, no quotation marks around
it, no commentary.
"""


async def draft_deal_message(
    intent: str,
    counterpart_context: dict,
    match_summary: str,
    recent_messages: list[dict],
    target_language: str | None,
) -> str:
    client = get_client()
    language_instruction = f" Write the message directly in {target_language}." if target_language else ""
    prompt = DRAFT_PROMPT.format(
        counterpart_context_json=json.dumps(counterpart_context, default=str),
        match_summary=match_summary,
        recent_messages_json=json.dumps(recent_messages, default=str),
        intent=intent,
        language_instruction=language_instruction,
    )
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system="You draft professional B2B negotiation messages. Return only the message text.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    return strip_code_fence(extract_text(response))


async def translate_deal_message(text: str, target_language: str) -> str:
    client = get_client()
    prompt = TRANSLATE_PROMPT.format(target_language=target_language, text=text)
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system="You translate business messages faithfully. Return only the translated text.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    return strip_code_fence(extract_text(response))
