import json

import pytest
from fastapi.testclient import TestClient

from public_page import generate_public_page


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


SUPPLIER_PROFILE = {
    "companyName": "Golden Phoenix Textile Co.",
    "country": "CN",
    "headquartersCity": "Shanghai",
    "categories": ["Hospitality Supplies"],
    "certifications": ["ISO 9001"],
    "description": "A manufacturer specializing in disposable hospitality textiles.",
}

PRODUCT_LINES = [{"name": "Disposable Hotel Sleepers", "moq": 1000, "moqUnit": "units"}]

GENERATE_RESPONSE = {
    "headline": "Golden Phoenix Textile Co. -- Hospitality Disposable Linens Manufacturer, Shanghai",
    "summary": "Golden Phoenix Textile Co. manufactures disposable hospitality textiles from Shanghai, China.",
    "sections": [
        {"heading": "Capabilities", "body": "Produces disposable hotel sleepers with a 1,000-unit MOQ."},
        {"heading": "Certifications & Quality", "body": "ISO 9001 certified."},
    ],
}


class TestGeneratePublicPage:
    @pytest.mark.asyncio
    async def test_parses_headline_summary_and_sections(self, monkeypatch):
        monkeypatch.setattr("public_page.get_client", lambda: FakeClient(json.dumps(GENERATE_RESPONSE)))

        result = await generate_public_page(SUPPLIER_PROFILE, PRODUCT_LINES)

        assert "Golden Phoenix" in result.headline
        assert len(result.sections) == 2
        assert result.sections[0].heading == "Capabilities"

    @pytest.mark.asyncio
    async def test_drops_a_malformed_section_missing_required_keys(self, monkeypatch):
        malformed = {
            "headline": "Test",
            "summary": "Test summary.",
            "sections": [{"heading": "Missing body"}, *GENERATE_RESPONSE["sections"]],
        }
        monkeypatch.setattr("public_page.get_client", lambda: FakeClient(json.dumps(malformed)))

        result = await generate_public_page(SUPPLIER_PROFILE, PRODUCT_LINES)

        assert len(result.sections) == 2  # the malformed one is dropped, not crashed on

    @pytest.mark.asyncio
    async def test_raises_on_non_json_response(self, monkeypatch):
        monkeypatch.setattr("public_page.get_client", lambda: FakeClient("not json"))
        with pytest.raises(ValueError, match="non-JSON"):
            await generate_public_page(SUPPLIER_PROFILE, PRODUCT_LINES)


@pytest.fixture
def client(monkeypatch):
    from main import app

    return TestClient(app)


class TestGeneratePublicPageRoute:
    def test_happy_path(self, client, monkeypatch):
        async def fake_generate(supplier_profile, product_lines):
            from models import GeneratePublicPageResponse, PublicPageSection

            return GeneratePublicPageResponse(
                headline="Test headline",
                summary="Test summary.",
                sections=[PublicPageSection(heading="Capabilities", body="Test body.")],
            )

        monkeypatch.setattr("routes.public_page.generate_public_page", fake_generate)
        resp = client.post(
            "/assist/generate-public-page",
            json={"supplier_profile": SUPPLIER_PROFILE, "product_lines": PRODUCT_LINES},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["headline"] == "Test headline"
        assert body["sections"][0]["heading"] == "Capabilities"

    def test_generic_failure_returns_502(self, client, monkeypatch):
        async def fake_generate(supplier_profile, product_lines):
            raise ValueError("boom")

        monkeypatch.setattr("routes.public_page.generate_public_page", fake_generate)
        resp = client.post(
            "/assist/generate-public-page",
            json={"supplier_profile": SUPPLIER_PROFILE, "product_lines": []},
        )
        assert resp.status_code == 502

    def test_internal_secret_enforced_when_configured(self, client, monkeypatch):
        monkeypatch.setattr("internal_auth.settings.ai_service_secret", "shh")

        async def fake_generate(supplier_profile, product_lines):
            from models import GeneratePublicPageResponse

            return GeneratePublicPageResponse(headline="H", summary="S", sections=[])

        monkeypatch.setattr("routes.public_page.generate_public_page", fake_generate)
        body = {"supplier_profile": SUPPLIER_PROFILE, "product_lines": []}

        resp_no_header = client.post("/assist/generate-public-page", json=body)
        assert resp_no_header.status_code == 401

        resp_correct = client.post("/assist/generate-public-page", json=body, headers={"x-internal-secret": "shh"})
        assert resp_correct.status_code == 200
