"""CreditBlocks Python SDK Client"""
import hmac
import hashlib
import requests


class CreditBlocksClient:
    """Client for CreditBlocks API"""

    def __init__(self, api_key: str, base_url: str = "https://creditblocks-backend.onrender.com"):
        """
        Initialize CreditBlocks client

        Args:
            api_key: API key for authentication
            base_url: Base URL for the CreditBlocks API
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')

    def _headers(self) -> dict:
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }

    def get_score(self, address: str) -> dict:
        response = requests.get(
            f"{self.base_url}/api/v1/score/{address}",
            headers=self._headers(),
        )
        response.raise_for_status()
        return response.json()

    def verify_webhook_signature(self, payload: str, signature: str, secret: str) -> bool:
        computed = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(computed, signature)
