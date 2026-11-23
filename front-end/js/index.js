const lista = document.getElementById('lista');
const quantidade = document.getElementById('quantidade');
const campoBusca = document.getElementById('pesquisa');

function criarCard(jogo) {
  // Clicar no card abre os detalhes em uma NOVA ABA
  const a = document.createElement('a');
  a.className = 'game-card';
  a.href = `jogo.html?id=${jogo.id}`;
  a.target = '_blank';
  a.rel = 'noopener';

  const info = document.createElement('div');
  info.className = 'info';
  const titulo = document.createElement('h3');
  titulo.textContent = jogo.nome;
  const genero = document.createElement('span');
  genero.className = 'tag';
  genero.textContent = jogo.genero;
  const plat = document.createElement('span');
  plat.className = 'tag';
  plat.textContent = jogo.plataforma;
  info.append(titulo, genero, plat);
  if (jogo.ano) {
    const ano = document.createElement('span');
    ano.className = 'tag';
    ano.textContent = jogo.ano;
    info.append(ano);
  }

  a.append(criarCapa(jogo), info);
  return a;
}

async function carregar() {
  try {
    const busca = campoBusca.value.trim();
    const jogos = await requisitar(`${API}?busca=${encodeURIComponent(busca)}`);
    lista.replaceChildren(...jogos.map(criarCard));
    quantidade.textContent = `${jogos.length} ${jogos.length === 1 ? 'jogo' : 'jogos'}`;
    if (!jogos.length) {
      const p = document.createElement('p');
      p.className = 'vazio';
      p.textContent = busca ? 'Nenhum jogo encontrado.' : 'Nenhum jogo cadastrado ainda.';
      lista.append(p);
    }
  } catch (e) {
    lista.textContent = 'Não foi possível carregar os jogos. O servidor está rodando?';
    lista.className = 'games-grid vazio';
  }
}

let timer;
campoBusca.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(carregar, 250); });

// Atualiza a lista quando outra aba cria/edita/exclui um jogo
try { new BroadcastChannel('catalogo').onmessage = carregar; } catch (e) {}
window.addEventListener('focus', carregar);

carregar();
