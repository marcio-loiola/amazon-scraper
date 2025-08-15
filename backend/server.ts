import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Função para criar URL de busca da Amazon
function buildAmazonURL(keyword) {
    const encoded = encodeURIComponent(keyword);
    return `https://www.amazon.com.br/s?k=${encoded}`;
}

// Endpoint /api/scrape
app.get("/api/scrape", async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ error: "Parâmetro 'keyword' obrigatório" });

    const url = buildAmazonURL(keyword);

    try {
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const dom = new JSDOM(data);
        const document = dom.window.document;

        // Seleciona os itens de produto na primeira página
        const items = document.querySelectorAll("div.s-main-slot > div[data-component-type='s-search-result']");

        const products = [];

        items.forEach(item => {
            const title = item.querySelector("h2 a span")?.textContent.trim();
            const rating = item.querySelector(".a-icon-alt")?.textContent.trim();
            const reviews = item.querySelector(".a-size-base")?.textContent.trim();
            const image = item.querySelector("img.s-image")?.src;

            if (title) {
                products.push({
                    title,
                    rating: rating || "Sem avaliação",
                    reviews: reviews || "0",
                    image: image || ""
                });
            }
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao fazer scraping" });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
