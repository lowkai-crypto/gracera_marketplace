import pytest

from claude_util import extract_text


class FakeBlock:
    def __init__(self, type_: str, text: str | None = None):
        self.type = type_
        if text is not None:
            self.text = text


class FakeMessage:
    def __init__(self, content):
        self.content = content


class TestExtractText:
    def test_returns_text_when_it_is_the_first_block(self):
        message = FakeMessage([FakeBlock("text", "hello")])
        assert extract_text(message) == "hello"

    def test_skips_a_leading_non_text_block(self):
        # Reproduces the real bug: Claude can emit an extended-thinking
        # block before the actual text response. content[0].text would
        # raise AttributeError on the thinking block, since it has no
        # .text attribute at all.
        message = FakeMessage([FakeBlock("thinking"), FakeBlock("text", "the real answer")])
        assert extract_text(message) == "the real answer"

    def test_raises_when_no_text_block_exists(self):
        message = FakeMessage([FakeBlock("thinking")])
        with pytest.raises(ValueError, match="no text block"):
            extract_text(message)
