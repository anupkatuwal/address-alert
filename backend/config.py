from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Resend API key (https://resend.com — free tier, no credit card)
    resend_api_key: str = ""

    # Frontend origin allowed for CORS
    frontend_origin: str = "http://localhost:5173"

    @property
    def email_configured(self) -> bool:
        return bool(self.resend_api_key)


settings = Settings()
