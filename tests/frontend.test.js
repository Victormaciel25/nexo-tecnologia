import test from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "../frontend/validation.js";
const valid = {
  id: "ac27c2a0-6bd3-49c8-9a22-06f31ccf7b0f",
  name: "Pessoa Teste",
  email: "qa@example.com",
  company: "Empresa Teste",
  service: "Integrações",
  cep: "01001000",
  street: "Praça da Sé",
  number: "S/N",
  district: "Sé",
  city: "São Paulo",
  state: "SP",
  message: "Integração entre os sistemas da empresa.",
  consent: true,
  website: "",
};
test("formulário aceita dados válidos e normaliza espaços", () => {
  const result = contactSchema.parse({ ...valid, name: "  Pessoa Teste  " });
  assert.equal(result.name, "Pessoa Teste");
});
test("validação impede envio com campos inválidos", () => {
  for (const change of [
    { email: "a@" },
    { consent: false },
    { cep: "123" },
    { state: "XX" },
    { message: "curta" },
    { service: "outro" },
    { website: "spam" },
    { name: "" },
    { id: "bad" },
  ])
    assert.equal(
      contactSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
