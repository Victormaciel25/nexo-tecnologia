import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";
import Navigation from "./components/Navigation.jsx";
const pages = {
  "/": [Home, "Nexo Tecnologia | Ideias que funcionam"],
  "/servicos": [Services, "Serviços | Nexo Tecnologia"],
  "/contato": [Contact, "Contato | Nexo Tecnologia"],
};
export default function App() {
  const page = pages[window.location.pathname];
  const Page = page?.[0];
  document.title = page?.[1] || "Página não encontrada | Nexo Tecnologia";
  return (
    <>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="header wrap">
        <a href="/" className="brand" aria-label="Nexo Tecnologia, início">
          <span className="brand-mark">n</span>nexo
          <span className="brand-sub">TECNOLOGIA</span>
        </a>
        <Navigation />
      </header>
      {Page ? (
        <Page />
      ) : (
        <main id="conteudo" className="wrap services-page">
          <h1>Página não encontrada.</h1>
          <a href="/" className="button">
            Voltar ao início
          </a>
        </main>
      )}
      <footer className="wrap footer">
        <a className="brand" href="/">
          nexo<span className="brand-sub">TECNOLOGIA</span>
        </a>
        <span>© {new Date().getFullYear()} Nexo</span>
      </footer>
    </>
  );
}
