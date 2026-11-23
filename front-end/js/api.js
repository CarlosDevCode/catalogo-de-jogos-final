// Funções compartilhadas entre as páginas
// Se a página foi aberta pelo Live Server (outra porta), aponta para o back-end na 3000
const BASE = location.port === '3000' ? '' : 'http://localhost:3000';
const API = `${BASE}/jogos`;

async function requisitar(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  let dados = {};
  try {
    dados = await resposta.json();
  } catch (e) {
    // resposta sem corpo JSON
  }
  if (!resposta.ok) throw new Error(dados.erro || 'Erro na requisição.');
  return dados;
}

const urlImagem = (nome) => (nome ? `${BASE}/uploads/${encodeURIComponent(nome)}` : null);

// Cria <img> da capa ou um placeholder quando o jogo não tem imagem
function criarCapa(jogo) {
  if (jogo.imagem) {
    const img = document.createElement('img');
    img.className = 'capa';
    img.src = urlImagem(jogo.imagem);
    img.alt = `Capa de ${jogo.nome}`;
    return img;
  }
  return criarPlaceholder();
}

// Placeholder (ícone de controle) para jogo sem imagem
function criarPlaceholder() {
  const div = document.createElement('div');
  div.className = 'sem-imagem';
  div.append(icone('gamepad-2'));
  return div;
}

// Avisa a aba do catálogo (se estiver aberta) que a lista mudou
function avisarMudanca() {
  try { new BroadcastChannel('catalogo').postMessage('atualizar'); } catch (e) {}
}
