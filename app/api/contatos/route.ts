import { contactSchema } from "../../../lib/contact";
import { getDb } from "../../../db";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Origem não autorizada." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Envie os dados em JSON." }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 16000)
    return Response.json({ error: "Mensagem muito grande." }, { status: 413 });
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success)
    return Response.json(
      {
        error: "Revise os campos indicados.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  const d = parsed.data;
  try {
    await getDb()
      .prepare(
        "INSERT INTO contacts (id,name,email,company,service,cep,street,number,district,city,state,message,consent,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
      )
      .bind(
        d.id,
        d.name,
        d.email.toLowerCase(),
        d.company,
        d.service,
        d.cep,
        d.street,
        d.number,
        d.district,
        d.city,
        d.state,
        d.message,
        1,
        new Date().toISOString(),
      )
      .run();
    return Response.json(
      { protocol: d.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error(
      "Contact persistence failed",
      e instanceof Error ? e.message : "unknown",
    );
    return Response.json(
      {
        error:
          "Não foi possível salvar agora. Seus dados foram mantidos. Tente novamente.",
      },
      { status: 503 },
    );
  }
}
