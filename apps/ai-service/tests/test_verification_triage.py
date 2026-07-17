import json

import pytest
from fastapi.testclient import TestClient

from verification_triage import triage_verification


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


PROFILE = {
    "companyName": "Golden Phoenix Textile Co.",
    "country": "CN",
    "businessRegNumber": "12-not-a-real-format",
    "description": "We are a leading provider of quality products.",
}

TRIAGE_RESPONSE = {
    "flags": [
        {
            "field": "businessRegNumber",
            "concern": "Format does not match typical Chinese business registration number patterns.",
            "severity": "medium",
        },
        {
            "field": "description",
            "concern": "Reads as generic boilerplate rather than specific to this business.",
            "severity": "low",
        },
    ],
    "overall_assessment": "A couple of items worth a closer look, nothing alarming.",
}


class TestTriageVerification:
    @pytest.mark.asyncio
    async def test_parses_flags_and_assessment(self, monkeypatch):
        monkeypatch.setattr(
            "verification_triage.get_client", lambda: FakeClient(json.dumps(TRIAGE_RESPONSE))
        )

        flags, overall_assessment = await triage_verification(PROFILE)

        assert len(flags) == 2
        assert flags[0].field == "businessRegNumber"
        assert flags[0].severity == "medium"
        assert overall_assessment == "A couple of items worth a closer look, nothing alarming."

    @pytest.mark.asyncio
    async def test_empty_flags_when_nothing_stands_out(self, monkeypatch):
        clean_response = {"flags": [], "overall_assessment": "No significant concerns."}
        monkeypatch.setattr("verification_triage.get_client", lambda: FakeClient(json.dumps(clean_response)))

        flags, overall_assessment = await triage_verification(PROFILE)

        assert flags == []
        assert overall_assessment == "No significant concerns."

    @pytest.mark.asyncio
    async def test_drops_a_malformed_flag_missing_required_keys(self, monkeypatch):
        malformed = {
            "flags": [
                {"field": "description", "concern": "Missing severity"},  # no "severity"
                *TRIAGE_RESPONSE["flags"],
            ],
            "overall_assessment": "Mixed.",
        }
        monkeypatch.setattr("verification_triage.get_client", lambda: FakeClient(json.dumps(malformed)))

        flags, _ = await triage_verification(PROFILE)

        assert len(flags) == 2  # the malformed one is dropped, not crashed on

    @pytest.mark.asyncio
    async def test_raises_on_non_json_response(self, monkeypatch):
        monkeypatch.setattr("verification_triage.get_client", lambda: FakeClient("not json"))
        with pytest.raises(ValueError, match="non-JSON"):
            await triage_verification(PROFILE)


@pytest.fixture
def client(monkeypatch):
    from main import app

    return TestClient(app)


class TestVerificationTriageRoute:
    def test_happy_path(self, client, monkeypatch):
        async def fake_triage(profile):
            from models import VerificationFlag

            return [VerificationFlag(field="businessRegNumber", concern="format concern", severity="medium")], "Mostly fine."

        monkeypatch.setattr("routes.verification.triage_verification", fake_triage)
        resp = client.post("/assist/verification-triage", json={"profile": PROFILE})
        assert resp.status_code == 200
        body = resp.json()
        assert body["overall_assessment"] == "Mostly fine."
        assert body["flags"][0]["severity"] == "medium"

    def test_generic_failure_returns_502(self, client, monkeypatch):
        async def fake_triage(profile):
            raise ValueError("boom")

        monkeypatch.setattr("routes.verification.triage_verification", fake_triage)
        resp = client.post("/assist/verification-triage", json={"profile": PROFILE})
        assert resp.status_code == 502

    def test_internal_secret_enforced_when_configured(self, client, monkeypatch):
        monkeypatch.setattr("internal_auth.settings.ai_service_secret", "shh")

        async def fake_triage(profile):
            return [], "fine"

        monkeypatch.setattr("routes.verification.triage_verification", fake_triage)
        body = {"profile": PROFILE}

        resp_no_header = client.post("/assist/verification-triage", json=body)
        assert resp_no_header.status_code == 401

        resp_correct = client.post("/assist/verification-triage", json=body, headers={"x-internal-secret": "shh"})
        assert resp_correct.status_code == 200
