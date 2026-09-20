import { useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle, Search } from "lucide-react";
import { contactSchema, services, states } from "../validation.js";
export default function ContactForm() {
  const formRef = useRef(null);
  const requestId = useRef("");
  const lookupVersion = useRef(0);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState(false);
  const [cepInfo, setCepInfo] = useState("");
  const [failure, setFailure] = useState("");
  const [protocol, setProtocol] = useState("");
  const [count, setCount] = useState(0);
  function field(name, label, options = {}) {
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={options.type || "text"}
          maxLength={options.max || 100}
          autoComplete={options.autoComplete}
          placeholder={options.placeholder}
          required
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? name + "-error" : undefined}
        />
        {error(name)}
      </div>
    );
  }
  function error(name) {
    return (
      errors[name] && (
        <span className="field-error" id={name + "-error"}>
          {errors[name]?.[0]}
        </span>
      )
    );
  }
  async function findCep() {
    const form = formRef.current;
    if (!form) return;
    const input = form.elements.namedItem("cep");
    const cep = input.value.replace(/\D/g, "");
    const version = ++lookupVersion.current;
    if (cep.length !== 8) {
      setCepInfo("Digite os 8 números do CEP.");
      return;
    }
    setLookup(true);
    setCepInfo("Consultando endereço…");
    try {
      const r = await fetch("/api/cep/" + cep, {
        signal: AbortSignal.timeout(10000),
      });
      const data = await r.json();
      if (version !== lookupVersion.current) return;
      if (!r.ok) throw new Error(data.error);
      for (const key of ["street", "district", "city", "state"]) {
        form.elements.namedItem(key).value = data[key] || "";
      }
      setCepInfo(
        "Endereço encontrado pelo ViaCEP. Confira e complete o número.",
      );
    } catch (e) {
      if (version === lookupVersion.current)
        setCepInfo(
          e instanceof Error && e.name !== "TimeoutError"
            ? e.message
            : "A consulta demorou mais que o esperado. Preencha o endereço manualmente.",
        );
    } finally {
      if (version === lookupVersion.current) setLookup(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setFailure("");
    const data = Object.fromEntries(new FormData(form));
    requestId.current ||= crypto.randomUUID();
    const parsed = contactSchema.safeParse({
      ...data,
      id: requestId.current,
      cep: String(data.cep || "").replace(/\D/g, ""),
      consent: data.consent === "on",
    });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(fields);
      const first = Object.keys(fields)[0];
      form.elements.namedItem(first)?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const r = await fetch("/api/contatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(15000),
      });
      const body = await r.json();
      if (!r.ok) {
        setErrors(body.fields || {});
        throw new Error(
          body.error || "Não foi possível enviar. Tente novamente.",
        );
      }
      setProtocol(body.protocol);
    } catch (e) {
      setFailure(
        e instanceof Error && e.name !== "TimeoutError"
          ? e.message
          : "O envio demorou mais que o esperado. Tente novamente; seu pedido não será duplicado.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (protocol)
    return (
      <section className="success-panel" role="status">
        <CheckCircle2 size={52} />
        <div className="eyebrow">TUDO CERTO</div>
        <h2>Mensagem registrada.</h2>
        <p>Sua solicitação foi salva. Guarde o protocolo abaixo.</p>
        <code>{protocol}</code>
        <button
          className="button"
          onClick={() => {
            setProtocol("");
            requestId.current = "";
            setCount(0);
            setCepInfo("");
          }}
        >
          Enviar outra mensagem <ArrowUpRight size={20} />
        </button>
      </section>
    );
  return (
    <form className="contact-form" ref={formRef} onSubmit={submit} noValidate>
      <div className="form-heading">
        <h2>Conte sobre seu projeto</h2>
        <p>Todos os campos são obrigatórios.</p>
      </div>
      <fieldset disabled={busy}>
        <legend>01 · Sobre você</legend>
        <div className="form-grid">
          {field("name", "Nome completo", {
            max: 100,
            autoComplete: "name",
            placeholder: "Como podemos chamar você?",
          })}
          {field("email", "E-mail", {
            type: "email",
            max: 180,
            autoComplete: "email",
            placeholder: "voce@empresa.com",
          })}
          {field("company", "Empresa", {
            max: 120,
            autoComplete: "organization",
            placeholder: "Nome da sua empresa",
          })}
          <div className="field">
            <label htmlFor="service">O que você precisa?</label>
            <select
              name="service"
              id="service"
              defaultValue=""
              required
              aria-invalid={!!errors.service}
              aria-describedby={errors.service ? "service-error" : undefined}
            >
              <option value="" disabled>
                Selecione um serviço
              </option>
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {error("service")}
          </div>
        </div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>02 · Onde sua empresa está</legend>
        <div className="cep-row">
          <div className="field">
            <label htmlFor="cep">CEP</label>
            <input
              id="cep"
              name="cep"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              maxLength={9}
              required
              aria-invalid={!!errors.cep}
              aria-describedby="cep-info cep-error"
              onChange={() => {
                lookupVersion.current++;
                setLookup(false);
                setCepInfo("");
              }}
            />
            {error("cep")}
          </div>
          <button
            className="lookup-button"
            type="button"
            onClick={findCep}
            disabled={lookup}
          >
            {lookup ? (
              <LoaderCircle size={18} className="spin" />
            ) : (
              <Search size={18} />
            )}{" "}
            {lookup ? "Buscando…" : "Buscar CEP"}
          </button>
        </div>
        <p className="field-hint" id="cep-info" aria-live="polite">
          {cepInfo ||
            "Consulte o CEP para preencher o endereço ou digite manualmente."}
        </p>
        <div className="form-grid">
          {field("street", "Rua / Avenida", {
            max: 180,
            autoComplete: "address-line1",
          })}
          {field("number", "Número", { max: 20, placeholder: "Número ou S/N" })}
          {field("district", "Bairro")}
          {field("city", "Cidade", { autoComplete: "address-level2" })}
          <div className="field">
            <label htmlFor="state">Estado</label>
            <select
              id="state"
              name="state"
              defaultValue=""
              required
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? "state-error" : undefined}
            >
              <option value="" disabled>
                Selecione a UF
              </option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {error("state")}
          </div>
        </div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>03 · Seu desafio</legend>
        <div className="field">
          <label htmlFor="message">Como podemos ajudar?</label>
          <textarea
            name="message"
            id="message"
            rows={5}
            minLength={20}
            maxLength={2000}
            required
            placeholder="Conte sobre sua ideia, o problema que deseja resolver e o que espera do projeto."
            onChange={(e) => setCount(e.target.value.length)}
            aria-invalid={!!errors.message}
            aria-describedby="message-count message-error"
          />
          <div className="message-meta">
            {error("message")}
            <span id="message-count">{count}/2.000 · mínimo 20 caracteres</span>
          </div>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            name="consent"
            aria-invalid={!!errors.consent}
            aria-describedby="consent-error"
          />
          <span>
            Autorizo o armazenamento destes dados para tratar esta solicitação.
          </span>
        </label>
        {error("consent")}
      </fieldset>
      {failure && (
        <div className="form-error" role="alert">
          {failure}
        </div>
      )}
      <button className="button submit" disabled={busy} type="submit">
        {busy ? (
          <>
            <LoaderCircle className="spin" size={20} /> Salvando mensagem…
          </>
        ) : (
          <>
            Enviar mensagem <ArrowUpRight size={20} />
          </>
        )}
      </button>
      <p className="privacy-note">
        Seus dados são usados apenas nesta solicitação.
      </p>
    </form>
  );
}
