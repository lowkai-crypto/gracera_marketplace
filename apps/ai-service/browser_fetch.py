import asyncio

from playwright.async_api import Browser, Playwright, async_playwright

from url_safety import UnsafeUrlError, assert_safe_url

USER_AGENT = "GraceraBot/1.0 (+https://gracera.ai; profile pre-fill)"

# Two separate locks: `_launch_lock` only guards the one-time Chromium
# launch; `_render_lock` serializes actual page renders (one at a time,
# regardless of concurrent pre-fill requests — the production host has very
# little RAM headroom, so a browser-per-request model isn't safe there).
# Keeping these separate matters because render_page() holds _render_lock
# for its whole duration and then calls get_browser() — if both used the
# same lock, that inner acquire would deadlock against itself (asyncio.Lock
# isn't reentrant). One warm browser instance is reused across requests to
# avoid paying launch cost on every call.
_launch_lock = asyncio.Lock()
_render_lock = asyncio.Lock()
_playwright: Playwright | None = None
_browser: Browser | None = None


async def get_browser() -> Browser:
    """Idempotent: launches Chromium once and caches it. Safe to call from
    both the app's startup lifespan (to surface launch failures early) and
    lazily from render_page (in case startup didn't run or failed)."""
    global _playwright, _browser
    if _browser is not None and _browser.is_connected():
        return _browser

    async with _launch_lock:
        if _browser is not None and _browser.is_connected():
            return _browser
        if _playwright is None:
            _playwright = await async_playwright().start()
        # --no-sandbox is required to run headless Chromium as a non-root,
        # unprivileged container user (no CAP_SYS_ADMIN available).
        _browser = await _playwright.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        )
        return _browser


async def shutdown_browser() -> None:
    global _playwright, _browser
    if _browser is not None:
        await _browser.close()
        _browser = None
    if _playwright is not None:
        await _playwright.stop()
        _playwright = None


async def render_page(url: str, timeout_seconds: float) -> str:
    """Renders `url` in headless Chromium and returns the resulting HTML —
    the fallback for pages whose useful content only appears after the
    page's own JavaScript runs (client-rendered SPAs), which a plain HTTP
    fetch can never see."""
    # Off the event loop for the same reason guard_request below is: this
    # does a blocking DNS lookup.
    await asyncio.to_thread(assert_safe_url, url)

    async with _render_lock:
        browser = await get_browser()
        context = await browser.new_context(user_agent=USER_AGENT)
        try:
            page = await context.new_page()

            blocked: dict[str, str] = {}

            async def guard_request(route):
                try:
                    # assert_safe_url does a blocking DNS lookup
                    # (socket.getaddrinfo) — running it directly on this
                    # callback would block the event loop that Playwright's
                    # own CDP protocol needs to keep spinning, which can
                    # stall navigation entirely (observed: a multi-minute
                    # hang in local testing, fixed by moving it to a
                    # thread).
                    await asyncio.to_thread(assert_safe_url, route.request.url)
                except UnsafeUrlError as exc:
                    blocked["reason"] = str(exc)
                    await route.abort()
                    return
                await route.continue_()

            await page.route("**/*", guard_request)

            try:
                # "networkidle" is deliberately avoided: it waits for ALL
                # network activity to stop, which many real sites (ads,
                # countdown timers, analytics beacons, chat widgets) never
                # actually do — confirmed live against the exact site this
                # feature targets, which timed out waiting for networkidle
                # even though its content had already rendered. "load" only
                # waits for the page's own load event, which is what
                # actually gates whether the SPA's JS has run.
                await page.goto(url, wait_until="load", timeout=timeout_seconds * 1000)
                # A brief settle window for client-side rendering that
                # happens just after the load event fires (typical for
                # SPAs that bootstrap their framework on `load`).
                await page.wait_for_timeout(1500)
            except Exception as exc:
                if blocked:
                    raise UnsafeUrlError(blocked["reason"]) from exc
                raise ValueError(f"Could not render page: {exc}") from exc

            if blocked:
                raise UnsafeUrlError(blocked["reason"])

            return await page.content()
        finally:
            await context.close()
