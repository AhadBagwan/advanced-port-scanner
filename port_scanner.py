#!/usr/bin/env python3
"""
Simple TCP port scanner for authorized testing only.
Scans ports 20-1024 and prints open ports.
"""

import argparse
import socket
from concurrent.futures import ThreadPoolExecutor, as_completed


START_PORT = 20
END_PORT = 1024


def is_port_open(host: str, port: int, timeout: float) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout)
        return sock.connect_ex((host, port)) == 0


def scan_ports(host: str, timeout: float, workers: int) -> list[int]:
    open_ports: list[int] = []
    ports = range(START_PORT, END_PORT + 1)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(is_port_open, host, port, timeout): port for port in ports}
        for future in as_completed(futures):
            port = futures[future]
            try:
                if future.result():
                    open_ports.append(port)
            except OSError:
                # Skip transient socket errors for individual ports.
                continue

    open_ports.sort()
    return open_ports


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan ports 20-1024 on a target host.")
    parser.add_argument("target", help="Target IP or hostname")
    parser.add_argument(
        "--timeout",
        type=float,
        default=0.4,
        help="Socket timeout in seconds (default: 0.4)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=200,
        help="Number of concurrent worker threads (default: 200)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.timeout <= 0:
        raise ValueError("--timeout must be greater than 0")
    if args.workers < 1:
        raise ValueError("--workers must be at least 1")

    try:
        target_ip = socket.gethostbyname(args.target)
    except socket.gaierror as exc:
        raise ValueError(f"Could not resolve target '{args.target}'") from exc

    print(f"Scanning {args.target} ({target_ip}) ports {START_PORT}-{END_PORT} ...")
    open_ports = scan_ports(target_ip, args.timeout, args.workers)

    if not open_ports:
        print("No open ports found in range 20-1024.")
        return

    print("\nOpen ports:")
    for port in open_ports:
        print(port)


if __name__ == "__main__":
    main()
