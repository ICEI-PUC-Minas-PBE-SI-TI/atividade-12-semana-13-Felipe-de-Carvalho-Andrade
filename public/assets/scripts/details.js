// CONFIGURAÇÃO DA API
const API_URL = "http://localhost:3000/livros";

// ESTADO GLOBAL DA APLICAÇÃO
let STATE = { theme: "light" };

// MINHAS INFORMAÇÕES
const STUDENT_INFO = {
  nome: "Felipe de Carvalho Andrade",
  curso: "Sistemas de Informação",
  turma: "2026.1",
  redes: [
    {
      nome: "LinkedIn",
      url: "https://www.linkedin.com/in/felipe-de-carvalho-andrade-it",
    },
    { nome: "GitHub", url: "https://github.com/Felipe-de-Carvalho-Andrade" },
    { nome: "Instagram", url: "#" },
  ],
};

// MAPEAMENTO DE ELEMENTOS DO DOM
const elements = {
  header: document.querySelector("#header"),
  footer: document.querySelector("#footer"),
  detail: document.querySelector("#detail-section"),
};

// 6.A.2 - Busca um item específico na API por ID
async function fetchItemDetails(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Livro não encontrado");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// B.1 - Busca e renderiza livros recomendados (Regra de Negócio Adicional)
async function renderRecommendations(currentBookId) {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return;
    const allBooks = await response.json();

    const recommendations = allBooks.filter(
      (b) => b.id !== parseInt(currentBookId),
    );

    if (recommendations.length === 0) return;

    const cardsHtml = recommendations
      .map((b) => {
        const amazonLink =
          b.linkAmazon ||
          `https://www.amazon.com.br/s?k=${encodeURIComponent(b.titulo + " " + b.autor)}`;

        return `
        <article class="related-book-card">
          <a href="details.html?id=${b.id}" class="related-book-card__media">
            <img src="${b.imagem}" alt="Capa de ${b.titulo}" loading="lazy" onerror="this.src='https://placehold.co/300x400?text=Capa'"/>
          </a>
          <div class="related-book-card__body">
            <span class="book-origin-badge">${b.origem}</span>
            <div class="related-book-card__info">
              <h3 title="${b.titulo}">${b.titulo}</h3>
              <p title="${b.autor}">${b.autor}</p>
            </div>
            <div class="related-book-actions">
              <a href="details.html?id=${b.id}" class="btn btn-outline-primary">Ver Livro</a>
              <a href="${amazonLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Comprar</a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    elements.detail.innerHTML += `
      <section class="mt-5 pt-5 border-top" style="border-color: var(--border) !important;">
        <div class="mb-4">
          <h2 class="section-headline mb-1">Você Também Pode Gostar</h2>
          <p class="section-subtitle-sm">Sugestões selecionadas para sua próxima leitura.</p>
        </div>
        <div class="scrollable-slider-wrapper">
          <div class="scrollable-slider-inner pb-3">
            ${cardsHtml}
          </div>
        </div>
      </section>
    `;
  } catch (error) {
    console.error("Erro ao carregar recomendações:", error);
  }
}

// 6.A.1 - Captura parâmetros da URL, valida dados e inicializa a tela
async function initDetails() {
  loadTheme();
  renderHeader(true);
  renderFooter();

  if (!elements.detail) return;

  // Leitura do parâmetro ID via URLSearchParams
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // 6.A.4 - Tratamento de Erro: Ausência de ID na URL
  if (!id) {
    elements.detail.innerHTML = `
      <div class="text-center py-5">
        <p class="text-muted">Nenhum identificador de livro foi informado na URL.</p>
        <a class="btn btn-outline-primary" href="index.html">Voltar à página inicial</a>
      </div>
    `;
    return;
  }

  const book = await fetchItemDetails(id);

  // 6.A.4 - Tratamento de Erro: Item não localizado no db.json
  if (!book) {
    elements.detail.innerHTML = `
      <div class="text-center py-5">
        <h2 class="fw-bold">Livro não encontrado</h2>
        <p class="text-muted">O livro solicitado não foi localizado no servidor.</p>
        <a class="btn btn-outline-primary" href="index.html">Retornar ao catálogo</a>
      </div>
    `;
    return;
  }

  // Atualização dinâmica do título da aba
  document.title = `${book.titulo} – ${book.autor} | Atlas Livros`;

  const tagsHtml = book.tags
    .map((tag) => `<span class="book-origin-badge">${tag}</span>`)
    .join(" ");
  const mainAmazonLink =
    book.linkAmazon ||
    `https://www.amazon.com.br/s?k=${encodeURIComponent(book.titulo + " " + book.autor)}`;

  // 6.A.3 - Renderização Completa e detalhada do Item obtido
  elements.detail.innerHTML = `
    <div class="detail-top mb-5">
      <div class="breadcrumb">
        <a class="breadcrumb-link" href="index.html">Catálogo</a>
        <span>›</span>
        <span class="breadcrumb-current">${book.categoria}</span>
      </div>
      <div class="detail-actions">
        <span class="category-tag detail-category">${book.categoria}</span>
      </div>
    </div>

    <div class="detail-grid gap-4">
      <aside class="detail-visual-panel">
        <div class="detail-image-card">
          <img src="${book.imagem}" alt="Capa do livro ${book.titulo}" onerror="this.src='https://placehold.co/720x480?text=Capa+indisponível'" />
        </div>
        <div class="detail-summary-card">
          <h2 class="detail-summary-title">Resumo Rápido</h2>
          <p class="detail-summary-text">${book.descricaoCurta}</p>
          <div class="detail-quick-info mb-3">
             <span style="color: var(--primary); font-size: 1.4rem;">R$ ${Number(book.preco).toFixed(2).replace(".", ",")}</span>
          </div>
          <a class="btn btn-primary btn-lg w-100" href="${mainAmazonLink}" target="_blank" rel="noopener noreferrer">Comprar agora</a>
        </div>
      </aside>

      <article class="detail-content-panel">
        <div class="detail-heading">
          <h1 class="detail-headline">${book.titulo}</h1>
          <p class="detail-author">por ${book.autor}</p>
          <div class="mt-2">${tagsHtml}</div>
        </div>

        <section class="detail-meta-card mt-3">
          <h2 class="detail-section-title">Ficha Técnica <span class="detail-meta-origin">${book.origem}</span></h2>
          <div class="detail-meta-grid">
            <div class="meta-item"><span>Editora</span><strong>${book.editora}</strong></div>
            <div class="meta-item"><span>Ano</span><strong>${book.anoPublicacao}</strong></div>
            <div class="meta-item"><span>Páginas</span><strong>${book.paginas}</strong></div>
            <div class="meta-item"><span>Categoria</span><strong>${book.categoria}</strong></div>
          </div>
        </section>

        <section class="detail-story-card mt-3">
          <div class="section-headline-sm mb-3">Sinopse Completa</div>
          <p class="detail-description">${book.descricaoCompleta}</p>
        </section>
      </article>
    </div>
  `;

  await renderRecommendations(id);
  attachEvents();
}

// CONTROLE DO TEMA
function saveTheme(value) {
  STATE.theme = value;
  document.body.classList.toggle("theme-dark", value === "dark");
  window.localStorage.setItem("biblioteca-theme", value);
}

function loadTheme() {
  const storedTheme = window.localStorage.getItem("biblioteca-theme");
  const defaultTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  saveTheme(defaultTheme);
}

// RENDERIZAÇÃO DE COMPONENTES ESTRUTURAIS (HEADER/FOOTER)
function renderHeader(isDetail = false) {
  if (!elements.header) return;
  elements.header.innerHTML = `
    <nav class="navbar navbar-expand-lg sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand" href="index.html">Atlas<span>Livros</span></a>
        <div class="d-flex align-items-center gap-2 order-lg-last">
          <button id="themeToggle" class="theme-toggle" type="button">
            ${STATE.theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <div class="collapse navbar-collapse" id="menuNav">
          <ul class="navbar-nav ms-auto align-items-center gap-2 mb-2 mb-lg-0 me-lg-3">
            <li class="nav-item"><a class="nav-link" href="index.html">Voltar</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
}

function renderFooter() {
  if (!elements.footer) return;

  const linkedinUrl =
    STUDENT_INFO.redes.find((r) => r.nome.toLowerCase() === "linkedin")?.url ||
    "#";
  const githubUrl =
    STUDENT_INFO.redes.find((r) => r.nome.toLowerCase() === "github")?.url ||
    "#";
  const instagramUrl =
    STUDENT_INFO.redes.find((r) => r.nome.toLowerCase() === "instagram")?.url ||
    "#";
  const fotoPerfilUrl =
    "https://avatars.githubusercontent.com/u/108103633?s=400&u=432c7d9ea79269cd68538f69b0e65f10f12b0849&v=4";

  elements.footer.innerHTML = `
    <footer class="footer-wrapper py-5">
      <div class="container">
        <div class="row gy-4 gx-lg-5">
          <div class="col-12 col-lg-8">
            <h3 mb-3">Sobre</h3>
            <p class="footer-description">
              O Atlas Livros é o seu portal definitivo para explorar o vasto universo da literatura. 
              Nossa missão é conectar apaixonados por leitura a histórias inesquecíveis, oferecendo 
              um catálogo cuidadosamente curado. De grandes clássicos atemporais às mais inovadoras 
              vozes contemporâneas, criamos este espaço para que você descubra, pesquise e se inspire 
              em sua próxima jornada literária.
            </p>
          </div>
          <div class="col-12 col-lg-4">
            <h3 mb-3 me-5 text-center">Autoria</h3>
            <div class="d-flex align-items-start gap-3 mb-4">
              <div>
                <img src="${fotoPerfilUrl}" alt="Foto de ${STUDENT_INFO.nome}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="border-radius: 50%; width: 150px">
              </div>
              <div class="footer-author-info">
                <p class="mb-1"><strong>Aluno:</strong> ${STUDENT_INFO.nome}</p>
                <p class="mb-1"><strong>Curso:</strong> ${STUDENT_INFO.curso}</p>
                <p class="mb-0"><strong>Turma:</strong> ${STUDENT_INFO.turma}</p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span><strong>Redes Sociais:</strong></span>
              <div class="d-flex gap-3">
                <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                  <i class="bi bi-linkedin"></i>
                </a>
                <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                  <i class="bi bi-github"></i>
                </a>
                <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                  <i class="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-credits mt-5 pt-4 border-top text-center text-muted">
          <p class="mb-0 small">© 2026 Atlas Livros — Catálogo de livros. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  `;
}

// GERENCIAMENTO DE EVENTOS DA INTERFACE
function attachEvents() {
  const themeToggle = document.querySelector("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      saveTheme(STATE.theme === "dark" ? "light" : "dark");
      renderHeader(true);
      attachEvents();
    });
  }
}

window.addEventListener("DOMContentLoaded", initDetails);
