// app.js

// ===== CONFIGURAÇÃO INICIAL OMDb (Mantida da Aula) =====
// Pegue sua chave gratuita em: http://www.omdbapi.com/apikey.aspx
const CHAVE_API_OMDB = "eec34f73";
const URL_BASE_OMDB = "https://www.omdbapi.com/";

// ===== CONFIGURAÇÃO TMDb (NOVA API: The Movie Database) =====
// IMPORTANTE: Obtenha sua chave V3 em https://developer.themoviedb.org/
const CHAVE_API_TMDB = "d058b2f7067ea2a07cd74e0c7ee817f2"; // << COLOQUE SUA CHAVE AQUI
const URL_BASE_TMDB = "https://api.themoviedb.org/3/";
const URL_BASE_IMAGEM_TMDB = "https://image.tmdb.org/t/p/w500"; // URL base para posters

// ===== CONEXÃO COM O HTML (ADICIONAIS) =====
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("lista-resultados");
const mensagemStatus = document.getElementById("mensagem-status");
const seletorGenero = document.getElementById("seletor-genero");
const seletorAno = document.getElementById("seletor-ano");
// NOVO: Campo de busca de ator
const campoAtor = document.getElementById("campo-ator");

// ===== VARIÁVEIS DE CONTROLE =====
let termoBusca = "";
let paginaAtual = 1;

// ===== FUNÇÕES OMDb (MANTIDAS DO EXERCÍCIO ORIGINAL) =====

function buscarFilmes() {
  termoBusca = campoBusca.value.trim();
  paginaAtual = 1;
  pesquisarFilmes(); // Chama a função OMDb
}

// A OMDb só suporta paginação para busca por título, não para filtros TMDb.
function proximaPagina() {
  paginaAtual++;
  pesquisarFilmes();
}

function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    pesquisarFilmes();
  }
}

async function pesquisarFilmes() {
  if (!termoBusca) {
    mensagemStatus.textContent = "Digite o nome de um filme para pesquisar (OMDb).";
    listaResultados.innerHTML = "";
    return;
  }

  mensagemStatus.textContent = "🔄 Buscando filmes OMDb, aguarde...";
  listaResultados.innerHTML = "";

  try {
    const url = `${URL_BASE_OMDB}?apikey=${CHAVE_API_OMDB}&s=${encodeURIComponent(termoBusca)}&page=${paginaAtual}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.Response === "False") {
      mensagemStatus.textContent = "Nenhum resultado encontrado na busca OMDb.";
      listaResultados.innerHTML = "";
      return;
    }
    
    // Usa a função de exibição OMDb original
    exibirFilmesOMDB(dados.Search);
    mensagemStatus.textContent = `Página ${paginaAtual} — mostrando resultados OMDb para "${termoBusca}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados OMDb. Verifique sua conexão.";
  }
}

// FUNÇÃO ORIGINAL OMDb (simples)
function exibirFilmesOMDB(filmes) {
  listaResultados.innerHTML = "";
  filmes.forEach(filme => {
    const div = document.createElement("div");
    div.classList.add("card");

    const poster = filme.Poster !== "N/A"
      ? filme.Poster
      : "https://via.placeholder.com/300x450?text=Sem+Poster";

    div.innerHTML = `
      <img src="${poster}" alt="Pôster do filme ${filme.Title}">
      <h3>${filme.Title}</h3>
      <p>Ano: ${filme.Year}</p>
      `;
    listaResultados.appendChild(div);
  });
}


// =========================================================================
// NOVO: FUNCIONALIDADES TMDb (Filtragem e Detalhes Avançados)
// =========================================================================

// 1. Carrega a lista de gêneros para o seletor HTML
async function carregarGeneros() {
  try {
    const url = `${URL_BASE_TMDB}genre/movie/list?api_key=${CHAVE_API_TMDB}&language=pt-BR`;
    const resposta = await fetch(url);
    const dados = await resposta.json();
    
    dados.genres.forEach(genero => {
      if (seletorGenero) {
        const option = document.createElement("option");
        option.value = genero.id;
        option.textContent = genero.name;
        seletorGenero.appendChild(option);
      }
    });

  } catch (erro) {
    console.error("❌ Erro ao carregar gêneros do TMDb. Verifique sua chave.", erro);
  }
}

// 2. Busca filmes usando os filtros (Discover)
async function buscarFilmesPorFiltro() {
  const generoId = seletorGenero.value;
  const ano = seletorAno.value;
  paginaAtual = 1;

  if (!generoId && !ano) {
    mensagemStatus.textContent = "Selecione um Gênero ou Ano para filtrar a busca TMDb.";
    listaResultados.innerHTML = "";
    return;
  }

  mensagemStatus.textContent = "🔄 Buscando filmes por filtro TMDb, aguarde...";
  listaResultados.innerHTML = "";

  try {
    // Endpoint /discover/movie para aplicar filtros
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
      mensagemStatus.textContent = "Nenhum resultado encontrado com os filtros TMDb selecionados.";
      return;
    }

    // Usa a função de exibição TMDb (que tem o botão Detalhes)
    exibirFilmesTMDb(dados.results);
    mensagemStatus.textContent = `Página ${paginaAtual} — ${dados.total_results} resultados encontrados (TMDb).`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados por filtro TMDb. Verifique sua chave.";
  }
}

// 3. Função para mostrar filmes do TMDb (com botão de detalhes)
function exibirFilmesTMDb(filmes) {
  listaResultados.innerHTML = "";

  filmes.forEach(filme => {
    const div = document.createElement("div");
    div.classList.add("card");
    
    // Poster: Concatena a URL base de imagens com o caminho do poster
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

// 4. Busca os detalhes e o elenco de um filme específico
async function buscarDetalhesFilme(filmeId, titulo) {
  mensagemStatus.textContent = `🔄 Buscando detalhes de "${titulo}", aguarde...`;
  listaResultados.innerHTML = "";

  try {
    // 1. Busca os detalhes primários
    const urlDetalhes = `${URL_BASE_TMDB}movie/${filmeId}?api_key=${CHAVE_API_TMDB}&language=pt-BR`;
    const respostaDetalhes = await fetch(urlDetalhes);
    const dadosDetalhes = await respostaDetalhes.json();
    
    // 2. Busca o elenco/créditos (atores)
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

// 5. Exibe os detalhes complementares e a lista de atores
function exibirDetalhesFilme(detalhes, creditos) {
  listaResultados.innerHTML = "";

  const divDetalhes = document.createElement("div");
  divDetalhes.classList.add("detalhes-container");
  
  // Lista dos 5 principais atores (Elenco)
  const atores = creditos.cast
    .slice(0, 5) // Pega apenas os 5 primeiros
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
// INICIALIZAÇÃO E LISTENERS
// =========================================================================

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

// app.js (Novas Funções para Busca por Ator)

// =========================================================================
// NOVO: FUNÇÕES TMDb (Busca por Ator/Pessoa)
// =========================================================================

// 1. Inicia a busca pelo nome do ator e encontra seu ID
async function buscarAtor() {
  const nomeAtor = campoAtor.value.trim();
  if (!nomeAtor) {
    mensagemStatus.textContent = "Digite o nome de um ator para pesquisar.";
    return;
  }

  mensagemStatus.textContent = `🔄 Buscando ID do ator(a) "${nomeAtor}", aguarde...`;
  listaResultados.innerHTML = "";

  try {
    // Endpoint: /search/person para encontrar o ator
    const urlBusca = `${URL_BASE_TMDB}search/person?api_key=${CHAVE_API_TMDB}&query=${encodeURIComponent(nomeAtor)}`;
    
    const resposta = await fetch(urlBusca);
    const dados = await resposta.json();
    
    if (dados.results.length === 0) {
      mensagemStatus.textContent = `Ator(a) "${nomeAtor}" não encontrado(a) na base de dados.`;
      return;
    }

    // Pega o ID do ator mais relevante (o primeiro resultado)
    const atorPrincipal = dados.results[0];
    
    // Chama a próxima função para buscar os filmes dele/dela
    buscarCreditosDoAtor(atorPrincipal.id, atorPrincipal.name);

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar o ator. Verifique sua conexão/chave TMDb.";
  }
}

// app.js (Função corrigida e otimizada)

// 2. Busca os filmes (créditos) em que o ator atuou
async function buscarCreditosDoAtor(atorId, nomeAtor) {
  mensagemStatus.textContent = `🔄 Buscando filmes de "${nomeAtor}", aguarde...`;

  try {
    // Endpoint: /person/{person_id}/movie_credits
    // NOTE: Este endpoint já retorna apenas 'movie' (filmes) e não 'tv' (séries).
    const urlCreditos = `${URL_BASE_TMDB}person/${atorId}/movie_credits?api_key=${CHAVE_API_TMDB}&language=pt-BR`;
    
    const resposta = await fetch(urlCreditos);
    const dados = await resposta.json();
    
    // -------------------------------------------------------------------
    // MUDANÇAS AQUI:
    // -------------------------------------------------------------------

    // 1. Pega apenas o array 'cast' (o que ele/ela atuou)
    const filmesDoAtor = dados.cast;

    if (!filmesDoAtor || filmesDoAtor.length === 0) {
      mensagemStatus.textContent = `Nenhum crédito de atuação encontrado para "${nomeAtor}".`;
      return;
    }

    // 2. Filtra e organiza:
    const filmesFiltrados = filmesDoAtor
      // Filtra para remover itens sem data de lançamento ou sem título.
      .filter(filme => filme.release_date && filme.title) 
      .sort((a, b) => {
        // Ordena por ano de lançamento decrescente (mais recentes primeiro)
        const anoA = a.release_date ? parseInt(a.release_date.substring(0, 4)) : 0;
        const anoB = b.release_date ? parseInt(b.release_date.substring(0, 4)) : 0;
        return anoB - anoA;
      });

    if (filmesFiltrados.length === 0) {
      mensagemStatus.textContent = `Nenhum filme válido encontrado para "${nomeAtor}".`;
      return;
    }

    // Reutiliza a função de exibição do TMDb
    exibirFilmesTMDb(filmesFiltrados);
    mensagemStatus.textContent = `Filmes em que **${nomeAtor}** atuou: ${filmesFiltrados.length} resultados.`;

  } catch (erro) {
    console.error(erro);
    // Erro comum aqui é a chave de API:
    mensagemStatus.textContent = "❌ Erro ao buscar os créditos do ator. Verifique se a sua CHAVE_API_TMDB está correta.";
  }
}