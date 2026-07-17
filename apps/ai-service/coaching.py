import json

from claude_util import extract_text, get_client, strip_code_fence
from config import settings
from models import CoachingItem, MatchCoachingRequest

# Only dimensions scoring below this get a coaching item -- kept here
# (not duplicated in the frontend) so "what counts as weak" lives in
# exactly one place.
WEAK_THRESHOLD = 70

# Every field either wizard actually shows, across both supplier and
# buyer profile pages. Claude's target_field is validated against this
# after the call, same anti-hallucination pattern as extraction.py's
# EXTRACTABLE_FIELDS -- a field outside this list gets nulled out rather
# than rejecting the whole response. Keep in sync with the STEPS arrays in
# apps/web/src/app/(portal)/onboarding/supplier/page.tsx and
# .../onboarding/buyer/page.tsx.
EDITABLE_FIELDS = {
    "companyName",
    "displayName",
    "country",
    "headquartersCity",
    "description",
    "yearEstablished",
    "companySize",
    "businessRegNumber",
    "tagline",
    "supplierType",
    "categories",
    "productName",
    "productUnit",
    "productMoq",
    "productMoqUnit",
    "productLeadTimeDays",
    "productDescription",
    "targetGeographies",
    "languagesSpoken",
    "targetCustomerTypes",
    "preferredDealTypes",
    "idealCustomerDescription",
    "annualRevenueRange",
    "productionCapacityMonthly",
    "certifications",
    "notableCustomers",
    "qualityControlProcess",
    "referencesAvailable",
    "primaryContactName",
    "primaryContactRole",
    "primaryContactEmail",
    "primaryContactPhone",
    "industry",
    "annualPurchasingVolume",
    "buyerType",
    "preferredSupplierCountries",
}

COACHING_PROMPT = """You are a B2B trade matching coach. A {viewer_side} is looking at a
match with a weak spot in one or more scoring dimensions. For each weak
dimension below, suggest exactly one concrete next step.

Weak dimensions:
{dimensions_json}

Overall match summary: {summary}

The {viewer_side}'s own profile (for context on what they could add/edit):
{viewer_profile_json}

For each dimension, classify the best next step into exactly one of:
- "edit_profile": something the {viewer_side} could add to their OWN profile
  to close this gap (only if you can name a specific real field from this
  list: {editable_fields}).
- "ask_counterpart": something worth asking the other party directly,
  since it depends on information only they have.
- "informational": the gap is structural (e.g. a real geography or scale
  mismatch) and there's no concrete action to take -- just a note.

Return a JSON object with this exact structure:
{{
  "items": [
    {{"dimension": "<dimension key>", "action_type": "edit_profile"|"ask_counterpart"|"informational",
      "suggested_text": "<one specific, concrete sentence>", "target_field": "<field name or null>"}}
  ]
}}

Only include a dimension if you have a genuinely useful, specific
suggestion -- do not pad the list. Only return valid JSON. No commentary
outside the JSON object.
"""


async def coach_match(request: MatchCoachingRequest) -> list[CoachingItem]:
    weak_dimensions = {
        name: dim for name, dim in request.dimensions.items() if dim.score < WEAK_THRESHOLD
    }
    if not weak_dimensions:
        return []

    client = get_client()
    prompt = COACHING_PROMPT.format(
        viewer_side=request.viewer_side,
        dimensions_json=json.dumps(
            {name: dim.model_dump() for name, dim in weak_dimensions.items()}, indent=2
        ),
        summary=request.summary,
        viewer_profile_json=json.dumps(request.viewer_profile, default=str, indent=2),
        editable_fields=", ".join(sorted(EDITABLE_FIELDS)),
    )
    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system="You coach B2B marketplace users on how to improve a weak match. Return only valid JSON.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = strip_code_fence(extract_text(response))
    try:
        raw = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned non-JSON output: {text!r}") from exc

    items = []
    for raw_item in raw.get("items", []):
        if raw_item.get("dimension") not in weak_dimensions:
            continue  # don't let Claude invent a dimension we didn't ask about
        target_field = raw_item.get("target_field")
        if target_field is not None and target_field not in EDITABLE_FIELDS:
            target_field = None
        items.append(
            CoachingItem(
                dimension=raw_item["dimension"],
                action_type=raw_item["action_type"],
                suggested_text=raw_item["suggested_text"],
                target_field=target_field,
            )
        )
    return items
