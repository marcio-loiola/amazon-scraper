import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
const PORT = 3000;

// Habilita CORS
app.use(cors());

// Serve static files from frontend build
app.use(express.static("public"));

// Função para construir URL da Amazon
function buildAmazonUrl(query: string): string {
  // Se já é uma URL completa, retorna como está
  if (query.startsWith("http://") || query.startsWith("https://")) {
    return query;
  }

  // Se não é URL, constrói uma busca na Amazon
  const encodedQuery = encodeURIComponent(query.trim());
  return `https://www.amazon.com.br/s?k=${encodedQuery}`;
}

// Endpoint de scraping
app.get("/api/scrape", async (req, res) => {
  const keyword = req.query.keyword as string;

  if (!keyword) {
    return res.status(400).json({ error: "Palavra-chave não informada" });
  }

  const url = buildAmazonUrl(keyword);
  console.log(`Iniciando scraping para: ${url}`);
  console.log(`Palavra-chave: ${keyword}, URL construída: ${url}`);

  try {
    // Fetch com headers mais completos para evitar bloqueio
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
      timeout: 10000,
    });

    console.log(`Página carregada, tamanho: ${data.length} caracteres`);

    const $ = cheerio.load(data);
    const produtos: {
      titulo: string;
      avaliacao?: string;
      numAvaliacoes?: string;
      urlImagem?: string;
      link?: string;
    }[] = [];

    // Múltiplos seletores para diferentes estruturas da Amazon
    const seletores = [
      // Seletores principais
      ".s-main-slot .s-result-item",
      "[data-component-type='s-search-result']",
      ".s-result-item",
      // Seletores alternativos
      ".sg-col-inner .s-result-item",
      ".s-include-content-margin .s-result-item",
    ];

    let produtosEncontrados = 0;
    let seletorUsado = "";

    for (const seletor of seletores) {
      const elementos = $(seletor);
      console.log(
        `Tentando seletor "${seletor}": ${elementos.length} elementos encontrados`
      );

      if (elementos.length > 0) {
        seletorUsado = seletor;
        produtosEncontrados = elementos.length;
        break;
      }
    }

    if (produtosEncontrados === 0) {
      console.log("Nenhum produto encontrado com os seletores padrão");
      console.log(
        "HTML da página (primeiros 1000 chars):",
        data.substring(0, 1000)
      );
      return res.json({
        error: "Nenhum produto encontrado",
        debug: {
          url,
          tamanhoPagina: data.length,
          seletoresTestados: seletores,
        },
      });
    }

    console.log(`Usando seletor: ${seletorUsado}`);

    $(seletorUsado).each((index, element) => {
      // Múltiplos seletores para título
      const tituloSeletores = [
        "h2 a span",
        ".a-size-medium.a-color-base.a-text-normal",
        ".a-size-base-plus.a-color-base.a-text-normal",
        "h2 span",
        ".a-link-normal span",
      ];

      let titulo = "";
      for (const tituloSeletor of tituloSeletores) {
        titulo = $(element).find(tituloSeletor).first().text().trim();
        if (titulo) break;
      }

      if (!titulo) {
        console.log(`Produto ${index + 1}: título não encontrado`);
        return;
      }

      // Seletores para avaliação (estrelas)
      const avaliacaoSeletores = [
        ".a-icon-alt",
        ".a-star-rating-text",
        ".a-icon-star-small",
      ];

      let avaliacao = "";
      for (const avaliacaoSeletor of avaliacaoSeletores) {
        avaliacao = $(element).find(avaliacaoSeletor).first().text().trim();
        if (avaliacao && avaliacao.includes("estrela")) break;
      }

      // Seletores para número de avaliações
      const numAvaliacoesSeletores = [
        ".a-size-base.s-underline-text",
        ".a-size-base",
        ".a-link-normal .a-size-base",
      ];

      let numAvaliacoes = "";
      for (const numAvalSeletor of numAvaliacoesSeletores) {
        numAvaliacoes = $(element).find(numAvalSeletor).first().text().trim();
        if (numAvaliacoes && numAvaliacoes.includes("avaliação")) break;
      }

      // Seletores para URL da imagem
      const imagemSeletores = ["img.s-image", ".s-image", "img[src*='images']"];

      let urlImagem = "";
      for (const imagemSeletor of imagemSeletores) {
        urlImagem = $(element).find(imagemSeletor).first().attr("src") || "";
        if (urlImagem) break;
      }

      // Múltiplos seletores para link
      const linkSeletores = ["h2 a", ".a-link-normal", "a[href*='/dp/']"];

      let link = "";
      for (const linkSeletor of linkSeletores) {
        link = $(element).find(linkSeletor).first().attr("href") || "";
        if (link) break;
      }

      // Normalizar link
      if (link && !link.startsWith("http")) {
        link = link.startsWith("/")
          ? `https://www.amazon.com.br${link}`
          : `https://www.amazon.com.br/${link}`;
      }

      produtos.push({
        titulo,
        avaliacao: avaliacao || undefined,
        numAvaliacoes: numAvaliacoes || undefined,
        urlImagem: urlImagem || undefined,
        link: link || undefined,
      });

      console.log(`Produto ${index + 1}: ${titulo.substring(0, 50)}...`);
    });

    console.log(`Total de produtos extraídos: ${produtos.length}`);
    return res.json({
      produtos,
      debug: {
        url,
        seletorUsado,
        produtosEncontrados,
        produtosExtraidos: produtos.length,
      },
    });
  } catch (err) {
    console.error("Erro no scraping:", err);
    return res.status(500).json({
      error: "Falha ao fazer scraping",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Endpoint de exemplo/teste
app.get("/", (req, res) => {
  res.json({
    message: "Amazon Scraper API",
    endpoints: {
      scrape: "/api/scrape?keyword=suaPalavraChave",
      examples: [
        "/api/scrape?keyword=iPhone",
        "/api/scrape?keyword=notebook",
        "/api/scrape?keyword=fones bluetooth",
      ],
    },
  });
});

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
