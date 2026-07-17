import json

import pytest
from fastapi.testclient import TestClient

from sourcing_extraction import extract_sourcing_request_text


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


RICH_DESCRIPTION = (
    "I need 5000 units of eco-friendly hotel amenities, budget around "
    "$2/unit, within 6 weeks. Looking for FDA-certified suppliers."
)

CLAUDE_RESPONSE = {
    "fields": {
        "product_name": {"value": "eco-friendly hotel amenities", "confidence": "high"},
        "quantity_required": {"value": "5000", "confidence": "high"},
        "quantity_unit": {"value": "units", "confidence": "high"},
        "budget_range": {"value": "$2/unit", "confidence": "high"},
        "max_lead_time_days": {"value": "42", "confidence": "medium"},
        "required_certifications": {"value": ["FDA"], "confidence": "high"},
        # A field Claude might hallucinate that isn't in SOURCING_EXTRACTABLE_FIELDS
        "hallucinated_field": {"value": "nonsense", "confidence": "low"},
    }
}


class TestExtractSourcingRequestText:
    @pytest.mark.asyncio
    async def test_parses_and_filters_to_known_fields(self, monkeypatch):
        monkeypatch.setattr(
            "sourcing_extraction.get_client", lambda: FakeClient(json.dumps(CLAUDE_RESPONSE))
        )
        fields = await extract_sourcing_request_text(RICH_DESCRIPTION, {})

        assert "hallucinated_field" not in fields
        assert fields["product_name"].value == "eco-friendly hotel amenities"
        assert fields["quantity_required"].value == "5000"
        assert fields["required_certifications"].value == ["FDA"]

    @pytest.mark.asyncio
    async def test_short_text_skips_claude_call_entirely(self, monkeypatch):
        claude_called = False

        def fake_get_client():
            nonlocal claude_called
            claude_called = True
            return FakeClient(json.dumps(CLAUDE_RESPONSE))

        monkeypatch.setattr("sourcing_extraction.get_client", fake_get_client)

        fields = await extract_sourcing_request_text("need stuff", {})

        assert fields == {}
        assert not claude_called  # cost-avoidance: don't call Claude on near-empty input

    @pytest.mark.asyncio
    async def test_raises_on_non_json_response(self, monkeypatch):
        monkeypatch.setattr("sourcing_extraction.get_client", lambda: FakeClient("not json"))
        with pytest.raises(ValueError, match="non-JSON"):
            await extract_sourcing_request_text(RICH_DESCRIPTION, {})

    @pytest.mark.asyncio
    async def test_passes_buyer_context_into_the_prompt(self, monkeypatch):
        captured_prompt = {}

        class CapturingMessages:
            def create(self, **kwargs):
                captured_prompt["text"] = kwargs["messages"][0]["content"]
                return FakeMessage(json.dumps(CLAUDE_RESPONSE))

        class CapturingClient:
            def __init__(self):
                self.messages = CapturingMessages()

        monkeypatch.setattr("sourcing_extraction.get_client", lambda: CapturingClient())

        await extract_sourcing_request_text(
            RICH_DESCRIPTION, {"country": "US", "industry": "Hospitality Supplies"}
        )

        assert "Hospitality Supplies" in captured_prompt["text"]


@pytest.fixture
def client(monkeypatch):
    from main import app

    return TestClient(app)


class TestSourcingRequestTextRoute:
    def test_happy_path(self, client, monkeypatch):
        async def fake_extract(text, buyer_context):
            return {"product_name": CLAUDE_RESPONSE["fields"]["product_name"]}

        monkeypatch.setattr("routes.extract.extract_sourcing_request_text", fake_extract)
        resp = client.post("/extract/sourcing-request-text", json={"text": RICH_DESCRIPTION})
        assert resp.status_code == 200
        body = resp.json()
        assert body["fields"]["product_name"]["value"] == "eco-friendly hotel amenities"
        assert body["warnings"] == []

    def test_no_fields_returns_a_warning(self, client, monkeypatch):
        async def fake_extract(text, buyer_context):
            return {}

        monkeypatch.setattr("routes.extract.extract_sourcing_request_text", fake_extract)
        resp = client.post("/extract/sourcing-request-text", json={"text": "need stuff"})
        assert resp.status_code == 200
        assert resp.json()["warnings"] != []

    def test_generic_failure_returns_502(self, client, monkeypatch):
        async def fake_extract(text, buyer_context):
            raise ValueError("boom")

        monkeypatch.setattr("routes.extract.extract_sourcing_request_text", fake_extract)
        resp = client.post("/extract/sourcing-request-text", json={"text": RICH_DESCRIPTION})
        assert resp.status_code == 502

    def test_internal_secret_enforced_when_configured(self, client, monkeypatch):
        monkeypatch.setattr("internal_auth.settings.ai_service_secret", "shh")

        async def fake_extract(text, buyer_context):
            return {}

        monkeypatch.setattr("routes.extract.extract_sourcing_request_text", fake_extract)

        resp_no_header = client.post("/extract/sourcing-request-text", json={"text": RICH_DESCRIPTION})
        assert resp_no_header.status_code == 401

        resp_correct = client.post(
            "/extract/sourcing-request-text",
            json={"text": RICH_DESCRIPTION},
            headers={"x-internal-secret": "shh"},
        )
        assert resp_correct.status_code == 200
