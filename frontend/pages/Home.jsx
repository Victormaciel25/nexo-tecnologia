import { ArrowUpRight, Code2, Workflow, Layers3 } from "lucide-react";
export default function Home() {
  return (
    <main id="conteudo">
      <section className="hero wrap">
        <div className="eyebrow">CONSULTORIA & DESENVOLVIMENTO DIGITAL</div>
        <h1>
          Boas ideias.
          <br />
          Tecnologia que <em>resolve.</em>
        </h1>
        <div className="hero-bottom">
          <p>
            Conectamos estratégia, design e desenvolvimento para simplificar a
            operação da sua empresa.
          </p>
          <a className="button" href="/contato">
            Vamos conversar <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="hero-index">
          <span>01 / DA IDEIA À ENTREGA</span>
          <span>CLAREZA EM CADA ETAPA</span>
        </div>
      </section>
      <section className="services-strip">
        <div className="wrap">
          <div className="section-title">
            <h2>
              O próximo passo
              <br />
              do seu negócio.
            </h2>
            <a className="text-link" href="/servicos">
              Conheça os serviços <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="cards">
            {[
              {
                icon: Code2,
                n: "01",
                title: "Aplicações web",
                description:
                  "Ferramentas pensadas para as pessoas que usam o seu negócio.",
              },
              {
                icon: Workflow,
                n: "02",
                title: "Integrações",
                description:
                  "Sistemas conectados para reduzir tarefas repetitivas.",
              },
              {
                icon: Layers3,
                n: "03",
                title: "Consultoria técnica",
                description:
                  "Um caminho claro para decisões e melhorias digitais.",
              },
            ].map(({ icon: Icon, n, title, description }) => (
              <article className="service-card" key={n}>
                <div className="card-top">
                  <Icon size={28} />
                  <span>{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap process">
        <div>
          <div className="eyebrow">COMO TRABALHAMOS</div>
          <h2>
            Menos ruído.
            <br />
            Mais direção.
          </h2>
        </div>
        <ol>
          <li>
            <strong>Entender</strong>
            <p>Começamos pelo seu contexto, pelas pessoas e pelo problema.</p>
          </li>
          <li>
            <strong>Construir</strong>
            <p>
              Transformamos prioridades em entregas pequenas e verificáveis.
            </p>
          </li>
          <li>
            <strong>Evoluir</strong>
            <p>Validamos o resultado e definimos os próximos passos juntos.</p>
          </li>
        </ol>
      </section>
    </main>
  );
}
