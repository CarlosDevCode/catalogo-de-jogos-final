const form = document.getElementById('form');
const preview = document.getElementById('preview');
const erro = document.getElementById('erro');
const salvar = document.getElementById('salvar');
const arquivo = document.getElementById('imagem');
const id = new URLSearchParams(location.search).get('id'); // presente = modo edição

function mostrarPreview(origem) {
  if (origem) {
    const img = document.createElement('img');
    img.className = 'capa';
    img.src = origem;
    img.alt = 'Pré-visualização';
    preview.replaceChildren(img);
  } else {
    preview.replaceChildren(criarPlaceholder());
  }
}

function mostrarErro(msg) { erro.textContent = msg; erro.hidden = false; }

arquivo.addEventListener('change', () => {
  const f = arquivo.files[0];
  if (f) mostrarPreview(URL.createObjectURL(f));
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  erro.hidden = true;
  salvar.disabled = true;
  try {
    // FormData envia texto + arquivo (multipart/form-data)
    const dados = new FormData(form);
    if (!arquivo.files.length) dados.delete('imagem');
    const jogo = await requisitar(id ? `${API}/${encodeURIComponent(id)}` : API, {
      method: id ? 'PUT' : 'POST',
      body: dados,
    });
    avisarMudanca();
    location.href = `jogo.html?id=${jogo.id}`;
  } catch (err) {
    mostrarErro(err.message);
    salvar.disabled = false;
  }
});

(async () => {
  mostrarPreview(null);
  if (!id) return;
  document.getElementById('titulo').textContent = 'Editar Jogo';
  document.title = 'Editar Jogo - GameVault';
  document.getElementById('cancelar').href = `jogo.html?id=${encodeURIComponent(id)}`;
  try {
    const jogo = await requisitar(`${API}/${encodeURIComponent(id)}`);
    document.getElementById('id').value = jogo.id;
    form.nome.value = jogo.nome;
    form.genero.value = jogo.genero;
    form.plataforma.value = jogo.plataforma;
    form.ano.value = jogo.ano ?? '';
    mostrarPreview(urlImagem(jogo.imagem));
    arquivo.nextElementSibling.textContent = 'Deixe em branco para manter a imagem atual.';
  } catch (err) {
    mostrarErro(err.message);
    salvar.disabled = true;
  }
})();
