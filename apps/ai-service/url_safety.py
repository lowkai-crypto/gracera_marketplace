import ipaddress
import socket
from urllib.parse import urlparse

ALLOWED_SCHEMES = {"http", "https"}
DEFAULT_PORTS = {"http": 80, "https": 443}


class UnsafeUrlError(ValueError):
    """Raised when a URL is not safe to fetch server-side (SSRF guard)."""


def assert_safe_url(url: str) -> None:
    """Raises UnsafeUrlError if `url` is not safe to fetch server-side.

    Guards against SSRF: only http(s), only default ports, and every IP the
    hostname resolves to must not be loopback/link-local/private/reserved
    (this blocks direct access to things like the cloud metadata endpoint
    at 169.254.169.254). Callers MUST call this on every redirect hop, not
    just the original URL — a malicious or compromised site can redirect a
    perfectly safe-looking URL to an internal target.

    Known residual risk (not closed in v0): DNS rebinding. We resolve and
    validate the hostname here, but the actual HTTP client resolves again
    when connecting — an attacker controlling DNS could serve a different
    (unsafe) IP on the second lookup. Fully closing this requires pinning
    the connection to the IP validated here, which needs a custom
    transport; deferred as a follow-up hardening step.
    """
    parsed = urlparse(url)

    if parsed.scheme not in ALLOWED_SCHEMES:
        raise UnsafeUrlError(f"Unsupported URL scheme: {parsed.scheme!r}")

    if not parsed.hostname:
        raise UnsafeUrlError("URL has no hostname")

    default_port = DEFAULT_PORTS[parsed.scheme]
    port = parsed.port or default_port
    if port != default_port:
        raise UnsafeUrlError(f"Non-default port not allowed: {port}")

    try:
        addrinfo = socket.getaddrinfo(parsed.hostname, None)
    except socket.gaierror as exc:
        raise UnsafeUrlError(f"Could not resolve hostname: {parsed.hostname}") from exc

    if not addrinfo:
        raise UnsafeUrlError(f"Could not resolve hostname: {parsed.hostname}")

    for _family, _type, _proto, _canonname, sockaddr in addrinfo:
        ip = ipaddress.ip_address(sockaddr[0])
        if (
            ip.is_loopback
            or ip.is_link_local
            or ip.is_private
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            raise UnsafeUrlError(f"{parsed.hostname} resolves to a disallowed IP address: {ip}")
