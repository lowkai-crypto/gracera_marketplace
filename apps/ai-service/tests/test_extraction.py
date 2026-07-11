import json

import pytest
from fastapi.testclient import TestClient

from extraction import extract_fields_from_text, extract_website
from url_safety import UnsafeUrlError


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


RICH_PAGE_TEXT = (
    "Jangdok Foods is a Korean manufacturer of fermented condiments "
    "based in Seoul, South Korea, established in 1998. We export gochujang "
    "and doenjang to the United States, Germany, and Japan. Our facility "
    "is ISO 9001 and HACCP certified. Contact us at sales@jangdokfoods.example "
    "or +82-2-555-0100. " * 3
)

CLAUDE_EXTRACTION_RESPONSE = {
    "fields": {
        "company_name": {"value": "Jangdok Foods", "confidence": "high"},
        "country": {"value": "KR", "confidence": "high"},
        "description": {
            "value": "A Korean manufacturer of fermented condiments based in Seoul.",
            "confidence": "high",
        },
        "target_geographies": {"value": ["US", "DE", "JP"], "confidence": "medium"},
        "certifications": {"value": ["ISO 9001", "HACCP"], "confidence": "high"},
        "primary_contact_email": {"value": "sales@jangdokfoods.example", "confidence": "high"},
        # A field Claude might hallucinate that isn't in EXTRACTABLE_FIELDS
        "moq": {"value": "500 units", "confidence": "low"},
    }
}


class TestExtractFieldsFromText:
    @pytest.mark.asyncio
    async def test_parses_and_filters_to_known_fields(self, monkeypatch):
        monkeypatch.setattr(
            "extraction.get_client", lambda: FakeClient(json.dumps(CLAUDE_EXTRACTION_RESPONSE))
        )
        fields = await extract_fields_from_text(RICH_PAGE_TEXT)

        assert "moq" not in fields  # not in EXTRACTABLE_FIELDS -- dropped
        assert fields["company_name"].value == "Jangdok Foods"
        assert fields["company_name"].confidence == "high"
        assert fields["target_geographies"].value == ["US", "DE", "JP"]

    @pytest.mark.asyncio
    async def test_raises_on_non_json_response(self, monkeypatch):
        monkeypatch.setattr("extraction.get_client", lambda: FakeClient("not json"))
        with pytest.raises(ValueError, match="non-JSON"):
            await extract_fields_from_text(RICH_PAGE_TEXT)


class TestExtractWebsite:
    @pytest.mark.asyncio
    async def test_full_pipeline_happy_path(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            return f"<html><body><p>{RICH_PAGE_TEXT}</p></body></html>"

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        monkeypatch.setattr(
            "extraction.get_client", lambda: FakeClient(json.dumps(CLAUDE_EXTRACTION_RESPONSE))
        )

        fields, warnings = await extract_website("https://jangdokfoods.example/about")
        assert fields["company_name"].value == "Jangdok Foods"
        assert warnings == []

    @pytest.mark.asyncio
    async def test_thin_page_skips_claude_call_entirely(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            return "<html><body><p>Coming soon</p></body></html>"

        async def fake_render_page(url: str, timeout_seconds: float) -> str:
            # Rendering is attempted too, but it doesn't help either —
            # a genuinely thin page, not a JS-rendered one.
            return "<html><body><p>Coming soon</p></body></html>"

        claude_called = False

        def fake_get_client():
            nonlocal claude_called
            claude_called = True
            return FakeClient(json.dumps(CLAUDE_EXTRACTION_RESPONSE))

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        monkeypatch.setattr("extraction.render_page", fake_render_page)
        monkeypatch.setattr("extraction.get_client", fake_get_client)

        fields, warnings = await extract_website("https://thin-site.example/")
        assert fields == {}
        assert len(warnings) == 1
        assert not claude_called  # cost-avoidance: don't call Claude on near-empty input

    @pytest.mark.asyncio
    async def test_thin_page_falls_back_to_headless_render(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            return "<html><body><sst-app></sst-app></body></html>"

        async def fake_render_page(url: str, timeout_seconds: float) -> str:
            return f"<html><body><p>{RICH_PAGE_TEXT}</p></body></html>"

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        monkeypatch.setattr("extraction.render_page", fake_render_page)
        monkeypatch.setattr(
            "extraction.get_client", lambda: FakeClient(json.dumps(CLAUDE_EXTRACTION_RESPONSE))
        )

        fields, warnings = await extract_website("https://spa-site.example/")
        assert fields["company_name"].value == "Jangdok Foods"
        assert not any("JavaScript" in w for w in warnings)

    @pytest.mark.asyncio
    async def test_headless_render_failure_becomes_a_warning_not_an_exception(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            return "<html><body><sst-app></sst-app></body></html>"

        async def fake_render_page(url: str, timeout_seconds: float) -> str:
            raise ValueError("Could not render page: timeout")

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        monkeypatch.setattr("extraction.render_page", fake_render_page)

        fields, warnings = await extract_website("https://spa-site.example/")
        assert fields == {}
        assert any("Headless rendering failed" in w for w in warnings)
        assert any("JavaScript" in w for w in warnings)

    @pytest.mark.asyncio
    async def test_headless_render_disabled_skips_fallback(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            return "<html><body><sst-app></sst-app></body></html>"

        render_called = False

        async def fake_render_page(url: str, timeout_seconds: float) -> str:
            nonlocal render_called
            render_called = True
            return f"<html><body><p>{RICH_PAGE_TEXT}</p></body></html>"

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        monkeypatch.setattr("extraction.render_page", fake_render_page)
        monkeypatch.setattr("extraction.settings.enable_headless_render", False)

        fields, warnings = await extract_website("https://spa-site.example/")
        assert not render_called
        assert fields == {}
        assert any("JavaScript" in w for w in warnings)

    @pytest.mark.asyncio
    async def test_propagates_unsafe_url_error(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            raise UnsafeUrlError("nope")

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        with pytest.raises(UnsafeUrlError):
            await extract_website("http://169.254.169.254/")

    @pytest.mark.asyncio
    async def test_propagates_unsafe_url_error_from_headless_render(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            return "<html><body><sst-app></sst-app></body></html>"

        async def fake_render_page(url: str, timeout_seconds: float) -> str:
            raise UnsafeUrlError("redirected to a disallowed IP")

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        monkeypatch.setattr("extraction.render_page", fake_render_page)
        with pytest.raises(UnsafeUrlError):
            await extract_website("https://spa-site.example/")

    @pytest.mark.asyncio
    async def test_fetch_failure_becomes_a_warning_not_an_exception(self, monkeypatch):
        async def fake_fetch_page(url: str) -> str:
            raise ValueError("Could not fetch URL: connection refused")

        monkeypatch.setattr("extraction.fetch_page", fake_fetch_page)
        fields, warnings = await extract_website("https://unreachable.example/")
        assert fields == {}
        assert "connection refused" in warnings[0]


@pytest.fixture
def client(monkeypatch):
    from main import app

    return TestClient(app)


class TestExtractWebsiteRoute:
    def test_happy_path(self, client, monkeypatch):
        async def fake_extract_website(url: str):
            return {"company_name": CLAUDE_EXTRACTION_RESPONSE["fields"]["company_name"]}, []

        monkeypatch.setattr("routes.extract.extract_website", fake_extract_website)
        resp = client.post("/extract/website", json={"url": "https://example.com/"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["source_url"] == "https://example.com/"
        assert body["fields"]["company_name"]["value"] == "Jangdok Foods"

    def test_unsafe_url_returns_400(self, client, monkeypatch):
        async def fake_extract_website(url: str):
            raise UnsafeUrlError("disallowed IP")

        monkeypatch.setattr("routes.extract.extract_website", fake_extract_website)
        resp = client.post("/extract/website", json={"url": "http://169.254.169.254/"})
        assert resp.status_code == 400

    def test_generic_failure_returns_502(self, client, monkeypatch):
        async def fake_extract_website(url: str):
            raise ValueError("boom")

        monkeypatch.setattr("routes.extract.extract_website", fake_extract_website)
        resp = client.post("/extract/website", json={"url": "https://example.com/"})
        assert resp.status_code == 502

    def test_internal_secret_enforced_when_configured(self, client, monkeypatch):
        monkeypatch.setattr("internal_auth.settings.ai_service_secret", "shh")

        async def fake_extract_website(url: str):
            return {}, []

        monkeypatch.setattr("routes.extract.extract_website", fake_extract_website)

        resp_no_header = client.post("/extract/website", json={"url": "https://example.com/"})
        assert resp_no_header.status_code == 401

        resp_wrong = client.post(
            "/extract/website",
            json={"url": "https://example.com/"},
            headers={"x-internal-secret": "wrong"},
        )
        assert resp_wrong.status_code == 401

        resp_correct = client.post(
            "/extract/website",
            json={"url": "https://example.com/"},
            headers={"x-internal-secret": "shh"},
        )
        assert resp_correct.status_code == 200
