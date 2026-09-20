# Nexo Tecnologia

Site com três páginas, formulário de contato persistente e preenchimento de endereço pelo ViaCEP.

## Tecnologias

- **Front-end:** JavaScript com React (JSX), Vite, CSS/Tailwind e Lucide.
- **Back-end:** Python com Flask.
- **Banco:** SQLite, acessado pelo módulo `sqlite3` do Python.
- **Validação:** Zod no navegador e Python no servidor; limites, opções e mensagens comuns em `shared/contact-rules.json`.
- **API externa:** [ViaCEP](https://viacep.com.br/), gratuita e sem chave.
- **Execução do build:** Waitress, servidor WSGI compatível com Windows, macOS e Linux.

## Executar localmente

Pré-requisitos: **Node.js 22.13 ou superior**, npm e **Python 3.10 ou superior**.
Execute os comandos na raiz do projeto, onde estão `package.json` e `requirements.txt`.

### Windows (PowerShell ou Prompt de Comando)

```sh
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
npm ci
npm run build
.venv\Scripts\python.exe -m backend.serve
```

### macOS / Linux

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm ci
npm run build
.venv/bin/python -m backend.serve
```

Abra **http://127.0.0.1:5000**. O mesmo servidor serve as páginas e a API.
O banco é criado automaticamente em `data/nexo.sqlite3`; não há comando separado de migração para a instalação inicial.
Não é necessária conta na nuvem. Internet é necessária para instalar dependências e consultar o ViaCEP.

Nas próximas execuções, basta rodar o comando `python -m backend.serve` com o Python do ambiente virtual.
Após editar o front-end, execute `npm run build` novamente.
Para parar o servidor, use **Ctrl+C**.

## Desenvolvimento com atualização automática

Abra dois terminais na raiz do projeto.

**Terminal 1 — API Python (Windows):**

```sh
.venv\Scripts\python.exe -m flask --app backend.app:create_app run --host 127.0.0.1 --port 5000 --reload
```

No macOS/Linux, substitua `.venv\Scripts\python.exe` por `.venv/bin/python`.

**Terminal 2 — Interface JavaScript:**

```sh
npm run dev
```

Abra **http://127.0.0.1:5173**. O Vite encaminha `/api` ao Flask na porta 5000.
O comando `npm run preview` serve apenas a interface compilada; prefira `python -m backend.serve` para executar a aplicação completa.

## Funcionalidades

- Início (`/`), Serviços (`/servicos`) e Contato (`/contato`).
- Formulário com validação, estados de carregamento, erros por campo e confirmação com protocolo.
- Consulta de CEP com preenchimento de rua, bairro, cidade e UF; endereço pode ser digitado manualmente.
- Persistência SQLite em disco, inclusive após reiniciar o servidor.
- Um mesmo protocolo com os mesmos dados não duplica a solicitação; dados diferentes retornam conflito.
- Interface responsiva, rótulos acessíveis, foco visível e navegação por teclado.

## API

### `GET /api/cep/:cep`

Consulta `https://viacep.com.br/ws/{cep}/json/` no servidor. Usa limites de conexão/leitura para evitar espera indefinida.

- 200: endereço encontrado.
- 400: formato de CEP inválido.
- 404: CEP não encontrado.
- 502: erro, resposta inválida ou indisponibilidade do ViaCEP.

### `POST /api/contatos`

Recebe JSON com `id` (UUID), `name`, `email`, `company`, `service`, `cep`, `street`, `number`, `district`, `city`, `state`, `message`, `consent: true` e `website: ""` (campo antispam).

- 201: contato salvo; resposta `{"protocol": "..."}`.
- 400: JSON malformado.
- 403: origem incompatível com o servidor.
- 409: protocolo já usado com dados diferentes.
- 413: corpo maior que 16.000 bytes.
- 415: conteúdo diferente de JSON.
- 422: campos inválidos, com detalhes em `fields`.
- 503: falha de persistência.

Os registros não são expostos por uma rota pública. SQL parametrizado protege as consultas. O consentimento e a data de criação são armazenados.

## Testes

```sh
npm test
.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py" -v
```

No macOS/Linux, use `.venv/bin/python`. Os testes Python usam um banco temporário e simulam o serviço externo para verificar também falhas, sem depender da rede.
São verificados: validação, proteção de origem, limites de requisição, persistência após reinício, idempotência, conflito de protocolo, SQL parametrizado, falha no banco e consulta de CEP.
`npm run build` verifica e compila a interface.

## Estrutura

```text
frontend/
  pages/          Páginas React em JavaScript/JSX
  components/     Navegação e formulário
  validation.js   Validação do navegador
  styles.css      Estilos
backend/
  app.py          Rotas Flask e integração ViaCEP
  database.py     Inicialização e persistência SQLite
  validation.py   Validação do servidor
  serve.py        Inicialização do servidor Waitress
  import_legacy.py Importação opcional de dados anteriores
shared/
  contact-rules.json Regras comuns entre JavaScript e Python
tests/            Testes JavaScript e Python
data/             Banco local (não versionado)
dist/             Build da interface (não versionado)
```

## Dados e configuração

A variável `NEXO_DATABASE` permite escolher outro caminho para o SQLite.
`PORT` muda a porta do servidor Waitress; `NEXO_HOST` muda o endereço de escuta, que por padrão é apenas local (`127.0.0.1`).
O proxy de desenvolvimento está configurado para a API na porta 5000.

Para migrar dados de uma instalação SQLite anterior, faça uma cópia de segurança e execute:

```sh
.venv\Scripts\python.exe -m backend.import_legacy "caminho/para/banco-anterior.sqlite"
```

O importador abre a origem somente para leitura, mantém os protocolos e evita duplicatas. Conflitos interrompem a importação sem gravar parcialmente.

## Privacidade e limites

Os dados são usados para a solicitação de contato. Não há envio de e-mail nem painel administrativo.
Para exposição pública em escala, configure HTTPS, limitação de requisições/CAPTCHA e uma política de retenção e exclusão.
Não versione `data/`, `.venv/`, `.env` ou credenciais.
