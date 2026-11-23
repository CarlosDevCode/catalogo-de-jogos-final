# Catálogo de Jogos

Aplicação web para cadastrar e consultar jogos, desenvolvida como **Atividade de Back-end** (ADS). O sistema é composto por uma **API REST** em Node.js/Express, um banco de dados **SQLite** e um **front-end** em HTML, CSS e JavaScript puro, que consome a API.

## Objetivo

Permitir que o usuário gerencie um catálogo de jogos (CRUD completo): listar, buscar, visualizar detalhes, cadastrar, editar e excluir, incluindo o envio de uma imagem de capa que fica armazenada localmente no servidor.

## Funcionalidades

- **Catálogo:** exibe todos os jogos em cards (capa, nome, gênero, plataforma e ano de lançamento) com contador de jogos.
- **Busca:** filtra por nome, gênero, plataforma ou ano.
- **Detalhes do jogo:** ao clicar em um card, os dados abrem em uma **nova aba**, com as opções **Editar** e **Excluir** (a exclusão pede confirmação).
- **Novo jogo:** o botão "Novo Jogo" abre uma **nova aba** com o formulário (nome, gênero, plataforma, ano de lançamento e imagem). O **ID é gerado automaticamente** pelo banco.
- **Edição:** reutiliza o formulário já preenchido; se nenhuma imagem nova for enviada, a atual é mantida.
- **Upload de imagem:** aceita PNG, JPG, WEBP e GIF de até 5 MB, com pré-visualização antes de salvar. A imagem anterior é apagada do disco quando o jogo é editado com nova imagem ou excluído.
- **Atualização entre abas:** a aba do catálogo se atualiza sozinha quando outra aba cria, edita ou exclui um jogo.
- **Jogo sem imagem:** exibe um ícone de controle (Lucide) no lugar da capa.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express 5 (com `cors`) |
| Upload de arquivos | Multer |
| Banco de dados | SQLite (biblioteca `better-sqlite3`) |
| Front-end | HTML, CSS e JavaScript (sem framework) |
| Ícones | [Lucide](https://lucide.dev), embutidos no projeto |

## Arquitetura

O front-end nunca acessa o banco ou os arquivos diretamente: ele envia requisições HTTP (`fetch`) para a API, e o Express lê ou grava no SQLite e responde em JSON. As imagens são servidas como arquivos estáticos em `/uploads`.

```
Navegador (front-end)          Express (back-end)             Disco
─────────────────────          ──────────────────             ─────
fetch('/jogos')      ───►  router/jogosrouter.js    ───►  database/database.db
                         ◄───  resposta em JSON
<img src="/uploads/..."> ───►  express.static           ───►  uploads/
```

O banco guarda apenas o **nome do arquivo** da imagem; o arquivo em si fica na pasta `back-end/uploads`.

## Estrutura de pastas

```
catalogo-de-jogos/
├── package.json
├── back-end/
│   ├── app.js                  # servidor Express, CORS, arquivos estáticos e tratamento de erros
│   ├── database/
│   │   ├── db.js               # conexão com o SQLite, criação da tabela e migração
│   │   └── database.db         # banco (criado automaticamente na primeira execução)
│   ├── router/
│   │   └── jogosrouter.js      # rotas da API, validação e upload
│   └── uploads/                # imagens enviadas (armazenamento local)
└── front-end/
    ├── index.html              # catálogo
    ├── jogo.html               # detalhes (editar / excluir)
    ├── form.html               # cadastro e edição
    ├── style.css
    ├── assets/                 # ícone e imagens do projeto
    └── js/
        ├── api.js              # chamadas à API e funções compartilhadas
        ├── icons.js            # ícones Lucide
        ├── index.js            # lógica do catálogo e da busca
        ├── jogo.js             # lógica da página de detalhes
        └── form.js             # lógica do formulário
```

## Banco de dados

Tabela `jogos`:

| Campo | Tipo | Observação |
|---|---|---|
| `id` | INTEGER | chave primária, autoincremento |
| `nome` | TEXT | obrigatório |
| `genero` | TEXT | obrigatório |
| `plataforma` | TEXT | obrigatório |
| `ano` | INTEGER | ano de lançamento, obrigatório (1950 até o ano atual + 5) |
| `imagem` | TEXT | nome do arquivo salvo em `uploads/` (opcional) |

Na primeira execução a tabela é criada e recebe um registro inicial (Call of Duty: Black Ops II, 2012). Bancos criados antes do campo `ano` são atualizados automaticamente ao iniciar o servidor.

## Endpoints da API

Base: `http://localhost:3000/jogos`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/jogos` | Lista os jogos. Aceita `?busca=texto` |
| `GET` | `/jogos/:id` | Retorna um jogo |
| `POST` | `/jogos` | Cadastra um jogo (`multipart/form-data`) |
| `PUT` | `/jogos/:id` | Atualiza um jogo (`multipart/form-data`; a imagem é opcional) |
| `DELETE` | `/jogos/:id` | Exclui o jogo e a imagem associada |

**Campos do POST e do PUT (form-data):** `nome`, `genero`, `plataforma`, `ano` e `imagem` (arquivo).

**Exemplo de resposta (`GET /jogos/1`):**

```json
{
  "id": 1,
  "nome": "Call of Duty: Black Ops II",
  "genero": "FPS",
  "plataforma": "PC, PS3, Xbox 360",
  "ano": 2012,
  "imagem": "seed-codbo2.jpg"
}
```

**Códigos de resposta:** `200` sucesso, `201` criado, `400` dados inválidos (campo vazio, ano inválido, arquivo que não é imagem ou maior que 5 MB), `404` jogo não encontrado. Os erros retornam `{ "erro": "mensagem" }`.

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) (versão LTS).

```bash
npm install
npm start
```

Depois, acesse `http://localhost:3000`. Para desenvolvimento com reinício automático, use `npm run dev`.

Se o front-end for aberto por outro servidor (por exemplo, o Live Server do VS Code na porta 5501), ele se conecta automaticamente ao back-end em `http://localhost:3000`, que precisa estar rodando.

## Testando no Postman

1. Crie uma requisição `POST` para `http://localhost:3000/jogos`.
2. Em **Body**, escolha **form-data** e adicione `nome`, `genero`, `plataforma` e `ano` (tipo Text), e `imagem` (tipo File).
3. Envie e confira o retorno `201` com o jogo criado.
4. Teste também `GET`, `PUT` e `DELETE` nas rotas da tabela acima.

## Validações e cuidados

- Campos de texto são obrigatórios e têm o espaço extra removido antes de salvar.
- O ano deve ser um número inteiro dentro do intervalo permitido.
- O upload só aceita PNG, JPG, WEBP ou GIF, com limite de 5 MB e nome de arquivo gerado pelo servidor.
- Se a validação falhar, a imagem enviada na mesma requisição é descartada.
- No front-end, os dados são inseridos na página como texto (nunca como HTML), evitando injeção de código.

## Equipe

Alison, Arthur, Eraldo, Samara e Thiago.
