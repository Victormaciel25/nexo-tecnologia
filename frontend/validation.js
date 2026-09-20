import { z } from "zod";
import rules from "../shared/contact-rules.json" with { type: "json" };
export const { states, services } = rules;
const fields = Object.fromEntries(
  Object.entries(rules.fields).map(([name, rule]) => [
    name,
    z
      .string({
        required_error: rule.message,
        invalid_type_error: rule.message,
      })
      .trim()
      .min(rule.min, rule.message)
      .max(rule.max, `Use até ${rule.max} caracteres.`),
  ]),
);
export const contactSchema = z.object({
  ...fields,
  email: fields.email.regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Informe um e-mail válido.",
  ),
  id: z.string().uuid("Identificador de envio inválido."),
  service: z
    .string({ required_error: "Selecione um serviço." })
    .refine((v) => services.includes(v), "Selecione um serviço."),
  state: z
    .string({ required_error: "Selecione a UF." })
    .refine((v) => states.includes(v), "Selecione a UF."),
  cep: z.string().regex(/^[0-9]{8}$/, "Informe um CEP com 8 dígitos."),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Autorize o uso dos dados para este contato.",
    }),
  }),
  website: z.literal("", { errorMap: () => ({ message: "Envio inválido." }) }),
});
