# Nexo Tecnologia

Aplicação desenvolvida para o teste técnico: site da Nexo Tecnologia com três páginas, formulário persistente e integração funcional com API gratuita.

## Requisitos atendidos

- Início (`/`), Serviços (`/servicos`) e Contato (`/contato`).
- Formulário salvo em banco SQLite: Cloudflare D1 em produção e Miniflare localmente.
- ViaCEP integrado ao formulário, por rota de servidor, com preenchimento de rua, bairro, cidade e UF.
- Validação compartilhada cliente/servidor, mensagens por campo, estados de carregamento, falha e sucesso.
- Layout responsivo, navegação por teclado, rótulos, foco visível e regiões de status.
- Protocolo UUID e chave primária impedem duplicação ao repetir a mesma tentativa de envio.

## Tecnologias e decisões

React 19, TypeScript e Vinext (rotas compatíveis com Next.js), Vite, Cloudflare Workers, D1/SQLite, Drizzle para schema/migrações e Zod.
O servidor usa SQL parametrizado e não expõe uma listagem pública dos contatos. A integração externa fica no servidor, limitando a URL ao ViaCEP e aplicando timeout de 7 segundos. A indisponibilidade do ViaCEP não impede preenchimento manual.
As solicitações são persistidas no banco de dados. O envio de e-mail não está implementado.

## Executar localmente

Pré-requisito: Node.js 22.13 ou superior e npm. Não é necessário criar uma conta de nuvem para executar localmente.

```sh
npm ci
npm run build
npm run db:local
npm run dev
```

Abra http://localhost:5173. O primeiro build gera a configuração local do banco. O comando db:local aplica as migrações pendentes e registra as já aplicadas. Os dados locais ficam em `.wrangler/state`, fora do Git.

Para testar o resultado de produção localmente:

```sh
npm run build
npm start
```

Use o endereço exibido pelo servidor. Desenvolvimento e prévia de produção compartilham o mesmo banco local.
Após alterar o schema: `npm run db:generate`, revise o SQL, rode build e db:local novamente.

## API externa

[ViaCEP](https://viacep.com.br/) é uma API gratuita, sem chave, para consultar endereços por CEP.
O navegador chama `GET /api/cep/01001000`; o servidor consulta `https://viacep.com.br/ws/01001000/json/`.
Formato inválido retorna 400; CEP não encontrado retorna 404; falha ou timeout externo retorna 502. Em todos os casos, o formulário continua editável. Uma consulta antiga não sobrescreve o resultado de um CEP alterado.

## Endpoints

- `GET /api/cep/:cep`: consulta de endereço.
- `POST /api/contatos`: recebe JSON, valida e persiste o contato. Retorna 201 e protocolo.
- Erros: 400 para JSON inválido, 403 para origem incompatível, 413 para corpo acima do limite, 415 para tipo incorreto, 422 para validação, 503 para banco indisponível.
- Métodos não implementados não dão acesso aos registros.

## Validação

```sh
npm run typecheck
npm run test:integration
```

O teste de integração requer o servidor em execução na porta 5173 (ou variável TEST_BASE_URL) e usa dados de teste. Ele verifica páginas, validação, proteção de origem, consulta de CEP e persistência/idempotência. O teste remove exclusivamente o registro que ele criou.

## Estrutura

- `app/`: páginas, navegação e rotas HTTP.
- `app/contato/form.tsx`: formulário e feedback.
- `lib/contact.ts`: validação compartilhada.
- `db/` e `drizzle/`: schema, acesso ao banco e migrações.
- `scripts/migrate-local.mjs`: aplicação local rastreada das migrações.
- `tests/integration.mjs`: testes do fluxo real.

## Privacidade e limites

O formulário coleta apenas os campos necessários ao exemplo, exige autorização de armazenamento e não lista dados publicamente. O consentimento e a data de criação são armazenados.
A proteção inclui validação no servidor, SQL parametrizado, checagem de origem, limite de corpo e campo antispam. Antes de abrir ao público em escala, configure rate limiting/CAPTCHA e uma política de retenção e exclusão. O exemplo não implementa painel administrativo nem notificações por e-mail.
O endereço pode ser editado manualmente e não representa comprovação de localização.
O protocolo identifica um envio, mas não permite consultar dados pessoais.

## Entrega

O repositório deve ser disponibilizado no GitHub com acesso para o avaliador. O pacote de código pode ser importado para um novo repositório. Não envie `node_modules`, `.wrangler`, arquivos `.env` ou credenciais.
A hospedagem Sites é opcional para avaliação; a execução local é independente dela. O identificador em `.openai/hosting.json` pertence à instância hospedada e não é necessário para o avaliador executar localmente.

