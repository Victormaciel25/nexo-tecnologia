import { z } from "zod";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> },
) {
  const { cep } = await params;
  if (!/^\d{8}$/.test(cep))
    return Response.json(
      { error: "Informe um CEP com 8 dígitos." },
      { status: 400 },
    );
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error("Upstream error");
    const d = z
      .object({
        erro: z.union([z.boolean(), z.string()]).optional(),
        localidade: z.string().optional(),
        uf: z.string().optional(),
        logradouro: z.string().optional(),
        bairro: z.string().optional(),
      })
      .parse(await response.json());
    if (d.erro)
      return Response.json(
        {
          error:
            "CEP não encontrado. Confira ou preencha o endereço manualmente.",
        },
        { status: 404 },
      );
    if (!d.localidade || !d.uf) throw new Error("Invalid upstream response");
    return Response.json(
      {
        street: d.logradouro || "",
        district: d.bairro || "",
        city: d.localidade,
        state: d.uf,
      },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "A consulta de CEP está indisponível. Preencha o endereço manualmente.",
      },
      { status: 502 },
    );
  }
}
