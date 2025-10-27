// app.js

// ===== CONFIGURAÇÃO INICIAL (OMDB - Mantido para contexto da aula) =====
// Pegue sua chave gratuita em: http://www.omdbapi.com/apikey.aspx
const CHAVE_API_OMDB = "eec34f73";
const URL_BASE_OMDB = "https://www.omdbapi.com/";

// ===== CONFIGURAÇÃO TMDb (NOVA API) =====
// NOTA IMPORTANTE: Você deve obter sua própria chave TMDb em https://developer.themoviedb.org/
const CHAVE_API_TMDB = "COLOQUE_SUA_CHAVE_TMDB_AQUI"; // Chave de API TMDb V3
const URL_BASE_TMDB = "https://api.themoviedb.org/3/";
const URL_BASE_IMAGEM_TMDB = "https://image.tmdb.org/t/p/w500"; // URL base para posters e fotos de atores

// ===== CONEXÃO COM O HTML (ADICIONAIS para TMDb) =====
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("lista-resultados");
const mensagemStatus = document.getElementById("mensagem-status");
const seletorGenero = document.getElementById("seletor-genero"); // Novo elemento
const seletorAno = document.getElementById("seletor-ano");     // Novo elemento

// ===== VARIÁVEIS DE CONTROLE (MANTIDO) =====
let termoBusca = "";      // Texto digitado pelo usuário
let paginaAtual = 1;      // Página de resultados (a API retorna 10 ou 20 por página)

// ===== FUNÇÃO DO BOTÃO "BUSCAR" =====
function buscarFilmes() {
  termoBusca = campoBusca.value.trim(); // remove espaços extras
  paginaAtual = 1;                      // sempre começa da página 1
  pesquisarFilmes();                    // chama a função que faz a requisição
}

// ===== FUNÇÃO DO BOTÃO "PRÓXIMA PÁGINA" =====
function proximaPagina() {
  paginaAtual++;
  pesquisarFilmes();
}

// ===== FUNÇÃO DO BOTÃO "ANTERIOR" =====
function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    pesquisarFilmes();
  }
}

// ===== FUNÇÃO PRINCIPAL DE PESQUISA =====
async function pesquisarFilmes() {
  // Valida se o campo está vazio
  if (!termoBusca) {
    mensagemStatus.textContent = "Digite o nome de um filme para pesquisar.";
    listaResultados.innerHTML = "";
    return;
  }

  // Mostra mensagem de carregando
  mensagemStatus.textContent = "🔄 Buscando filmes, aguarde...";
  listaResultados.innerHTML = "";

  try {
    // Monta a URL com a chave e o termo buscado
    const url = `${URL_BASE}?apikey=${CHAVE_API}&s=${encodeURIComponent(termoBusca)}&page=${paginaAtual}`;
    
    // Faz a chamada na API
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Verifica se encontrou algo
    if (dados.Response === "False") {
      mensagemStatus.textContent = "Nenhum resultado encontrado.";
      listaResultados.innerHTML = "";
      return;
    }

    // Mostra os filmes na tela
    exibirFilmes(dados.Search);
    mensagemStatus.textContent = `Página ${paginaAtual} — mostrando resultados para "${termoBusca}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados. Verifique sua conexão.";
  }
}

// ===== FUNÇÃO PARA MOSTRAR FILMES =====
function exibirFilmes(filmes) {
  listaResultados.innerHTML = ""; // limpa os resultados anteriores

  filmes.forEach(filme => {
    // Cria o container do card
    const div = document.createElement("div");
    div.classList.add("card");

    // Se não houver pôster, usa uma imagem padrão
    const poster = filme.Poster !== "N/A"
      ? filme.Poster
      : "https://via.placeholder.com/300x450?text=Sem+Poster";

    // Monta o HTML do card
    div.innerHTML = `
      <img src="${poster}" alt="Pôster do filme ${filme.Title}">
      <h3>${filme.Title}</h3>
      <p>Ano: ${filme.Year}</p>
    `;

    // Adiciona o card dentro da lista
    listaResultados.appendChild(div);
  });
}

// app.js (Novas Funções)

// =========================================================================
// NOVO: 1. CARREGAR GÊNEROS NA INICIALIZAÇÃO (Requisito: Filmes por filtro)
// =========================================================================

async function carregarGeneros() {
  try {
    const url = `${URL_BASE_TMDB}genre/movie/list?api_key=${CHAVE_API_TMDB}&language=pt-BR`;
    const resposta = await fetch(url);
    const dados = await resposta.json();
    
    // Preenche o seletor de Gênero no HTML
    dados.genres.forEach(genero => {
      if (seletorGenero) {
        const option = document.createElement("option");
        option.value = genero.id;
        option.textContent = genero.name;
        seletorGenero.appendChild(option);
      }
    });

  } catch (erro) {
    console.error("❌ Erro ao carregar gêneros do TMDb.", erro);
  }
}

// =========================================================================
// NOVO: 2. FUNÇÃO DE BUSCA POR FILTROS (DISCOVER) (Requisito: Filmes por filtro)
// =========================================================================

async function buscarFilmesPorFiltro() {
  const generoId = seletorGenero.value;
  const ano = seletorAno.value;
  paginaAtual = 1;

  if (!generoId && !ano) {
    mensagemStatus.textContent = "Selecione um Gênero ou Ano para filtrar a busca TMDb.";
    listaResultados.innerHTML = "";
    return;
  }

  mensagemStatus.textContent = "🔄 Buscando filmes por filtro, aguarde...";
  listaResultados.innerHTML = "";

  try {
    // Usa o endpoint /discover/movie para aplicar filtros
    let url = `${URL_BASE_TMDB}discover/movie?api_key=${CHAVE_API_TMDB}&language=pt-BR&sort_by=popularity.desc&page=${paginaAtual}`;

    if (generoId) {
      url += `&with_genres=${generoId}`;
    }
    if (ano) {
      url += `&primary_release_year=${ano}`;
    }

    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.total_results === 0) {
      mensagemStatus.textContent = "Nenhum resultado encontrado com os filtros selecionados.";
      return;
    }

    exibirFilmesTMDb(dados.results);
    mensagemStatus.textContent = `Página ${paginaAtual} — ${dados.total_results} resultados encontrados.`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados por filtro. Verifique sua chave TMDb.";
  }
}


// =========================================================================
// NOVO: 3. FUNÇÃO PARA MOSTRAR FILMES TMDb (Com botão de detalhes)
// =========================================================================

function exibirFilmesTMDb(filmes) {
  listaResultados.innerHTML = "";

  filmes.forEach(filme => {
    const div = document.createElement("div");
    div.classList.add("card");
    
    // Poster: A TMDb exige a URL base de imagens + o caminho do poster
    const poster = filme.poster_path
      ? `${URL_BASE_IMAGEM_TMDB}${filme.poster_path}`
      : "https://via.placeholder.com/300x450?text=Sem+Poster";

    const ano = filme.release_date ? filme.release_date.substring(0, 4) : 'N/A';

    div.innerHTML = `
      <img src="${poster}" alt="Pôster do filme ${filme.title}">
      <h3>${filme.title}</h3>
      <p>Ano: ${ano}</p>
      <button class="botao-detalhes" onclick="buscarDetalhesFilme(${filme.id}, '${filme.title.replace(/'/g, "\\'")}')">Detalhes</button>
    `;

    listaResultados.appendChild(div);
  });
}

// =========================================================================
// NOVO: 4. FUNÇÃO PARA BUSCAR DETALHES DO FILME (Requisitos: Detalhes e Atores)
// =========================================================================

async function buscarDetalhesFilme(filmeId, titulo) {
  mensagemStatus.textContent = `🔄 Buscando detalhes de "${titulo}", aguarde...`;
  listaResultados.innerHTML = "";

  try {
    // 1. Busca os detalhes primários
    const urlDetalhes = `${URL_BASE_TMDB}movie/${filmeId}?api_key=${CHAVE_API_TMDB}&language=pt-BR`;
    const respostaDetalhes = await fetch(urlDetalhes);
    const dadosDetalhes = await respostaDetalhes.json();
    
    // 2. Busca o elenco/créditos (atores)
    // A API de detalhes pode ser combinada com /credits
    const urlCreditos = `${URL_BASE_TMDB}movie/${filmeId}/credits?api_key=${CHAVE_API_TMDB}&language=pt-BR`;
    const respostaCreditos = await fetch(urlCreditos);
    const dadosCreditos = await respostaCreditos.json();

    // 3. Monta e exibe a tela de detalhes
    exibirDetalhesFilme(dadosDetalhes, dadosCreditos);
    mensagemStatus.textContent = `Detalhes de "${titulo}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar detalhes do filme. Verifique sua conexão/chave TMDb.";
  }
}

// =========================================================================
// NOVO: 5. FUNÇÃO PARA EXIBIR DETALHES DO FILME
// =========================================================================

function exibirDetalhesFilme(detalhes, creditos) {
  listaResultados.innerHTML = "";

  const divDetalhes = document.createElement("div");
  divDetalhes.classList.add("detalhes-container");
  
  // Lista dos 5 principais atores (Elenco)
  const atores = creditos.cast
    .slice(0, 5)
    .map(ator => `<li>${ator.name} (${ator.character})</li>`)
    .join('');
    
  // Lista de Gêneros
  const generosLista = detalhes.genres
    .map(genero => genero.name)
    .join(', ');

  const poster = detalhes.poster_path
    ? `${URL_BASE_IMAGEM_TMDB}${detalhes.poster_path}`
    : "https://via.placeholder.com/300x450?text=Sem+Poster";
  
  const ano = detalhes.release_date ? detalhes.release_date.substring(0, 4) : 'N/A';

  divDetalhes.innerHTML = `
    <button class="paginacao voltar-button" onclick="window.location.reload()">← Voltar à Busca</button>
    <div class="detalhes-header">
      <img src="${poster}" alt="Pôster do filme ${detalhes.title}" class="detalhes-poster">
      <div class="detalhes-info">
        <h2>${detalhes.title} (${ano})</h2>
        <p><strong>Sinopse:</strong> ${detalhes.overview || 'Sinopse não disponível.'}</p>
        <p><strong>Gêneros:</strong> ${generosLista}</p>
        <p><strong>Duração:</strong> ${detalhes.runtime || 'N/A'} minutos</p>
        <p><strong>Avaliação (TMDB):</strong> ${detalhes.vote_average ? detalhes.vote_average.toFixed(1) : 'N/A'}/10</p>
      </div>
    </div>
    
    <div class="atores-lista">
      <h3>Elenco Principal (Top 5 Atores)</h3>
      <ul>
        ${atores.length > 0 ? atores : '<li>Informação de elenco não disponível.</li>'}
      </ul>
    </div>
  `;

  listaResultados.appendChild(divDetalhes);
}

// =========================================================================
// ATUALIZAÇÃO DA INICIALIZAÇÃO E LISTENERS
// =========================================================================

// Função para iniciar o script
document.addEventListener('DOMContentLoaded', () => {
    carregarGeneros();
    
    // Adiciona o evento de click para a nova busca de filtros
    const botaoBuscarFiltro = document.getElementById("botao-buscar-filtros");
    if (botaoBuscarFiltro) {
        botaoBuscarFiltro.onclick = buscarFilmesPorFiltro;
    }
    
    // Preencher o seletor de Ano
    if (seletorAno) {
        const anoAtual = new Date().getFullYear();
        for (let ano = anoAtual; ano >= 1950; ano--) {
            const option = document.createElement("option");
            option.value = ano;
            option.textContent = ano;
            seletorAno.appendChild(option);
        }
    }
});

// Nota sobre paginação: Para simplificar, as funções proximaPagina/paginaAnterior devem ser adaptadas.
// Como elas chamam a função original (pesquisarFilmes), sugiro focar a navegação da "Etapa 3" na
// nova busca por filtro (`buscarFilmesPorFiltro`).
// Para isso, você precisaria de uma variável de controle para saber qual foi a última busca,
// mas vou manter as originais para não gerar conflito com a lógica OMDb existente.
