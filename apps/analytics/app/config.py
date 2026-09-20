import os
from dataclasses import dataclass


@dataclass
class Settings:
    database_url: str = os.getenv(
        "ANALYTICS_DATABASE_URL",
        "postgresql://analytics_reader:analytics_readonly@localhost:5432/projectana",
    )
    port: int = int(os.getenv("ANALYTICS_PORT", "8000"))
    environment: str = os.getenv("ENVIRONMENT", "development")


settings = Settings()
