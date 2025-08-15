const form = document.querySelector<HTMLFormElement>("form");
if (!form) throw new Error("Formulário não encontrado");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.querySelector<HTMLInputElement>("#url");
  if (!input) throw new Error("Campo de URL não encontrado");

  const url = input.value;
  const res = await fetch(`/scrape?url=${encodeURIComponent(url)}`);
  const data = await res.json();

  const resultado = document.querySelector<HTMLElement>("#resultado");
  if (!resultado) throw new Error("Elemento de resultado não encontrado");

  resultado.textContent = JSON.stringify(data, null, 2);
});
