import pytest
from fastapi.testclient import TestClient

from deal_assist import draft_deal_message, translate_deal_message


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


class TestDraftDealMessage:
    @pytest.mark.asyncio
    async def test_returns_the_draft_text_directly(self, monkeypatch):
        monkeypatch.setattr(
            "deal_assist.get_client",
            lambda: FakeClient("Would you be able to offer a discount for a 10,000-unit order?"),
        )

        draft = await draft_deal_message(
            intent="ask about bulk discount",
            counterpart_context={"companyName": "Golden Phoenix Textile Co."},
            match_summary="Strong category and geography fit.",
            recent_messages=[{"sender": "me", "body": "Hi, interested in your sleepers."}],
            target_language=None,
        )

        assert "discount" in draft.lower()

    @pytest.mark.asyncio
    async def test_strips_code_fence_if_present(self, monkeypatch):
        monkeypatch.setattr("deal_assist.get_client", lambda: FakeClient("```\nHello there\n```"))

        draft = await draft_deal_message(
            intent="say hello", counterpart_context={}, match_summary="", recent_messages=[], target_language=None
        )

        assert draft == "Hello there"

    @pytest.mark.asyncio
    async def test_passes_target_language_into_the_prompt(self, monkeypatch):
        captured = {}

        class CapturingMessages:
            def create(self, **kwargs):
                captured["prompt"] = kwargs["messages"][0]["content"]
                return FakeMessage("Hola")

        class CapturingClient:
            def __init__(self):
                self.messages = CapturingMessages()

        monkeypatch.setattr("deal_assist.get_client", lambda: CapturingClient())

        await draft_deal_message(
            intent="say hello", counterpart_context={}, match_summary="", recent_messages=[], target_language="Spanish"
        )

        assert "Spanish" in captured["prompt"]


class TestTranslateDealMessage:
    @pytest.mark.asyncio
    async def test_returns_the_translated_text_directly(self, monkeypatch):
        monkeypatch.setattr("deal_assist.get_client", lambda: FakeClient("Hola, gracias por su interes."))

        translated = await translate_deal_message("Hello, thanks for your interest.", "Spanish")

        assert translated == "Hola, gracias por su interes."


@pytest.fixture
def client(monkeypatch):
    from main import app

    return TestClient(app)


class TestDealMessageRoute:
    def test_draft_mode(self, client, monkeypatch):
        async def fake_draft(intent, counterpart_context, match_summary, recent_messages, target_language):
            return "Drafted message."

        monkeypatch.setattr("routes.deal_assist.draft_deal_message", fake_draft)
        resp = client.post("/assist/deal-message", json={"mode": "draft", "intent": "say hello"})
        assert resp.status_code == 200
        assert resp.json()["draft"] == "Drafted message."

    def test_translate_mode(self, client, monkeypatch):
        async def fake_translate(text, target_language):
            return "Translated message."

        monkeypatch.setattr("routes.deal_assist.translate_deal_message", fake_translate)
        resp = client.post(
            "/assist/deal-message",
            json={"mode": "translate", "text": "Hello", "target_language": "Spanish"},
        )
        assert resp.status_code == 200
        assert resp.json()["draft"] == "Translated message."

    def test_generic_failure_returns_502(self, client, monkeypatch):
        async def fake_draft(intent, counterpart_context, match_summary, recent_messages, target_language):
            raise ValueError("boom")

        monkeypatch.setattr("routes.deal_assist.draft_deal_message", fake_draft)
        resp = client.post("/assist/deal-message", json={"mode": "draft", "intent": "say hello"})
        assert resp.status_code == 502

    def test_internal_secret_enforced_when_configured(self, client, monkeypatch):
        monkeypatch.setattr("internal_auth.settings.ai_service_secret", "shh")

        async def fake_draft(intent, counterpart_context, match_summary, recent_messages, target_language):
            return "Drafted message."

        monkeypatch.setattr("routes.deal_assist.draft_deal_message", fake_draft)
        body = {"mode": "draft", "intent": "say hello"}

        resp_no_header = client.post("/assist/deal-message", json=body)
        assert resp_no_header.status_code == 401

        resp_correct = client.post("/assist/deal-message", json=body, headers={"x-internal-secret": "shh"})
        assert resp_correct.status_code == 200
