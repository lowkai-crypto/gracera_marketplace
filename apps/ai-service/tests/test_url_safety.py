from unittest.mock import patch

import pytest

from url_safety import UnsafeUrlError, assert_safe_url


class TestSchemeAndPort:
    def test_rejects_non_http_scheme(self):
        with pytest.raises(UnsafeUrlError, match="scheme"):
            assert_safe_url("ftp://example.com/")

    def test_rejects_file_scheme(self):
        with pytest.raises(UnsafeUrlError, match="scheme"):
            assert_safe_url("file:///etc/passwd")

    def test_rejects_non_default_port(self):
        with pytest.raises(UnsafeUrlError, match="port"):
            assert_safe_url("http://example.com:8080/")

    def test_accepts_explicit_default_port(self):
        with patch("url_safety.socket.getaddrinfo") as mock_resolve:
            mock_resolve.return_value = [(2, 1, 6, "", ("93.184.216.34", 0))]
            assert_safe_url("http://example.com:80/")


class TestDisallowedIpRanges:
    def test_rejects_loopback_ip_literal(self):
        with pytest.raises(UnsafeUrlError, match="disallowed IP"):
            assert_safe_url("http://127.0.0.1/")

    def test_rejects_localhost_hostname(self):
        with pytest.raises(UnsafeUrlError, match="disallowed IP"):
            assert_safe_url("http://localhost/")

    def test_rejects_cloud_metadata_endpoint(self):
        with pytest.raises(UnsafeUrlError, match="disallowed IP"):
            assert_safe_url("http://169.254.169.254/latest/meta-data/")

    def test_rejects_private_rfc1918_ip(self):
        with pytest.raises(UnsafeUrlError, match="disallowed IP"):
            assert_safe_url("http://10.0.0.5/")

    def test_rejects_private_192_168_ip(self):
        with pytest.raises(UnsafeUrlError, match="disallowed IP"):
            assert_safe_url("http://192.168.1.1/")

    def test_rejects_unspecified_address(self):
        with pytest.raises(UnsafeUrlError, match="disallowed IP"):
            assert_safe_url("http://0.0.0.0/")


class TestAcceptsPublicUrls:
    def test_accepts_public_ip(self):
        with patch("url_safety.socket.getaddrinfo") as mock_resolve:
            mock_resolve.return_value = [(2, 1, 6, "", ("93.184.216.34", 0))]
            assert_safe_url("https://example.com/about")

    def test_rejects_when_any_resolved_ip_is_unsafe(self):
        # A hostname resolving to multiple IPs must be rejected if ANY of
        # them is unsafe, not just the first.
        with patch("url_safety.socket.getaddrinfo") as mock_resolve:
            mock_resolve.return_value = [
                (2, 1, 6, "", ("93.184.216.34", 0)),
                (2, 1, 6, "", ("127.0.0.1", 0)),
            ]
            with pytest.raises(UnsafeUrlError, match="disallowed IP"):
                assert_safe_url("https://example.com/")


class TestResolutionFailure:
    def test_rejects_unresolvable_hostname(self):
        with pytest.raises(UnsafeUrlError, match="Could not resolve"):
            assert_safe_url("http://this-domain-should-not-exist-gracera-test.invalid/")
