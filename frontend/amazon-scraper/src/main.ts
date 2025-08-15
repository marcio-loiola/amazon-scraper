document.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    const url = document.querySelector("#url").value;
    const res = await fetch(`http://localhost:3000/scrape?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    document.querySelector("#resultado").textContent = JSON.stringify(data, null, 2);
});
