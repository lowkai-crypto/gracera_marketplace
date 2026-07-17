import json

import pytest
from fastapi.testclient import TestClient

from coaching import coach_match
from models import DimensionScore, MatchCoachingRequest


class FakeContent:
    def __init__(self, text: str):
        self.type = "text"
        self.text = text


class FakeMessage:
    def __init__(self, text: str):
        self.content = [FakeContent(text)]


class FakeMessages:
    def __init__(self, text: str):
        self._text = text

    def create(self, **kwargs):
        return FakeMessage(self._text)


class FakeClient:
    def __init__(self, text: str):
        self.messages = FakeMessages(text)


WEAK_DIMENSIONS = {
    "certification_match": DimensionScore(score=60, rationale="Buyer wants hygiene certs supplier lacks."),
    "category_alignment": DimensionScore(score=90, rationale="Strong overlap."),
}

COACHING_RESPONSE = {
    "items": [
        {
            "dimension": "certification_match",
            "action_type": "edit_profile",
            "suggested_text": "Add hygiene certifications to your profile.",
            "target_field": "certifications",
        }
    ]
}


def make_request(dimensions=None) -> MatchCoachingRequest:
    return MatchCoachingRequest(
        dimensions=dimensions if dimensions is not None else WEAK_DIMENSIONS,
        summary="A generally strong match with one certification gap.",
        viewer_side="supplier",
        viewer_profile={"companyName": "Golden Phoenix Textile Co.", "certifications": None},
    )


class TestCoachMatch:
    @pytest.mark.asyncio
    async def test_no_weak_dimensions_skips_claude_call_entirely(self, monkeypatch):
        claude_called = False

        def fake_get_client():
            nonlocal claude_called
            claude_called = True
            return FakeClient(json.dumps(COACHING_RESPONSE))

        monkeypatch.setattr("coaching.get_client", fake_get_client)

        all_strong = {"category_alignment": DimensionScore(score=90, rationale="Great fit.")}
        items = await coach_match(make_request(dimensions=all_strong))

        assert items == []
        assert not claude_called  # cost-avoidance: nothing weak, don't spend a Claude call

    @pytest.mark.asyncio
    async def test_returns_coaching_item_for_weak_dimension(self, monkeypatch):
        monkeypatch.setattr("coaching.get_client", lambda: FakeClient(json.dumps(COACHING_RESPONSE)))

        items = await coach_match(make_request())

        assert len(items) == 1
        assert items[0].dimension == "certification_match"
        assert items[0].action_type == "edit_profile"
        assert items[0].target_field == "certifications"

    @pytest.mark.asyncio
    async def test_drops_item_for_dimension_not_in_the_weak_set(self, monkeypatch):
        # Claude invents an item for category_alignment, which scored 90 --
        # never sent to it as a weak dimension in the first place.
        hallucinated = {
            "items": [
                {
                    "dimension": "category_alignment",
                    "action_type": "informational",
                    "suggested_text": "Made up.",
                    "target_field": None,
                },
                *COACHING_RESPONSE["items"],
            ]
        }
        monkeypatch.setattr("coaching.get_client", lambda: FakeClient(json.dumps(hallucinated)))

        items = await coach_match(make_request())

        assert len(items) == 1
        assert items[0].dimension == "certification_match"

    @pytest.mark.asyncio
    async def test_nulls_out_a_target_field_outside_the_allow_list(self, monkeypatch):
        bad_field_response = {
            "items": [
                {
                    "dimension": "certification_match",
                    "action_type": "edit_profile",
                    "suggested_text": "Add hygiene certifications.",
                    "target_field": "notARealField",
                }
            ]
        }
        monkeypatch.setattr("coaching.get_client", lambda: FakeClient(json.dumps(bad_field_response)))

        items = await coach_match(make_request())

        assert len(items) == 1
        assert items[0].target_field is None  # degrades to plain text, not a broken deep-link

    @pytest.mark.asyncio
    async def test_raises_on_non_json_response(self, monkeypatch):
        monkeypatch.setattr("coaching.get_client", lambda: FakeClient("not json"))
        with pytest.raises(ValueError, match="non-JSON"):
            await coach_match(make_request())


@pytest.fixture
def client(monkeypatch):
    from main import app

    return TestClient(app)


class TestMatchCoachingRoute:
    def test_happy_path(self, client, monkeypatch):
        async def fake_coach_match(request):
            from models import CoachingItem

            return [
                CoachingItem(
                    dimension="certification_match",
                    action_type="edit_profile",
                    suggested_text="Add hygiene certifications.",
                    target_field="certifications",
                )
            ]

        monkeypatch.setattr("routes.coaching.coach_match", fake_coach_match)
        resp = client.post(
            "/assist/match-coaching",
            json={
                "dimensions": {"certification_match": {"score": 60, "rationale": "gap"}},
                "summary": "Strong overall.",
                "viewer_side": "supplier",
                "viewer_profile": {"companyName": "Golden Phoenix"},
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["items"][0]["target_field"] == "certifications"

    def test_generic_failure_returns_502(self, client, monkeypatch):
        async def fake_coach_match(request):
            raise ValueError("boom")

        monkeypatch.setattr("routes.coaching.coach_match", fake_coach_match)
        resp = client.post(
            "/assist/match-coaching",
            json={
                "dimensions": {"certification_match": {"score": 60, "rationale": "gap"}},
                "summary": "Strong overall.",
                "viewer_side": "supplier",
                "viewer_profile": {},
            },
        )
        assert resp.status_code == 502

    def test_internal_secret_enforced_when_configured(self, client, monkeypatch):
        monkeypatch.setattr("internal_auth.settings.ai_service_secret", "shh")

        async def fake_coach_match(request):
            return []

        monkeypatch.setattr("routes.coaching.coach_match", fake_coach_match)
        body = {
            "dimensions": {"certification_match": {"score": 60, "rationale": "gap"}},
            "summary": "Strong overall.",
            "viewer_side": "supplier",
            "viewer_profile": {},
        }

        resp_no_header = client.post("/assist/match-coaching", json=body)
        assert resp_no_header.status_code == 401

        resp_correct = client.post("/assist/match-coaching", json=body, headers={"x-internal-secret": "shh"})
        assert resp_correct.status_code == 200
