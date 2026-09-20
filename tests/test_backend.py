from contextlib import closing
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch
from uuid import uuid4
import requests
from backend.app import create_app


class BackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.db = str(Path(self.temp.name) / "contacts.sqlite3")
        dist = Path(self.temp.name) / "dist"
        dist.mkdir()
        (dist / "index.html").write_text("<html>Nexo Tecnologia</html>")
        self.config = {"TESTING": True, "DATABASE": self.db, "DIST_DIR": str(dist)}
        self.app = create_app(self.config)
        self.client = self.app.test_client()
        self.data = dict(id=str(uuid4()), name="Pessoa Teste", email="qa@example.com",
                         company="Empresa Teste", service="Integrações", cep="01001000",
                         street="Praça da Sé", number="S/N", district="Sé", city="São Paulo",
                         state="SP", message="Integração entre os sistemas da empresa.",
                         consent=True, website="")

    def post(self, data=None, **kwargs):
        return self.client.post("/api/contatos", json=self.data if data is None else data, **kwargs)

    def test_persists_after_app_restart_and_deduplicates(self):
        for _ in range(2):
            response = self.post()
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json["protocol"], self.data["id"])
        create_app(self.config)
        with closing(sqlite3.connect(self.db)) as db:
            rows = db.execute("SELECT email, message, consent FROM contacts").fetchall()
        self.assertEqual(rows, [(self.data["email"], self.data["message"], 1)])

    def test_conflicting_retry_does_not_overwrite(self):
        self.post()
        response = self.post({**self.data, "name": "Outra Pessoa"})
        self.assertEqual(response.status_code, 409)

    def test_validation_and_invalid_types(self):
        for update in [{"name": ""}, {"email": "x@"}, {"state": "XX"},
                       {"cep": "123"}, {"consent": False}, {"consent": 1},
                       {"service": "outro"}, {"message": "curto"},
                       {"website": "spam"}, {"id": "bad"}, {"name": []}]:
            with self.subTest(update=update):
                self.assertEqual(self.post({**self.data, **update}).status_code, 422)
        self.assertEqual(self.post([]).status_code, 422)

    def test_http_guards(self):
        self.assertEqual(self.post(headers={"Origin": "https://elsewhere.example"}).status_code, 403)
        self.assertEqual(self.post(headers={"Origin": "http://localhost"}).status_code, 201)
        self.assertEqual(self.client.post("/api/contatos", data="x").status_code, 415)
        self.assertEqual(self.client.post("/api/contatos", data="{", content_type="application/json").status_code, 400)
        self.assertEqual(self.client.post("/api/contatos", data="x"*16001, content_type="application/json").status_code, 413)
        self.assertEqual(self.client.get("/api/contatos").status_code, 405)

    def test_sql_injection_is_stored_as_text(self):
        name = "Pessoa'); DROP TABLE contacts; --"
        self.assertEqual(self.post({**self.data, "name": name}).status_code, 201)
        with closing(sqlite3.connect(self.db)) as db:
            self.assertEqual(db.execute("SELECT name FROM contacts").fetchone()[0], name)

    @patch("backend.app.save_contact", side_effect=sqlite3.OperationalError("offline"))
    def test_storage_failure(self, _save):
        with self.assertLogs(self.app.logger, level="ERROR"):
            response = self.post()
        self.assertEqual(response.status_code, 503)
        self.assertIn("mantidos", response.json["error"])

    @patch("backend.app.requests.get")
    def test_cep_success(self, get):
        get.return_value = Mock(json=lambda: {"logradouro": "Praça da Sé", "bairro": "Sé",
                                             "localidade": "São Paulo", "uf": "SP"})
        response = self.client.get("/api/cep/01001000")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["city"], "São Paulo")
        get.assert_called_once_with("https://viacep.com.br/ws/01001000/json/", timeout=(3, 5))

    @patch("backend.app.requests.get")
    def test_cep_failures(self, get):
        self.assertEqual(self.client.get("/api/cep/123").status_code, 400)
        get.assert_not_called()
        get.return_value = Mock(json=lambda: {"erro": True})
        self.assertEqual(self.client.get("/api/cep/99999999").status_code, 404)
        get.return_value = Mock(json=lambda: [])
        self.assertEqual(self.client.get("/api/cep/01001000").status_code, 502)
        get.side_effect = requests.Timeout()
        self.assertEqual(self.client.get("/api/cep/01001000").status_code, 502)

    def test_pages_and_no_source_exposure(self):
        for path in ["/", "/servicos", "/contato"]:
            with self.client.get(path) as response:
                self.assertEqual(response.status_code, 200)
        for path in ["/backend/app.py", "/data/nexo.sqlite3", "/unknown"]:
            self.assertEqual(self.client.get(path).status_code, 404)


if __name__ == "__main__":
    unittest.main()
