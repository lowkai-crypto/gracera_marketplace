import json

import anthropic

from claude_util import extract_text, get_client, strip_code_fence
from config import settings
from models import ExtractedField

# A typed sentence is much shorter than a scraped web page (extraction.py's
# MIN_TEXT_LENGTH of 200 would reject almost every real description here).
MIN_TEXT_LENGTH = 15

SOURCING_EXTRACTABLE_FIELDS = (
    "title",
    "category",
    "product_name",
    "quantity_required",
    "quantity_unit",
    "order_frequency",
    "budget_range",
    "max_lead_time_days",
    "required_certifications",
    "ideal_supplier_description",
    "description",
)

SOURCING_EXTRACTION_PROMPT = """You are structuring a buyer's free-text description of what they
want to source into a B2B marketplace sourcing request.

The buyer's own company context (for grounding only -- do not re-extract
these, they already exist on the buyer's profile):
{buyer_context_json}

What the buyer wrote:
---
{text}
---

Extract these fields where the text actually supports them. For each
field you can find, return the value AND a confidence level:
- "high": stated explicitly and unambiguously
- "medium": stated but with some inference required
- "low": a guess based on indirect signals

Only include a field if you found some evidence for it in what the buyer
wrote -- do not invent or estimate quantities, budgets, or lead times
that were not stated or clearly implied.

Fields to look for:
- title (string -- a short descriptive title for this request)
- category (string)
- product_name (string)
- quantity_required (numeric string, e.g. "5000")
- quantity_unit (string, e.g. "units", "cases")
- order_frequency (one of: "one_time", "monthly", "quarterly", "annual", "ongoing")
- budget_range (string, e.g. "$2-3/unit" or "$50k-100k annual")
- max_lead_time_days (numeric string, e.g. "42")
- required_certifications (array of strings)
- ideal_supplier_description (string -- what would make a supplier a great fit)
- description (string -- a fuller restatement of what's being sourced)

Return a JSON object with this exact structure:
{{
  "fields": {{
    "<field_name>": {{"value": <string or array>, "confidence": "high"|"medium"|"low"}}
  }}
}}

Only return valid JSON. No commentary outside the JSON object.
"""


async def extract_sourcing_request_text(text: str, buyer_context: dict) -> dict[str, ExtractedField]:
    """Structures a buyer's free-typed description into sourcing-request
    fields. Deliberately not sharing extraction.py's helper -- a small
    amount of duplicated Claude-call/parse/filter logic here is a better
    trade than touching that already-shipped, already-tested website
    pre-fill path for a different-shaped input."""
    if len(text.strip()) < MIN_TEXT_LENGTH:
        return {}

    client = get_client()
    prompt = SOURCING_EXTRACTION_PROMPT.format(
        buyer_context_json=json.dumps(buyer_context, default=str), text=text
    )
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system="You structure a buyer's sourcing need into marketplace fields. Return only valid JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    raw_text = strip_code_fence(extract_text(response))
    try:
        raw = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned non-JSON output: {raw_text!r}") from exc

    raw_fields = raw.get("fields", {})
    return {
        name: ExtractedField(**raw_fields[name])
        for name in SOURCING_EXTRACTABLE_FIELDS
        if name in raw_fields
    }
