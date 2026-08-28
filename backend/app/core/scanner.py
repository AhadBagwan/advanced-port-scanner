"""Port scanning engine"""

import ipaddress
import socket
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional, Union

from app.utils.logger import logger

PRESET_PROFILES = {
    "web": [80, 443, 8000, 8080, 8443],
    "database": [1433, 1521, 3306, 5432, 6379, 27017],
    "remote_management": [21, 22, 23, 3389, 5900],
    "top100": [
        20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 123, 135, 137, 138, 139, 143, 161, 162, 389, 443,
        445, 465, 500, 514, 587, 636, 993, 995, 1025, 1433, 1521, 1723, 3306, 3389, 5432, 5900, 6379,
        8000, 8080, 8443, 8888, 9000, 9200, 27017
    ],
}


def parse_target_hosts(target: str) -> List[str]:
    """Parse target string (single IP, domain, comma-separated, or CIDR range) into list of IP strings"""
    target = target.strip()
    if "/" in target:
        try:
            network = ipaddress.ip_network(target, strict=False)
            hosts = [str(ip) for ip in list(network.hosts())[:64]]
            return hosts if hosts else [target.split("/")[0]]
        except ValueError:
            pass

    if "," in target:
        return [t.strip() for t in target.split(",") if t.strip()]

    return [target]


class PortScanner:
    """TCP Port Scanner"""

    def __init__(self, timeout: float = 0.5, max_workers: int = 200):
        """Initialize scanner with timeout and worker count"""
        self.timeout = timeout
        self.max_workers = max_workers

    def is_port_open(self, host: str, port: int) -> bool:
        """Check if a single port is open"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(self.timeout)
                result = sock.connect_ex((host, port))
                return result == 0
        except (socket.error, socket.timeout) as e:
            logger.debug(f"Error scanning {host}:{port} - {str(e)}")
            return False

    def scan_ports(
        self,
        host: str,
        ports: List[int],
        progress_callback=None,
    ) -> List[int]:
        """Scan an explicit list of ports"""
        open_ports: List[int] = []
        total_ports = len(ports)

        logger.info(f"Starting port scan on {host} for {total_ports} target ports")

        try:
            with ThreadPoolExecutor(max_workers=min(self.max_workers, max(1, total_ports))) as executor:
                futures = {
                    executor.submit(self.is_port_open, host, port): port
                    for port in ports
                }

                for index, future in enumerate(as_completed(futures)):
                    port = futures[future]
                    try:
                        if future.result():
                            open_ports.append(port)
                            logger.debug(f"Open port found: {port}")
                    except Exception as e:
                        logger.error(f"Error checking port {port}: {str(e)}")

                    if progress_callback:
                        progress_percent = int((index + 1) / total_ports * 100)
                        progress_callback(port, index + 1, total_ports, progress_percent)

            open_ports.sort()
            logger.info(f"Scan completed. Found {len(open_ports)} open ports")
            return open_ports

        except Exception as e:
            logger.error(f"Port scan failed: {str(e)}")
            raise

    def scan_port_range(
        self,
        host: str,
        start_port: int,
        end_port: int,
        progress_callback=None,
    ) -> List[int]:
        """Scan a range of ports and return list of open ports"""
        ports = list(range(start_port, end_port + 1))
        return self.scan_ports(host, ports, progress_callback)


def get_scanner(timeout: float = None, max_workers: int = None) -> PortScanner:
    """Factory function to create scanner with settings"""
    from app.config import settings

    return PortScanner(
        timeout=timeout or settings.DEFAULT_TIMEOUT,
        max_workers=max_workers or settings.DEFAULT_WORKERS,
    )
