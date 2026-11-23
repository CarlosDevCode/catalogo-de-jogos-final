// Conexão com o banco de dados SQLite (arquivo local: back-end/database/database.db)
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'database.db'));

db.pragma('journal_mode = WAL');

// Cria a tabela caso ainda não exista. O id é AUTOINCREMENT (automático).
db.exec(`
  CREATE TABLE IF NOT EXISTS jogos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    genero     TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    ano        INTEGER NOT NULL,
    imagem     TEXT
  )
`);

// Migração: bancos antigos (sem a coluna "ano") ganham a coluna automaticamente.
// (O SQLite não permite adicionar NOT NULL sem valor padrão; a API sempre exige o ano.)
const colunas = db.prepare('PRAGMA table_info(jogos)').all().map((c) => c.name);
if (!colunas.includes('ano')) {
  db.exec('ALTER TABLE jogos ADD COLUMN ano INTEGER');
  db.prepare("UPDATE jogos SET ano = 2012 WHERE nome = 'Call of Duty: Black Ops II' AND ano IS NULL").run();
}

// Registro inicial (apenas se a tabela estiver vazia)
const { total } = db.prepare('SELECT COUNT(*) AS total FROM jogos').get();
if (total === 0) {
  db.prepare(
    'INSERT INTO jogos (nome, genero, plataforma, ano, imagem) VALUES (?, ?, ?, ?, ?)'
  ).run('Call of Duty: Black Ops II', 'FPS', 'PC, PS3, Xbox 360', 2012, 'seed-codbo2.jpg');
}

module.exports = db;
