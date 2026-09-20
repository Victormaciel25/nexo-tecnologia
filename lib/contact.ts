import { z } from "zod";
export const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
export const services = [
  "Aplicações web",
  "Integrações",
  "Consultoria técnica",
  "Ainda não sei",
];
export const contactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3, "Informe seu nome completo.").max(100),
  email: z.string().trim().email("Informe um e-mail válido.").max(180),
  company: z.string().trim().min(2, "Informe a empresa.").max(120),
  service: z
    .string({ required_error: "Selecione um serviço." })
    .refine((v) => services.includes(v), "Selecione um serviço."),
  cep: z.string().regex(/^\d{8}$/, "Informe um CEP com 8 dígitos."),
  street: z.string().trim().min(2, "Informe o endereço.").max(180),
  number: z.string().trim().min(1, "Informe o número ou S/N.").max(20),
  district: z.string().trim().min(2, "Informe o bairro.").max(100),
  city: z.string().trim().min(2, "Informe a cidade.").max(100),
  state: z
    .string({ required_error: "Selecione a UF." })
    .refine((v) => states.includes(v), "Selecione a UF."),
  message: z
    .string()
    .trim()
    .min(20, "Descreva o projeto com pelo menos 20 caracteres.")
    .max(2000, "Use até 2.000 caracteres."),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Autorize o uso dos dados para este contato.",
    }),
  }),
  website: z.string().max(0),
});
