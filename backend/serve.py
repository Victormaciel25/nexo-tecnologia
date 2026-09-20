"""Servidor WSGI para executar o build localmente."""
import os
from waitress import serve
from backend.app import create_app

if __name__ == "__main__":
    serve(create_app(), host=os.environ.get("NEXO_HOST", "127.0.0.1"),
          port=int(os.environ.get("PORT", "5000")))
