// CONFIGURAÇÃO DA API
const API_URL = "http://localhost:3000/livros";

// ESTADO GLOBAL DA APLICAÇÃO
const STATE = { category: "Todos", search: "", theme: "light" };
let BOOKS_DATA = [];

// MINHAS INFORMAÇÕES
const STUDENT_INFO = {
  nome: "Felipe de Carvalho Andrade",
  curso: "Sistemas de Informação",
  turma: "2026.1",
  redes: [
    { nome: "LinkedIn", url: "https://www.linkedin.com/in/felipe-de-carvalho-andrade-it" },
    { nome: "GitHub", url: "https://github.com/Felipe-de-Carvalho-Andrade" },
    { nome: "Instagram", url: "#" },
  ],
};

// MAPEAMENTO DE ELEMENTOS DO DOM
const elements = {
  header: document.querySelector("#header"),
  footer: document.querySelector("#footer"),
  banner: document.querySelector("#banner-section"),
  filters: document.querySelector("#filter-section"),
  cards: document.querySelector("#cards-section"),
  emptyState: document.querySelector("#empty-state"),
};

// 5.B.1 - Busca os itens na API (JSON Server)
async function fetchItems() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro na rede");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Falha ao buscar os livros:", error);
    return [];
  }
}

// 5.B.2 - Criação do Card Dinâmico
function createCard(book) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <a class="card-link" href="details.html?id=${book.id}">
        <article class="book-card" tabindex="0">
          <div class="card-img-wrapper">
            <img src="${book.imagem}" alt="Capa do livro ${book.titulo}" loading="lazy" onerror="this.src='https://placehold.co/360x240?text=Capa+indisponível'" />
          </div>
          <div class="card-content">
            <span class="card-type">${book.categoria}</span>
            <h3 class="card-title-large">${book.titulo}</h3>
            <p class="card-text">${book.descricaoCurta}</p>
            <div class="card-meta">
              <small>R$ ${Number(book.preco).toFixed(2).replace('.', ',')}</small>
              <span class="total-itens"><span></span>Ver detalhes</span>
            </div>
          </div>
        </article>
      </a>
    </div>
  `;
}

// 5.B.3 - Renderiza a lista de cards ou exibe Empty State
function renderCards(items) {
  if (!elements.cards || !elements.emptyState) return;

  if (!items.length) {
    elements.cards.innerHTML = "";
    elements.emptyState.classList.remove("d-none");
    return;
  }

  elements.emptyState.classList.add("d-none");
  elements.cards.innerHTML = items.map((item) => createCard(item)).join("");
  
  const contador = document.querySelector(".section-header .total-itens");
  if (contador) contador.innerHTML = `<span></span>${items.length} resultados`;
}

// LÓGICA DE FILTRAGEM E BUSCA
function getFilteredResults() {
  const query = STATE.search.toLowerCase().trim();
  return BOOKS_DATA.filter((book) => {
    const matchesCategory = STATE.category === "Todos" || book.categoria === STATE.category;
    if (!query) return matchesCategory;
    const searchableFields = [book.titulo, book.autor, book.categoria];
    const matchesQuery = searchableFields.some(field => field && field.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });
}

// MAPEAMENTO DE CATEGORIAS
function getCategories() {
  const categories = BOOKS_DATA.map((book) => book.categoria);
  return ["Todos", ...new Set(categories)];
}

// RENDERIZAÇÃO DO CAROUSEL DE DESTAQUES
function renderBanner() {
  if (!elements.banner || !BOOKS_DATA.length) return;
  const highlight = BOOKS_DATA.filter(b => b.destaque).slice(0, 5);
  if(!highlight.length) return;

  const indicators = highlight.map((_, index) => `
    <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="${index}" class="${index === 0 ? "active" : ""}" aria-current="${index === 0 ? "true" : ""}" aria-label="Slide ${index + 1}"></button>
  `).join("");

  const slides = highlight.map((book, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}" style="background-image: url('${book.imagem}')">
        <div class="carousel-caption">
          <span class="total-itens"><span></span>${book.categoria}</span>
          <h1>${book.titulo}</h1>
          <p>${book.descricaoCurta}</p>
          <a class="btn btn-primary" href="details.html?id=${book.id}">Ver detalhes</a>
        </div>
      </div>
  `).join("");

  elements.banner.innerHTML = `
    <div id="bannerCarousel" class="carousel slide banner" data-bs-ride="carousel" data-bs-interval="4000">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${slides}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-next="prev">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Próximo</span>
      </button>
    </div>
  `;

  const carouselEl = document.querySelector("#bannerCarousel");
  if (carouselEl && typeof bootstrap !== "undefined") {
    const myCarousel = new bootstrap.Carousel(carouselEl, {
      interval: 4000, 
      wrap: true
    });
    myCarousel.cycle(); 
  }
}

// RENDERIZAÇÃO DA SEÇÃO DE FILTROS E BUSCA
function renderFilterSection() {
  if (!elements.filters) return;
  const categories = getCategories();
  const pills = categories.map((cat) => `
      <button type="button" class="btn-filtro ${STATE.category === cat ? "active" : ""}" data-category="${cat}">${cat}</button>
  `).join("");

  elements.filters.innerHTML = `
    <div class="section-header mb-4">
      <div>
        <h2 class="section-headline">Explore o catálogo de livros</h2>
        <p class="section-subtitle">Use os filtros por categoria ou pesquise.</p>
      </div>
      <div class="total-itens"><span></span>${BOOKS_DATA.length} resultados</div>
    </div>
    <div class="filter-dashboard">
      <div class="search-wrapper">
        <input id="searchInput" class="search-input" type="search" placeholder="🔍 Digite para buscar..." value="${STATE.search}"/>
      </div>
      <div class="category-list">${pills}</div>
    </div>
  `;
}

// GERENCIAMENTO DE EVENTOS DA INTERFACE
function attachEvents() {
  const themeToggle = document.querySelector("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      saveTheme(STATE.theme === "dark" ? "light" : "dark");
      renderHeader(false);
      attachEvents();
    });
  }

  const searchInput = document.querySelector("#searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      STATE.search = event.target.value;
      renderCards(getFilteredResults());
    });
  }

  document.querySelectorAll(".btn-filtro").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      STATE.category = button.dataset.category;
      document.querySelectorAll(".btn-filtro").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderCards(getFilteredResults());
    });
  });
}

// CONTROLE DO TEMA
function saveTheme(value) {
  STATE.theme = value;
  document.body.classList.toggle("theme-dark", value === "dark");
  window.localStorage.setItem("biblioteca-theme", value);
}

function loadTheme() {
  const storedTheme = window.localStorage.getItem("biblioteca-theme");
  const defaultTheme = storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
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
            ${isDetail ? `<li class="nav-item"><a class="nav-link" href="index.html">Voltar</a></li>` : `<li class="nav-item"><a class="nav-link active" href="index.html">Home</a></li>`}
          </ul>
        </div>
      </div>
    </nav>
  `;
}

function renderFooter() {
  if (!elements.footer) return;

  const linkedinUrl = STUDENT_INFO.redes.find((r) => r.nome.toLowerCase() === "linkedin")?.url || "#";
  const githubUrl = STUDENT_INFO.redes.find((r) => r.nome.toLowerCase() === "github")?.url || "#";
  const instagramUrl = STUDENT_INFO.redes.find((r) => r.nome.toLowerCase() === "instagram")?.url || "#";
  const fotoPerfilUrl = "https://avatars.githubusercontent.com/u/108103633?s=400&u=432c7d9ea79269cd68538f69b0e65f10f12b0849&v=4";

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

// 5.B.4 - Inicializador Assíncrono da Aplicação
async function init() {
  loadTheme();
  renderHeader(false);
  renderFooter();

  BOOKS_DATA = await fetchItems();

  renderBanner();
  renderFilterSection();
  
  renderCards(getFilteredResults());
  attachEvents();
}

window.addEventListener("DOMContentLoaded", init);
