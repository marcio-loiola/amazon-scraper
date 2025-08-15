// Obtém elementos do DOM com asserção de não-null
const scrapeBtn = document.getElementById("scrapeBtn")! as HTMLButtonElement;
const keywordInput = document.getElementById("keyword")! as HTMLInputElement;
const resultsContainer = document.getElementById("results")! as HTMLDivElement;

// Função para criar cards de produtos
function createProductCard(product: {
    title: string;
    rating: string;
    reviews: string;
    image: string;
}) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h2>${product.title}</h2>
        <p>Avaliação: ${product.rating}</p>
        <p>Reviews: ${product.reviews}</p>
    `;
    resultsContainer.appendChild(card);
}

// Função para buscar produtos
async function fetchProducts(keyword: string) {
    resultsContainer.innerHTML = "<p>Carregando...</p>";

    try {
        const res = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);
        if (!res.ok) throw new Error("Erro na requisição");
        const data: Array<{ title: string; rating: string; reviews: string; image: string }> = await res.json();

        if (data.length === 0) {
            resultsContainer.innerHTML = "<p>Nenhum produto encontrado.</p>";
            return;
        }

        resultsContainer.innerHTML = "";
        data.forEach(createProductCard);

    } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = "<p>Erro ao buscar produtos.</p>";
    }
}

// Event listener
scrapeBtn.addEventListener("click", () => {
    const keyword = keywordInput.value.trim();
    if (!keyword) return alert("Digite uma palavra-chave!");
    fetchProducts(keyword);
});
