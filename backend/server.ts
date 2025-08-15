import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
const PORT = 3000;

// Habilita CORS
app.use(cors());

// Endpoint de scraping
app.get("/scrape", async (req, res) => {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: "URL não informada" });
  }

  try {
    // Fetch com headers para evitar bloqueio
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
      }
    });

    const $ = cheerio.load(data);
    const produtos: {
      titulo: string;
      preco?: string;
      link?: string;
    }[] = [];

    $(".s-main-slot .s-result-item").each((_, element) => {
      const titulo = $(element).find("h2 a span").text().trim();
      if (!titulo) return; // ignora elementos sem título

      const preco = $(element).find(".a-price .a-offscreen").first().text().trim();
      const link = $(element).find("h2 a").attr("href");
      produtos.push({
        titulo,
        preco: preco || undefined,
        link: link ? `https://www.amazon.com.br${link}` : undefined
      });
    });

    console.log(`Produtos encontrados: ${produtos.length}`);
    return res.json(produtos);
  } catch (err) {
    console.error("Erro no scraping:", err);
    return res.status(500).json({ error: "Falha ao fazer scraping" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
