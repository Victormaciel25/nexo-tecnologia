import Link from "next/link";
import { ArrowUpRight, Code2, Workflow, Layers3 } from "lucide-react";
export const metadata = { title: "Serviços" };
export default function Services() {
  return (
    <main id="conteudo" className="wrap services-page">
      <div className="eyebrow">O QUE FAZEMOS</div>
      <h1>
        Tecnologia com
        <br />
        <em>um propósito.</em>
      </h1>
      <p className="lead">
        Soluções para desafios reais, do primeiro diagnóstico à aplicação em
        funcionamento.
      </p>
      <div className="service-details">
        {[
          {
            icon: Code2,
            title: "Aplicações web",
            desc: "Seu processo, em uma experiência digital simples.",
            items: [
              "Sites e portais responsivos",
              "Formulários e fluxos de atendimento",
              "Aplicações com banco de dados",
            ],
          },
          {
            icon: Workflow,
            title: "Integrações",
            desc: "Informações no lugar certo, sem retrabalho.",
            items: [
              "Conexão com APIs externas",
              "Automação de tarefas operacionais",
              "Validação e tratamento de falhas",
            ],
          },
          {
            icon: Layers3,
            title: "Consultoria técnica",
            desc: "Mais clareza para escolher o próximo passo.",
            items: [
              "Diagnóstico da aplicação atual",
              "Planejamento de arquitetura",
              "Priorização de melhorias",
            ],
          },
        ].map(({ icon: Icon, title, desc, items }, i) => (
          <article key={title}>
            <span className="detail-number">0{i + 1}</span>
            <div>
              <Icon size={30} />
              <h2>{title}</h2>
              <p>{desc}</p>
            </div>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <aside className="cta">
        <div>
          <h2>Qual desafio vamos resolver?</h2>
          <p>Conte um pouco sobre o seu projeto.</p>
        </div>
        <Link className="button" href="/contato">
          Falar com a Nexo <ArrowUpRight size={20} />
        </Link>
      </aside>
    </main>
  );
}
