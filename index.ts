import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/price", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL obrigatória" });

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const dom = new JSDOM(data);
    const price = dom.window.document.querySelector(".a-price .a-offscreen")?.textContent;
    res.json({ price: price || "Preço não encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Falha ao buscar preço" });
  }
});

app.listen(3000, () => console.log("Backend rodando na porta 3000"));
