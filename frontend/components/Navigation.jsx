export default function Navigation() {
  const path = window.location.pathname;
  return (
    <nav aria-label="Navegação principal">
      {[
        ["/", "Início"],
        ["/servicos", "Serviços"],
        ["/contato", "Contato"],
      ].map(([href, label]) => (
        <a
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
