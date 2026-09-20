"""Servidor HTTP da Nexo: API Python e arquivos de produção."""
import os
import re
import sqlite3
from pathlib import Path

import requests
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import BadRequest, HTTPException

from backend.database import ConflictingSubmission, initialize, save_contact
from backend.validation import validate_contact

ROOT = Path(__file__).resolve().parents[1]


def create_app(config=None):
    app = Flask(__name__, static_folder=None)
    app.config.update(
        DATABASE=str(ROOT / "data/nexo.sqlite3"),
        DIST_DIR=str(ROOT / "dist"),
        MAX_CONTENT_LENGTH=16_000,
    )
    if os.environ.get("NEXO_DATABASE"):
        app.config["DATABASE"] = os.environ["NEXO_DATABASE"]
    if config:
        app.config.update(config)
    initialize(app.config["DATABASE"])

    @app.errorhandler(HTTPException)
    def http_error(error):
        messages = {400: "Dados inválidos.", 404: "Recurso não encontrado.",
                    405: "Método não permitido.", 413: "Mensagem muito grande.",
                    415: "Envie os dados em JSON."}
        return jsonify(error=messages.get(error.code, "Não foi possível concluir a solicitação.")), error.code

    @app.after_request
    def response_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.path.startswith("/api/") and "Cache-Control" not in response.headers:
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/api/contatos")
    def contacts():
        origin = request.headers.get("Origin")
        if origin and origin != request.host_url.rstrip("/"):
            return jsonify(error="Origem não autorizada."), 403
        if not request.is_json:
            return jsonify(error="Envie os dados em JSON."), 415
        try:
            payload = request.get_json()
        except BadRequest:
            return jsonify(error="Dados inválidos."), 400
        contact, errors = validate_contact(payload)
        if errors:
            return jsonify(error="Revise os campos indicados.", fields=errors), 422
        try:
            save_contact(app.config["DATABASE"], contact)
        except ConflictingSubmission:
            return jsonify(error="Este protocolo já foi usado com outros dados. Inicie um novo envio."), 409
        except sqlite3.Error:
            app.logger.exception("Falha ao salvar contato")
            return jsonify(error="Não foi possível salvar agora. Seus dados foram mantidos. Tente novamente."), 503
        return jsonify(protocol=contact["id"]), 201

    @app.get("/api/cep/<cep>")
    def postal_code(cep):
        if not re.fullmatch(r"[0-9]{8}", cep):
            return jsonify(error="Informe um CEP com 8 dígitos."), 400
        try:
            upstream = requests.get(f"https://viacep.com.br/ws/{cep}/json/", timeout=(3, 5))
            upstream.raise_for_status()
            data = upstream.json()
            if not isinstance(data, dict):
                raise ValueError("Resposta inválida")
            if data.get("erro"):
                return jsonify(error="CEP não encontrado. Confira ou preencha o endereço manualmente."), 404
            city, state = data.get("localidade"), data.get("uf")
            if not isinstance(city, str) or not city or not isinstance(state, str) or len(state) != 2:
                raise ValueError("Resposta incompleta")
            result = {"street": data.get("logradouro") or "", "district": data.get("bairro") or "",
                      "city": city, "state": state}
            if not all(isinstance(value, str) for value in result.values()):
                raise ValueError("Endereço inválido")
            return jsonify(result), 200, {"Cache-Control": "public, max-age=3600"}
        except (requests.RequestException, ValueError):
            return jsonify(error="A consulta de CEP está indisponível. Preencha o endereço manualmente."), 502

    @app.get("/")
    @app.get("/servicos")
    @app.get("/contato")
    def page():
        if not (Path(app.config["DIST_DIR"]) / "index.html").is_file():
            return jsonify(error="Interface não compilada. Execute npm run build ou use o servidor Vite."), 503
        return send_from_directory(app.config["DIST_DIR"], "index.html")

    @app.get("/assets/<path:filename>")
    def assets(filename):
        return send_from_directory(Path(app.config["DIST_DIR"]) / "assets", filename)

    @app.get("/favicon.svg")
    def favicon():
        return send_from_directory(app.config["DIST_DIR"], "favicon.svg")

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=5000, debug=False)
