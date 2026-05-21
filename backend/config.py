from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Gmail SMTP credentials
    gmail_address: str = ""
    gmail_app_password: str = ""

    # Frontend origin allowed for CORS
    frontend_origin: str = "http://localhost:5173"

    @property
    def email_configured(self) -> bool:
        return bool(self.gmail_address and self.gmail_app_password)


settings = Settings()
