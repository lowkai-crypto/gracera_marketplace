import anthropic

from config import settings


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def strip_code_fence(text: str) -> str:
    """Claude sometimes wraps JSON output in a ```json ... ``` fence despite
    being told not to. Strip it if present."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[: -len("```")]
    return text.strip()
