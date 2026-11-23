const conteudo = document.getElementById('conteudo');
const modal = document.getElementById('modalExcluir');
const id = new URLSearchParams(location.search).get('id');

function linha(dl, rotulo, valor) {
  const dt = document.createElement('dt'); dt.textContent = rotulo;
  const dd = document.createElement('dd'); dd.textContent = valor;
  dl.append(dt, dd);
}

function mostrar(jogo) {
  document.title = `${jogo.nome} - GameVault`;

  const painel = document.createElement('section');
  painel.className = 'painel';

  const detalhes = document.createElement('div');
  detalhes.className = 'detalhes';
  const h2 = document.createElement('h2');
  h2.textContent = jogo.nome;
  const dl = document.createElement('dl');
  linha(dl, 'ID', jogo.id);
  linha(dl, 'Gênero', jogo.genero);
  linha(dl, 'Plataforma', jogo.plataforma);
  linha(dl, 'Lançamento', jogo.ano ?? '—');

  const acoes = document.createElement('div');
  acoes.className = 'acoes';
  const editar = document.createElement('a');
  editar.className = 'btn btn-primary';
  editar.href = `form.html?id=${jogo.id}`;
  editar.append(icone('pencil'), 'Editar');
  const excluir = document.createElement('button');
  excluir.className = 'btn btn-danger';
  excluir.append(icone('trash-2'), 'Excluir');
  excluir.onclick = () => modal.showModal();
  acoes.append(editar, excluir);

  detalhes.append(h2, dl, acoes);
  painel.append(criarCapa(jogo), detalhes);
  conteudo.replaceChildren(painel);
}

function mostrarErro(msg) {
  const p = document.createElement('p');
  p.className = 'vazio';
  p.textContent = msg + ' ';
  const voltar = document.createElement('a');
  voltar.href = 'index.html';
  voltar.className = 'btn';
  voltar.append(icone('arrow-left'), 'Voltar ao catálogo');
  conteudo.replaceChildren(p, voltar);
}

document.getElementById('cancelar').onclick = () => modal.close();
document.getElementById('confirmar').onclick = async () => {
  try {
    await requisitar(`${API}/${id}`, { method: 'DELETE' });
    avisarMudanca();
    modal.close();
    mostrarErro('Jogo excluído com sucesso.');
  } catch (e) {
    modal.close();
    mostrarErro(e.message);
  }
};

(async () => {
  try { mostrar(await requisitar(`${API}/${encodeURIComponent(id)}`)); }
  catch (e) { mostrarErro(e.message); }
})();
