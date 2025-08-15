import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  try {
    const url = "https://www.amazon.com.br/s?k=notebook";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const produtos: { titulo: string; preco: string }[] = [];

    $(".s-main-slot .s-result-item").each(
      (index: number, element: cheerio.Element) => {
        const titulo = $(element).find("h2 a span").text().trim();
        const preco = $(element)
          .find(".a-price .a-offscreen")
          .first()
          .text()
          .trim();

        if (titulo) {
          produtos.push({ titulo, preco });
        }
      }
    );

    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao fazer scraping" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
