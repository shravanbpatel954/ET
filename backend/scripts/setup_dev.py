#!/usr/bin/env python3
"""Initialize the development environment."""

import subprocess
import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    env_file = root / ".env"
    env_example = root / ".env.example"

    if not env_file.exists() and env_example.exists():
        env_file.write_text(env_example.read_text())
        print("Created .env from .env.example")

    logs_dir = root / "logs"
    logs_dir.mkdir(exist_ok=True)
    print(f"Ensured logs directory: {logs_dir}")

    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    print("Setup complete.")


if __name__ == "__main__":
    main()
