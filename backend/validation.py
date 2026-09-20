"""Regras compartilhadas com o formulário JavaScript."""
import json
import re
from pathlib import Path
from uuid import UUID

RULES = json.loads((Path(__file__).resolve().parents[1] / "shared/contact-rules.json").read_text(encoding="utf-8"))


def validate_contact(payload):
    if not isinstance(payload, dict):
        return {}, {"form": ["Envie um objeto JSON."]}
    cleaned, errors = {}, {}
    for name, rule in RULES["fields"].items():
        value = payload.get(name)
        if not isinstance(value, str):
            errors[name] = [rule["message"]]
            continue
        value = value.strip()
        cleaned[name] = value
        if len(value) < rule["min"]:
            errors[name] = [rule["message"]]
        elif len(value) > rule["max"]:
            errors[name] = [f"Use até {rule['max']} caracteres."]
    if "email" in cleaned and not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", cleaned["email"]):
        errors["email"] = ["Informe um e-mail válido."]
    if "email" in cleaned:
        cleaned["email"] = cleaned["email"].lower()
    identifier = payload.get("id")
    try:
        if not isinstance(identifier, str) or str(UUID(identifier)) != identifier.lower():
            raise ValueError
        cleaned["id"] = identifier.lower()
    except (ValueError, AttributeError):
        errors["id"] = ["Identificador de envio inválido."]
    for name, choices, message in [
        ("service", RULES["services"], "Selecione um serviço."),
        ("state", RULES["states"], "Selecione a UF."),
    ]:
        value = payload.get(name)
        if not isinstance(value, str) or value not in choices:
            errors[name] = [message]
        else:
            cleaned[name] = value
    cep = payload.get("cep")
    if not isinstance(cep, str) or not re.fullmatch(r"[0-9]{8}", cep):
        errors["cep"] = ["Informe um CEP com 8 dígitos."]
    else:
        cleaned["cep"] = cep
    if payload.get("consent") is not True:
        errors["consent"] = ["Autorize o uso dos dados para este contato."]
    cleaned["consent"] = 1
    if payload.get("website") != "":
        errors["website"] = ["Envio inválido."]
    return cleaned, errors
