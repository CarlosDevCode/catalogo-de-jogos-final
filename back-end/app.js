// Servidor principal - Catálogo de Jogos
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('./database/db'); // abre a conexão e cria a tabela
const jogosRouter = require('./router/jogosrouter');

const app = express();
const PORTA = 3000;

// Permite que o front-end aberto em outra porta (ex.: Live Server) acesse a API
app.use(cors());

// Interpreta corpos JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log: mostra o método e a URL de cada requisição
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Imagens enviadas (armazenadas localmente) e front-end estático
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'front-end')));

// Rotas dos jogos
app.use('/jogos', jogosRouter);

// Rota inexistente -> 404 em JSON
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Tratamento de erros (inclui erros do multer)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Imagem muito grande (máx. 5 MB).' : err.message;
    return res.status(400).json({ erro: msg });
  }
  console.error(err);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno do servidor.' });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
