

# 🎬 Projeto de Busca de Filmes (APIs OMDb e TMDb)

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido como uma atividade acadêmica do segundo semestre de ADS, com o objetivo de **consolidar a prática de integração entre HTML, CSS e JavaScript** e expandir a experiência com o consumo de diferentes APIs públicas no front-end.

O projeto inicial (OMDb) foi ampliado com a integração da **The Movie Database (TMDb)** para funcionalidades avançadas, como filtros, detalhes complementares e pesquisa por atores.

## ✨ Funcionalidades Implementadas (Features)

| Funcionalidade | API Utilizada | Descrição |
| :--- | :--- | :--- |
| **Busca Simples por Título** | OMDb | Funcionalidade básica de busca de filmes por título (mantida da aula). |
| **Busca por Filtros** | TMDb (`/discover/movie`) | Permite filtrar filmes por **Gênero** e **Ano de Lançamento**. |
| **Busca por Ator/Atriz** | TMDb (`/search/person` e `/movie_credits`) | Permite pesquisar filmes em que um determinado ator atuou, exibindo o card de resultados. |
| **Detalhes Complementares** | TMDb (`/movie/{id}`) | Exibe informações detalhadas de um filme (sinopse, duração, avaliação). |
| **Lista de Atores (Elenco)** | TMDb (`/movie/{id}/credits`) | Ao clicar em Detalhes, exibe o Top 5 do elenco principal do filme. |

## ⚙️ Tecnologias

  * **HTML5:** Estrutura da aplicação web.
  * **CSS3:** Estilização básica e design responsivo dos cards e detalhes.
  * **JavaScript (ES6+):** Lógica de consumo e manipulação das APIs (`fetch` e manipulação do DOM).

## 🚀 Como Executar o Projeto Localmente

Este é um projeto **front-end puro**. Não é necessário configurar um servidor Node.js ou banco de dados.

1.  **Clone o Repositório:**
    ```bash
    git clone [LINK_DO_SEU_REPOSITÓRIO]
    ```
2.  **Obtenha a Chave TMDb:**
      * Crie uma conta em `https://www.themoviedb.org/`.
      * Obtenha sua **API Key (v3)** na seção Configurações de API.
3.  **Configure a Chave:**
      * Abra o arquivo `app.js`.
      * Substitua o placeholder pela sua chave real:
        ```javascript
        const CHAVE_API_TMDB = "d058b2f7067ea2a07cd74e0c7ee817f2"; // SUBSTITUA PELA SUA CHAVE
        ```
4.  **Execute:**
      * Abra o arquivo `index.html` diretamente no seu navegador.

## 📸 Evidências do Desenvolvimento


### 1\. Busca por Ator (Exemplo: Tom Cruise)
<img width="1035" height="870" alt="image" src="https://github.com/user-attachments/assets/6325dfe0-1546-439e-a996-322b50151c99" />


### 2\. Filtros e Detalhes
<img width="931" height="818" alt="image" src="https://github.com/user-attachments/assets/472dfe96-7c81-49db-a101-57078d88644d" />


### 3\. Detalhes Complementares e Elenco Principal

<img width="989" height="675" alt="image" src="https://github.com/user-attachments/assets/35b7a9c3-855f-4587-acb1-b50655b278b5" />


## 🧑‍💻 Autor

  * **Gustavo Gonçalves Viana**
  * **[ID de Estudante: 1142442193]**
  * [github.com/gustavao578]
