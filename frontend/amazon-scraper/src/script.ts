/**
 * Amazon Scraper Frontend
 * 
 * Interface de usuário para o scraper da Amazon
 * Permite inserir palavras-chave e exibe resultados em cards
 * 
 * Funcionalidades:
 * - Formulário de busca com validação
 * - Exibição de produtos em grid responsivo
 * - Sistema de estrelas para avaliações
 * - Tratamento de erros e estados de loading
 */

// Seleção segura dos elementos do DOM com validação
const form = document.querySelector<HTMLFormElement>("#scrape-form");
if (!form) throw new Error("Formulário não encontrado");

const input = document.querySelector<HTMLInputElement>("#url");
if (!input) throw new Error("Campo de URL não encontrado");

const submitBtn = document.querySelector<HTMLButtonElement>("#submit-btn");
if (!submitBtn) throw new Error("Botão não encontrado");

const loading = document.querySelector<HTMLElement>("#loading");
const error = document.querySelector<HTMLElement>("#error");
const noProducts = document.querySelector<HTMLElement>("#no-products");
const productsGrid = document.querySelector<HTMLElement>("#products-grid");
const debugInfo = document.querySelector<HTMLElement>("#debug-info");

// Função para mostrar/esconder elementos
function showElement(element: HTMLElement | null) {
  if (element) element.style.display = "block";
}

function hideElement(element: HTMLElement | null) {
  if (element) element.style.display = "none";
}

function hideAllResults() {
  hideElement(loading);
  hideElement(error);
  hideElement(noProducts);
  hideElement(debugInfo);
  if (productsGrid) productsGrid.innerHTML = "";
}

// Função para criar estrelas baseada na avaliação
function createStars(rating: string): string {
  if (!rating) return "";

  const ratingMatch = rating.match(/(\d+(?:\.\d+)?)/);
  if (!ratingMatch) return "";

  const ratingValue = parseFloat(ratingMatch[1]);
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;

  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += "★";
  }
  if (hasHalfStar) {
    stars += "☆";
  }
  for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
    stars += "☆";
  }

  return stars;
}

// Função para exibir produtos em cards
function mostrarProdutos(data: any) {
  hideAllResults();

  if (data.error) {
    showElement(error);
    if (error) error.textContent = data.error;
    return;
  }

  if (!data.produtos || data.produtos.length === 0) {
    showElement(noProducts);
    return;
  }

  if (productsGrid) {
    productsGrid.innerHTML = data.produtos
      .map(
        (produto: any, index: number) => `
      <div class="product-card">
        ${
          produto.urlImagem
            ? `<img src="${produto.urlImagem}" alt="${produto.titulo}" class="product-image" onerror="this.style.display='none'">`
            : '<div class="product-image" style="display: flex; align-items: center; justify-content: center; color: #999;">Sem imagem</div>'
        }
        <h3 class="product-title">${produto.titulo}</h3>
        ${
          produto.avaliacao
            ? `
          <div class="product-rating">
            <span class="stars">${createStars(produto.avaliacao)}</span>
            <span class="rating-text">${produto.avaliacao}</span>
          </div>
        `
            : ""
        }
        ${
          produto.numAvaliacoes
            ? `
          <div class="rating-text">${produto.numAvaliacoes}</div>
        `
            : ""
        }
        ${
          produto.link
            ? `
          <a href="${produto.link}" target="_blank" class="product-link">Ver na Amazon</a>
        `
            : ""
        }
      </div>
    `
      )
      .join("");
  }

  // Mostrar informações de debug se disponíveis
  if (data.debug) {
    showElement(debugInfo);
    if (debugInfo) {
      debugInfo.innerHTML = `
        <strong>Informações de Debug:</strong><br>
        URL: ${data.debug.url}<br>
        Seletor usado: ${data.debug.seletorUsado}<br>
        Produtos encontrados: ${data.debug.produtosEncontrados}<br>
        Produtos extraídos: ${data.debug.produtosExtraidos}
      `;
    }
  }
}

// Listener do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const keyword = input.value.trim();
  if (!keyword) {
    mostrarProdutos({ error: "Digite uma palavra-chave válida" });
    return;
  }

  // Mostrar loading e desabilitar botão
  showElement(loading);
  submitBtn.disabled = true;
  submitBtn.textContent = "Buscando...";

  console.log("Palavra-chave enviada:", keyword); // debug
  console.log("Palavra-chave codificada:", encodeURIComponent(keyword)); // debug adicional

  try {
    const requestUrl = `/api/scrape?keyword=${encodeURIComponent(keyword)}`;
    console.log("Requisição para:", requestUrl); // debug da URL completa

    const res = await fetch(requestUrl);
    console.log("Status da resposta:", res.status); // debug do status

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erro na resposta:", errorText);
      throw new Error(`Erro na requisição: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log("Dados recebidos:", data); // debug dos dados
    mostrarProdutos(data);
  } catch (err) {
    console.error("Erro completo:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    mostrarProdutos({ error: `Falha ao buscar os dados: ${errorMessage}` });
  } finally {
    // Esconder loading e reabilitar botão
    hideElement(loading);
    submitBtn.disabled = false;
    submitBtn.textContent = "🔍 Buscar Produtos";
  }
});
