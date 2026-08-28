"""Test port scanner"""

from app.core.scanner import PortScanner


def test_port_scanner_initialization():
    """Test scanner initialization"""
    scanner = PortScanner(timeout=0.5, max_workers=100)
    assert scanner.timeout == 0.5
    assert scanner.max_workers == 100


def test_is_port_open_localhost():
    """Test port check on localhost"""
    scanner = PortScanner(timeout=0.5)
    # This will likely fail since no service is running
    result = scanner.is_port_open("127.0.0.1", 12345)
    assert isinstance(result, bool)


def test_scan_port_range():
    """Test port range scanning"""
    scanner = PortScanner(timeout=0.1, max_workers=5)
    # Scan non-existent ports (should return empty or minimal results)
    ports = scanner.scan_port_range("127.0.0.1", 9000, 9010)
    assert isinstance(ports, list)
    assert all(isinstance(p, int) for p in ports)
