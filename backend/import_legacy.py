"""Importa contatos de um SQLite anterior sem modificar o arquivo de origem."""
import argparse
import os
import sqlite3
from pathlib import Path
from backend.database import COLUMNS, connect, initialize
from backend.app import ROOT


def import_contacts(source, target):
    source, target = Path(source).resolve(), Path(target).resolve()
    if source == target:
        raise ValueError("Origem e destino devem ser diferentes.")
    origin = sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)
    origin.row_factory = sqlite3.Row
    try:
        rows = origin.execute("SELECT * FROM contacts").fetchall()
    finally:
        origin.close()
    initialize(target)
    destination = connect(target)
    inserted = 0
    try:
        with destination:
            for row in rows:
                existing = destination.execute("SELECT * FROM contacts WHERE id=?", (row["id"],)).fetchone()
                if existing:
                    if any(existing[key] != row[key] for key in (*COLUMNS, "created_at")):
                        raise ValueError("Há um protocolo com dados diferentes no destino.")
                    continue
                names = (*COLUMNS, "created_at")
                destination.execute("INSERT INTO contacts (" + ",".join(names) + ") VALUES (" +
                                    ",".join("?" for _ in names) + ")", tuple(row[key] for key in names))
                inserted += 1
    finally:
        destination.close()
    return inserted


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="Caminho do banco SQLite anterior")
    parser.add_argument("--target", default=os.environ.get("NEXO_DATABASE", str(ROOT / "data/nexo.sqlite3")))
    args = parser.parse_args()
    print(f"Contatos importados: {import_contacts(args.source, args.target)}")
