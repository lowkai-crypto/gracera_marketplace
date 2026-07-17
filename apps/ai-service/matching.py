import json

import anthropic

from claude_util import extract_text, get_client, strip_code_fence
from config import settings
from models import BuyerRequestInput, DimensionScore, MatchBonusInputs, SupplierProfileInput

DIMENSIONS = (
    "category_alignment",
    "geography_fit",
    "scale_compatibility",
    "certification_match",
    "target_customer_fit",
    "communication_fit",
)

# docs/07-matching-algorithm.md §4
WEIGHTS = {
    "semantic": 0.55,
    "completeness": 0.15,
    "verification": 0.15,
    "recency": 0.10,
    "feedback": 0.05,
}

MATCH_PROMPT = """You are a B2B trade matching expert. Given a supplier profile and a buyer
sourcing request, evaluate their compatibility across 6 dimensions.

Supplier Profile:
{supplier_json}

Buyer Sourcing Request:
{buyer_json}

Return a JSON object with this structure:
{{
  "overall_score": <0-100>,
  "dimensions": {{
    "category_alignment": {{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "geography_fit":      {{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "scale_compatibility":{{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "certification_match":{{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "target_customer_fit":{{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "communication_fit":  {{"score": <0-100>, "rationale": "<1-2 sentences>"}}
  }},
  "summary": "<2-3 sentence human-readable summary explaining why this is a good match>"
}}

Only return valid JSON. No commentary outside the JSON object.
Respond in {language}.
"""


async def score_match(
    supplier: SupplierProfileInput, buyer: BuyerRequestInput, language: str = "English"
) -> dict:
    """Claude semantic scoring — docs/04-ai-agent-design.md §2.6."""
    client = get_client()
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system="You are a B2B trade matching expert. Return only valid JSON.",
            messages=[
                {
                    "role": "user",
                    "content": MATCH_PROMPT.format(
                        supplier_json=supplier.model_dump_json(indent=2),
                        buyer_json=buyer.model_dump_json(indent=2),
                        language=language,
                    ),
                }
            ],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    text = strip_code_fence(extract_text(response))
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned non-JSON output: {text!r}") from exc


def compose_final_score(semantic_score: float, bonuses: MatchBonusInputs) -> tuple[float, list[str]]:
    """
    docs/07-matching-algorithm.md §4:
      final = semantic*0.55 + completeness*0.15 + verification*0.15
            + recency*0.10 + feedback*0.05

    Every bonus term requires data this service doesn't have access to yet
    (no Profile Service / matches table — see the approved plan). Any bonus
    the caller omits has its weight folded back onto the semantic score
    rather than silently scoring the match down for missing data the
    platform hasn't wired up yet.
    """
    provided: dict[str, float] = {}
    if bonuses.profile_completeness is not None:
        provided["completeness"] = bonuses.profile_completeness
    if bonuses.verification_bonus is not None:
        provided["verification"] = bonuses.verification_bonus
    if bonuses.activity_recency is not None:
        provided["recency"] = bonuses.activity_recency
    if bonuses.feedback_adjustment is not None:
        provided["feedback"] = bonuses.feedback_adjustment

    # Weight not consumed by any provided bonus collapses onto semantic.
    semantic_weight = WEIGHTS["semantic"] + sum(
        w for key, w in WEIGHTS.items() if key != "semantic" and key not in provided
    )

    final = semantic_weight * semantic_score + sum(WEIGHTS[key] * value for key, value in provided.items())
    return final, list(provided.keys())


def quality_label(score: float) -> str:
    """docs/07-matching-algorithm.md §6 score thresholds."""
    if score >= 80:
        return "Strong Match"
    if score >= 60:
        return "Good Match"
    if score >= 40:
        return "Potential Match"
    return "Not Surfaced"


def parse_dimensions(raw: dict) -> dict[str, DimensionScore]:
    dims = raw.get("dimensions", {})
    return {name: DimensionScore(**dims[name]) for name in DIMENSIONS if name in dims}
