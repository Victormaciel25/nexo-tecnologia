import ContactForm from "../components/ContactForm.jsx";
export default function Contact() {
  return (
    <main id="conteudo" className="wrap contact-layout">
      <aside>
        <div className="eyebrow">VAMOS CONVERSAR</div>
        <h1>
          Seu próximo
          <br />
          passo começa
          <br />
          <em>aqui.</em>
        </h1>
        <p className="lead">
          Conte o que sua empresa precisa. Vamos entender o desafio e pensar no
          caminho juntos.
        </p>
        <div className="contact-note">
          <strong>Uma boa conversa vem primeiro.</strong>
          <p>Descreva seu projeto, mesmo que a ideia ainda esteja no começo.</p>
        </div>
      </aside>
      <ContactForm />
    </main>
  );
}
