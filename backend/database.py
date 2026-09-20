"""Persistência SQLite com transações e SQL parametrizado."""
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

COLUMNS = ("id", "name", "email", "company", "service", "cep", "street",
           "number", "district", "city", "state", "message", "consent")


def connect(path):
    connection = sqlite3.connect(str(path), timeout=5)
    connection.row_factory = sqlite3.Row
    return connection


def initialize(path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    connection = connect(path)
    try:
        connection.execute("PRAGMA journal_mode=WAL")
        with connection:
            connection.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL, email TEXT NOT NULL,
                    company TEXT NOT NULL, service TEXT NOT NULL,
                    cep TEXT NOT NULL, street TEXT NOT NULL,
                    number TEXT NOT NULL, district TEXT NOT NULL,
                    city TEXT NOT NULL, state TEXT NOT NULL,
                    message TEXT NOT NULL, consent INTEGER NOT NULL CHECK(consent = 1),
                    created_at TEXT NOT NULL
                )
            """)
            connection.execute("PRAGMA user_version=1")
    finally:
        connection.close()


class ConflictingSubmission(Exception):
    """Um protocolo já foi usado para dados diferentes."""


def save_contact(path, contact):
    connection = connect(path)
    try:
        values = tuple(contact[name] for name in COLUMNS)
        with connection:
            cursor = connection.execute(
                "INSERT INTO contacts (" + ",".join(COLUMNS) + ",created_at) "
                "VALUES (" + ",".join("?" for _ in range(len(COLUMNS) + 1)) + ") "
                "ON CONFLICT(id) DO NOTHING",
                (*values, datetime.now(timezone.utc).isoformat()),
            )
            if cursor.rowcount == 0:
                row = connection.execute("SELECT * FROM contacts WHERE id = ?", (contact["id"],)).fetchone()
                if tuple(row[name] for name in COLUMNS) != values:
                    raise ConflictingSubmission
    finally:
        connection.close()
