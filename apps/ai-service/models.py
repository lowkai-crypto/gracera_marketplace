from typing import Any, Literal

from pydantic import BaseModel, Field


class SupplierProfileInput(BaseModel):
    company_name: str
    country: str = Field(..., description="ISO 3166-1 alpha-2")
    categories: list[str] = Field(..., min_length=1, max_length=5)
    target_geographies: list[str] = Field(..., min_length=1)
    moq: int = Field(..., gt=0)
    moq_unit: str
    lead_time_days: int | None = None
    certifications: list[str] = []
    target_customer_types: list[str] = []
    ideal_customer_description: str = Field(..., min_length=1)
    languages_spoken: list[str] = Field(..., min_length=1)


class BuyerRequestInput(BaseModel):
    company_name: str
    country: str = Field(..., description="ISO 3166-1 alpha-2")
    category: str
    quantity_required: int = Field(..., gt=0)
    quantity_unit: str
    required_certifications: list[str] = []
    buyer_type: list[str] = []
    ideal_supplier_description: str = Field(..., min_length=1)
    languages_spoken: list[str] = Field(..., min_length=1)


class MatchBonusInputs(BaseModel):
    """
    Optional signals from docs/07-matching-algorithm.md §4 final score
    composition. None of these exist yet without a Profile Service/DB, so
    every field is optional — see compose_final_score() for how omitted
    fields are handled.
    """

    profile_completeness: float | None = Field(
        None, ge=0, le=100, description="Average of both parties' completeness_score * 100"
    )
    verification_bonus: float | None = Field(
        None, ge=0, le=15, description="Averaged verification bonus points, docs/07 §4 table (0-15)"
    )
    activity_recency: float | None = Field(
        None, ge=0, le=100, description="Recency score including social proof signals, docs/07 §4"
    )
    feedback_adjustment: float | None = Field(
        None, ge=-10, le=10, description="Per-user learned weight adjustment, bounded +-10 (docs/07 §4)"
    )


class MatchScoreRequest(BaseModel):
    supplier: SupplierProfileInput
    buyer: BuyerRequestInput
    bonuses: MatchBonusInputs = MatchBonusInputs()
    language: str = "English"


class DimensionScore(BaseModel):
    score: float = Field(..., ge=0, le=100)
    rationale: str


class MatchScoreResponse(BaseModel):
    semantic_score: float = Field(..., ge=0, le=100)
    final_score: float = Field(..., ge=0, le=100)
    quality: str
    dimensions: dict[str, DimensionScore]
    summary: str
    bonuses_applied: list[str]


class ExtractWebsiteRequest(BaseModel):
    url: str = Field(..., min_length=1)


class ExtractedField(BaseModel):
    value: str | list[str]
    confidence: Literal["high", "medium", "low"]


# Keys match apps/web's CreateSupplierProfileSchema field names (camelCased
# by the Next.js proxy route) so the frontend can merge this straight into
# form state — see docs/22-onboarding-flows.md §2 RAG extraction targets,
# adapted for a website source (no MOQ/pricing/lead-time — that's rarely
# public).
EXTRACTABLE_FIELDS = (
    "company_name",
    "display_name",
    "tagline",
    "description",
    "country",
    "categories",
    "target_geographies",
    "languages_spoken",
    "certifications",
    "primary_contact_email",
    "primary_contact_phone",
)


class ExtractWebsiteResponse(BaseModel):
    source_url: str
    fields: dict[str, ExtractedField]
    warnings: list[str] = []


class MatchCoachingRequest(BaseModel):
    dimensions: dict[str, DimensionScore]
    summary: str
    viewer_side: Literal["supplier", "buyer"]
    # Loose on purpose: this is prompt context (what the viewer's own
    # profile already says), not scored/validated input like the matching
    # request above -- it never gets echoed back or written anywhere.
    viewer_profile: dict[str, Any]


class CoachingItem(BaseModel):
    dimension: str
    action_type: Literal["edit_profile", "ask_counterpart", "informational"]
    suggested_text: str
    target_field: str | None = None


class MatchCoachingResponse(BaseModel):
    items: list[CoachingItem]


class ExtractSourcingRequestTextRequest(BaseModel):
    text: str = Field(..., min_length=1)
    # Grounding context from the buyer's own profile -- loose dict, same
    # reasoning as MatchCoachingRequest.viewer_profile above.
    buyer_context: dict[str, Any] = {}


class ExtractSourcingRequestTextResponse(BaseModel):
    fields: dict[str, ExtractedField]
    warnings: list[str] = []


class DealMessageAssistRequest(BaseModel):
    mode: Literal["draft", "translate"]
    intent: str | None = None  # required for "draft"
    text: str | None = None  # required for "translate" -- the message being translated
    target_language: str | None = None  # optional for draft, required for translate
    counterpart_context: dict[str, Any] = {}
    match_summary: str = ""
    recent_messages: list[dict[str, str]] = []  # [{"sender": "me"|"them", "body": "..."}]


class DealMessageAssistResponse(BaseModel):
    draft: str


class VerificationFlag(BaseModel):
    field: str
    concern: str
    severity: Literal["low", "medium", "high"]


class VerificationTriageRequest(BaseModel):
    # Loose dict, same reasoning as MatchCoachingRequest.viewer_profile --
    # this is prompt context, not scored/validated data.
    profile: dict[str, Any]


class VerificationTriageResponse(BaseModel):
    flags: list[VerificationFlag]
    overall_assessment: str


class PublicPageSection(BaseModel):
    heading: str
    body: str


class GeneratePublicPageRequest(BaseModel):
    supplier_profile: dict[str, Any]
    product_lines: list[dict[str, Any]] = []


class GeneratePublicPageResponse(BaseModel):
    headline: str
    summary: str
    sections: list[PublicPageSection]
