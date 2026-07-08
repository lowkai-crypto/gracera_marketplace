import json

import pytest
from fastapi.testclient import TestClient

from matching import compose_final_score, quality_label
from claude_util import strip_code_fence
from models import MatchBonusInputs

SAMPLE_SUPPLIER = {
    "company_name": "Jangdok Foods",
    "country": "KR",
    "categories": ["food-ingredients/sauces-condiments"],
    "target_geographies": ["US", "DE"],
    "moq": 500,
    "moq_unit": "cases",
    "lead_time_days": 28,
    "certifications": ["FDA", "HACCP"],
    "target_customer_types": ["Distributor", "OEM"],
    "ideal_customer_description": "Mid-size US food distributors sourcing Korean fermented condiments.",
    "languages_spoken": ["ko", "en"],
}

SAMPLE_BUYER = {
    "company_name": "Lone Star Specialty",
    "country": "US",
    "category": "food-ingredients/sauces-condiments",
    "quantity_required": 400,
    "quantity_unit": "cases",
    "required_certifications": ["FDA"],
    "buyer_type": ["Distributor"],
    "ideal_supplier_description": "Korean hot sauce manufacturer with FDA and HACCP certification.",
    "languages_spoken": ["en"],
}


class TestComposeFinalScore:
    def test_all_bonuses_omitted_collapses_to_semantic(self):
        final, applied = compose_final_score(72.0, MatchBonusInputs())
        assert final == pytest.approx(72.0)
        assert applied == []

    def test_all_bonuses_supplied(self):
        bonuses = MatchBonusInputs(
            profile_completeness=90,
            verification_bonus=10,
            activity_recency=50,
            feedback_adjustment=5,
        )
        final, applied = compose_final_score(80.0, bonuses)
        expected = 0.55 * 80 + 0.15 * 90 + 0.15 * 10 + 0.10 * 50 + 0.05 * 5
        assert final == pytest.approx(expected)
        assert applied == ["completeness", "verification", "recency", "feedback"]

    def test_partial_bonuses_redistribute_remaining_weight(self):
        bonuses = MatchBonusInputs(profile_completeness=100)
        final, applied = compose_final_score(60.0, bonuses)
        expected = 0.85 * 60 + 0.15 * 100
        assert final == pytest.approx(expected)
        assert applied == ["completeness"]


class TestQualityLabel:
    @pytest.mark.parametrize(
        "score,label",
        [
            (100, "Strong Match"),
            (80, "Strong Match"),
            (79.9, "Good Match"),
            (60, "Good Match"),
            (59.9, "Potential Match"),
            (40, "Potential Match"),
            (39.9, "Not Surfaced"),
            (0, "Not Surfaced"),
        ],
    )
    def test_thresholds(self, score, label):
        assert quality_label(score) == label


class FakeContent:
    def __init__(self, text: str):
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


CLAUDE_RESPONSE = {
    "overall_score": 89,
    "dimensions": {
        "category_alignment": {"score": 96, "rationale": "Strong overlap."},
        "geography_fit": {"score": 88, "rationale": "Ships to buyer region."},
        "scale_compatibility": {"score": 92, "rationale": "MOQ aligns."},
        "certification_match": {"score": 85, "rationale": "FDA confirmed."},
        "target_customer_fit": {"score": 90, "rationale": "Distributor fit."},
        "communication_fit": {"score": 82, "rationale": "English confirmed."},
    },
    "summary": "Strong category and certification alignment.",
}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr("matching.get_client", lambda: FakeClient(json.dumps(CLAUDE_RESPONSE)))
    from main import app

    return TestClient(app)


def test_score_endpoint_happy_path(client):
    response = client.post(
        "/match/score",
        json={"supplier": SAMPLE_SUPPLIER, "buyer": SAMPLE_BUYER},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["semantic_score"] == 89
    assert body["final_score"] == pytest.approx(89.0)
    assert body["quality"] == "Strong Match"
    assert body["bonuses_applied"] == []
    assert set(body["dimensions"]) == {
        "category_alignment",
        "geography_fit",
        "scale_compatibility",
        "certification_match",
        "target_customer_fit",
        "communication_fit",
    }


def test_score_endpoint_validation_error(client):
    bad_buyer = {**SAMPLE_BUYER, "quantity_required": -1}
    response = client.post(
        "/match/score",
        json={"supplier": SAMPLE_SUPPLIER, "buyer": bad_buyer},
    )
    assert response.status_code == 422


def test_score_endpoint_non_json_claude_response(monkeypatch):
    monkeypatch.setattr("matching.get_client", lambda: FakeClient("not json"))
    from main import app

    resp = TestClient(app).post(
        "/match/score",
        json={"supplier": SAMPLE_SUPPLIER, "buyer": SAMPLE_BUYER},
    )
    assert resp.status_code == 502


class TestStripCodeFence:
    def test_plain_json_untouched(self):
        assert strip_code_fence('{"a": 1}') == '{"a": 1}'

    def test_strips_json_fence(self):
        fenced = '```json\n{"a": 1}\n```'
        assert strip_code_fence(fenced) == '{"a": 1}'

    def test_strips_bare_fence(self):
        fenced = '```\n{"a": 1}\n```'
        assert strip_code_fence(fenced) == '{"a": 1}'


def test_score_endpoint_handles_fenced_claude_response(monkeypatch):
    fenced = "```json\n" + json.dumps(CLAUDE_RESPONSE) + "\n```"
    monkeypatch.setattr("matching.get_client", lambda: FakeClient(fenced))
    from main import app

    resp = TestClient(app).post(
        "/match/score",
        json={"supplier": SAMPLE_SUPPLIER, "buyer": SAMPLE_BUYER},
    )
    assert resp.status_code == 200
    assert resp.json()["semantic_score"] == 89
