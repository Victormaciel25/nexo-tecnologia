import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
const base = process.env.TEST_BASE_URL || "http://localhost:5173";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Execute apenas em banco e servidor locais.");
const id = randomUUID();
function sql(query) {
  const r = spawnSync(
    process.execPath,
    [
      "--import",
      "./scripts/sites-env.mjs",
      "./node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "DB",
      "--local",
      "--config",
      "dist/server/wrangler.json",
      "--persist-to",
      ".wrangler/state",
      "--command",
      query,
      "--json",
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout)[0].results;
}
async function request(route, init) {
  return fetch(base + route, { ...init, signal: AbortSignal.timeout(15000) });
}
const data = {
  id,
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
  message: "Teste automatizado com persistência no banco de dados.",
  consent: true,
  website: "",
};
const post = (body, headers = {}) =>
  request("/api/contatos", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
for (const route of ["/", "/servicos", "/contato"]) {
  const r = await request(route);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Nexo/);
}
assert.equal((await post({})).status, 422);
assert.equal((await post("{")).status, 400);
assert.equal(
  (await post(data, { origin: "https://untrusted.example" })).status,
  403,
);
assert.equal((await post(data, { "content-type": "text/plain" })).status, 415);
assert.equal((await post("x".repeat(16001))).status, 413);
assert.equal((await post({ ...data, consent: false })).status, 422);
assert.equal((await post({ ...data, website: "spam" })).status, 422);
assert.equal((await request("/api/cep/123")).status, 400);
const cep = await request("/api/cep/01001000");
assert.equal(cep.status, 200);
assert.equal((await cep.json()).city, "São Paulo");
assert.equal((await request("/api/cep/99999999")).status, 404);
try {
  for (let n = 0; n < 2; n++) {
    const r = await post(data);
    assert.equal(r.status, 201);
    assert.equal((await r.json()).protocol, id);
  }
  const rows = sql("SELECT * FROM contacts WHERE id='" + id + "'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, data.email);
  assert.equal(rows[0].message, data.message);
  assert.equal(rows[0].consent, 1);
  assert.notEqual((await request("/api/contatos")).status, 200);
  console.log(
    "PASS: três páginas, validação, origem, limites, ViaCEP, gravação SQLite e idempotência.",
  );
} finally {
  sql("DELETE FROM contacts WHERE id='" + id + "'");
}
