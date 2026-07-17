import anthropic

from config import settings


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def extract_text(message: anthropic.types.Message) -> str:
    """Returns the first text block's content from a Claude response.

    response.content[0] is not reliably the text block -- Claude can emit
    a ThinkingBlock (extended thinking) before the actual text response,
    which has no .text attribute and crashes a bare content[0].text access.
    Observed live while building sourcing_extraction.py; every call site
    across this service had the same latent bug.
    """
    for block in message.content:
        if block.type == "text":
            return block.text
    raise ValueError("Claude response contained no text block")


def strip_code_fence(text: str) -> str:
    """Claude sometimes wraps JSON output in a ```json ... ``` fence despite
    being told not to. Strip it if present."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[: -len("```")]
    return text.strip()
