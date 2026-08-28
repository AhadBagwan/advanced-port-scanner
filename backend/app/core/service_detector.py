"""Service detection for ports"""

import json
from pathlib import Path
from typing import Dict, Optional


class ServiceDetector:
    """Detect services running on specific ports"""

    def __init__(self):
        """Initialize service detector with service database"""
        self.services = self._load_services()

    @staticmethod
    def _load_services() -> Dict[int, Dict[str, str]]:
        """Load service database from JSON file"""
        # Default services database
        default_services = {
            20: {"name": "FTP", "description": "File Transfer Protocol (data)"},
            21: {"name": "FTP", "description": "File Transfer Protocol (control)"},
            22: {"name": "SSH", "description": "Secure Shell"},
            23: {"name": "Telnet", "description": "Telnet"},
            25: {"name": "SMTP", "description": "Simple Mail Transfer Protocol"},
            53: {"name": "DNS", "description": "Domain Name System"},
            80: {"name": "HTTP", "description": "Hypertext Transfer Protocol"},
            110: {"name": "POP3", "description": "Post Office Protocol v3"},
            143: {"name": "IMAP", "description": "Internet Message Access Protocol"},
            443: {"name": "HTTPS", "description": "HTTP Secure"},
            445: {"name": "SMB", "description": "Server Message Block"},
            3306: {"name": "MySQL", "description": "MySQL Database"},
            3389: {"name": "RDP", "description": "Remote Desktop Protocol"},
            5432: {"name": "PostgreSQL", "description": "PostgreSQL Database"},
            5984: {"name": "CouchDB", "description": "CouchDB Database"},
            6379: {"name": "Redis", "description": "Redis Cache"},
            8000: {"name": "HTTP-Alt", "description": "HTTP Alternate"},
            8080: {"name": "HTTP-Proxy", "description": "HTTP Proxy"},
            8443: {"name": "HTTPS-Alt", "description": "HTTPS Alternate"},
            27017: {"name": "MongoDB", "description": "MongoDB Database"},
            5672: {"name": "AMQP", "description": "Advanced Message Queuing Protocol"},
            9200: {"name": "Elasticsearch", "description": "Elasticsearch"},
            9300: {"name": "Elasticsearch", "description": "Elasticsearch Node"},
            11211: {"name": "Memcached", "description": "Memcached"},
        }

        # Try to load from JSON file if it exists
        services_file = Path(__file__).parent.parent / "data" / "services.json"
        if services_file.exists():
            try:
                with open(services_file) as f:
                    loaded_services = json.load(f)
                    # Convert string keys to int
                    return {int(k): v for k, v in loaded_services.items()}
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading services file: {e}, using defaults")
                return default_services

        return default_services

    def get_service(self, port: int) -> Optional[Dict[str, str]]:
        """Get service information for a port"""
        return self.services.get(port)

    def get_service_name(self, port: int) -> str:
        """Get service name for a port"""
        service = self.get_service(port)
        return service.get("name", "Unknown") if service else "Unknown"

    def add_service(self, port: int, name: str, description: str) -> None:
        """Add or update service entry"""
        self.services[port] = {"name": name, "description": description}

    def get_all_services(self) -> Dict[int, Dict[str, str]]:
        """Get all known services"""
        return self.services.copy()


# Global detector instance
_detector = None


def get_detector() -> ServiceDetector:
    """Get or create global service detector instance"""
    global _detector
    if _detector is None:
        _detector = ServiceDetector()
    return _detector
