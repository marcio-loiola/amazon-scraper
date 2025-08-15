// Seleção segura dos elementos do DOM
const form = document.querySelector<HTMLFormElement>("form");
if (!form) throw new Error("Formulário não encontrado");

const input = document.querySelector<HTMLInputElement>("#url");
if (!input) throw new Error("Campo de URL não encontrado");

const resultado = document.querySelector<HTMLElement>("#resultado");
if (!resultado) throw new Error("Elemento de resultado não encontrado");

function mostrarResultado(data: unknown) {
  // como já checamos, TypeScript sabe que resultado não é null
  resultado.textContent = JSON.stringify(data, null, 2);
}

// Listener do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = input.value.trim();
  if (!url) {
    mostrarResultado({ error: "Digite uma URL válida" });
    return;
  }

  try {
    const res = await fetch(`/scrape?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
    const data = await res.json();
    mostrarResultado(data);
  } catch (err) {
    console.error(err);
    mostrarResultado({ error: "Falha ao buscar os dados" });
  }
});