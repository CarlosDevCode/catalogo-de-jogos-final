// Rotas da API de jogos  ->  /jogos
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../database/db');

const router = express.Router();

// ---------- Upload de imagem (armazenada localmente em back-end/uploads) ----------
const PASTA_UPLOADS = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PASTA_UPLOADS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    const erro = new Error('Envie uma imagem PNG, JPG, WEBP ou GIF.');
    erro.status = 400;
    cb(erro);
  },
});

// ---------- Funções auxiliares ----------
function apagarImagem(nome) {
  if (!nome) return;
  // path.basename evita que um valor malicioso saia da pasta de uploads
  const caminho = path.join(PASTA_UPLOADS, path.basename(nome));
  fs.unlink(caminho, () => {});
}

function validar(body) {
  const nome = (body.nome || '').trim();
  const genero = (body.genero || '').trim();
  const plataforma = (body.plataforma || '').trim();
  if (!nome || !genero || !plataforma) {
    return { erro: 'Os campos nome, gênero e plataforma são obrigatórios.' };
  }
  const ano = Number(body.ano);
  const anoMax = new Date().getFullYear() + 5;
  if (!Number.isInteger(ano) || ano < 1950 || ano > anoMax) {
    return { erro: `Informe um ano de lançamento válido (1950 a ${anoMax}).` };
  }
  return { nome, genero, plataforma, ano };
}

const buscarPorId = (id) => db.prepare('SELECT * FROM jogos WHERE id = ?').get(id);

// ---------- Rotas ----------

// GET /jogos  -> lista todos (ou filtra com ?busca=texto)
router.get('/', (req, res) => {
  const busca = (req.query.busca || '').trim();
  if (busca) {
    const jogos = db
      .prepare(
        `SELECT * FROM jogos
         WHERE nome LIKE ? OR genero LIKE ? OR plataforma LIKE ? OR CAST(ano AS TEXT) LIKE ?
         ORDER BY nome COLLATE NOCASE`
      )
      .all(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
    return res.json(jogos);
  }
  const jogos = db.prepare('SELECT * FROM jogos ORDER BY nome COLLATE NOCASE').all();
  res.json(jogos);
});

// GET /jogos/:id  -> um jogo
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const jogo = buscarPorId(id);
  if (!jogo) return res.status(404).json({ erro: 'Jogo não encontrado.' });
  res.json(jogo);
});

// POST /jogos  (multipart/form-data: nome, genero, plataforma, ano, imagem)
router.post('/', upload.single('imagem'), (req, res) => {
  const dados = validar(req.body);
  if (dados.erro) {
    if (req.file) apagarImagem(req.file.filename);
    return res.status(400).json({ erro: dados.erro });
  }
  const resultado = db
    .prepare('INSERT INTO jogos (nome, genero, plataforma, ano, imagem) VALUES (?, ?, ?, ?, ?)')
    .run(dados.nome, dados.genero, dados.plataforma, dados.ano, req.file ? req.file.filename : null);
  res.status(201).json(buscarPorId(resultado.lastInsertRowid));
});

// PUT /jogos/:id  (imagem opcional: se enviada, substitui a anterior)
router.put('/:id', upload.single('imagem'), (req, res) => {
  const id = Number(req.params.id);
  const dados = validar(req.body);
  if (dados.erro) {
    if (req.file) apagarImagem(req.file.filename);
    return res.status(400).json({ erro: dados.erro });
  }
  const anterior = buscarPorId(id); // guarda a imagem antiga para apagá-la depois
  const resultado = db
    .prepare(
      'UPDATE jogos SET nome = ?, genero = ?, plataforma = ?, ano = ?, imagem = COALESCE(?, imagem) WHERE id = ?'
    )
    .run(dados.nome, dados.genero, dados.plataforma, dados.ano, req.file ? req.file.filename : null, id);

  if (resultado.changes === 0) {
    if (req.file) apagarImagem(req.file.filename);
    return res.status(404).json({ erro: 'Jogo não encontrado.' });
  }
  if (req.file) apagarImagem(anterior.imagem);
  res.json(buscarPorId(id));
});

// DELETE /jogos/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const anterior = buscarPorId(id); // guarda a imagem para apagá-la depois
  const resultado = db.prepare('DELETE FROM jogos WHERE id = ?').run(id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Jogo não encontrado.' });
  }
  apagarImagem(anterior.imagem);
  res.json({ mensagem: 'Jogo excluído com sucesso.' });
});

module.exports = router;
