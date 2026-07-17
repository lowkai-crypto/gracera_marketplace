import json

import anthropic

from claude_util import extract_text, get_client, strip_code_fence
from config import settings
from models import VerificationFlag

TRIAGE_PROMPT = """You are pre-screening a B2B marketplace business profile for
a human trust-team review. You are NOT making an approve/reject decision --
only flagging things a human reviewer should look at more closely.

Profile submitted for verification:
{profile_json}

Look for internal inconsistencies or implausibilities, such as:
- A business registration number format that does not match typical
  patterns for the stated country
- A company description or tagline that reads as generic/boilerplate
  rather than specific to a real business
- A headquarters city that seems inconsistent with the stated country
- A contact email domain that seems inconsistent with the claimed company
  (many small legitimate businesses use generic email providers, so only
  flag this as a low-severity note, not a strong signal on its own)

Do not assume anything is fraudulent -- only note genuine inconsistencies
worth a closer look. If nothing stands out, return an empty flags list.

Return a JSON object with this exact structure:
{{
  "flags": [{{"field": "<field name>", "concern": "<1-2 sentences>", "severity": "low"|"medium"|"high"}}],
  "overall_assessment": "<one sentence>"
}}

Only return valid JSON. No commentary outside the JSON object.
"""


async def triage_verification(profile: dict) -> tuple[list[VerificationFlag], str]:
    client = get_client()
    prompt = TRIAGE_PROMPT.format(profile_json=json.dumps(profile, default=str, indent=2))
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system="You pre-screen business profiles for a human trust-team review. Return only valid JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as exc:
        raise ValueError(f"Claude API request failed: {exc}") from exc

    raw_text = strip_code_fence(extract_text(response))
    try:
        raw = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned non-JSON output: {raw_text!r}") from exc

    flags = [
        VerificationFlag(field=f["field"], concern=f["concern"], severity=f["severity"])
        for f in raw.get("flags", [])
        if "field" in f and "concern" in f and "severity" in f
    ]
    overall_assessment = raw.get("overall_assessment", "")
    return flags, overall_assessment
