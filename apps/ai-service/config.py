from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5"
    ai_service_secret: str = ""
    # Escape hatch for the headless-render fallback (extraction.py /
    # browser_fetch.py) — the production host has very little RAM headroom,
    # so this can be flipped off via env var if it causes memory pressure,
    # without a code revert/redeploy.
    enable_headless_render: bool = True
    headless_render_timeout_seconds: float = 10.0


settings = Settings()
