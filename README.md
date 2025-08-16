# Amazon Scraper

A simple Amazon product scraper that extracts product information using Bun/Express backend and TypeScript/Vite frontend.

## 🇧🇷 Português

Um scraper para Amazon que extrai informações de produtos usando Bun/Express no backend e TypeScript/Vite no frontend.

## Project Structure / Estrutura do Projeto

```
amazon-scraper/
├── backend/          # Express Server / Servidor Express
│   └── server.ts
├── frontend/         # Vite Application / Aplicação Vite
│   └── amazon-scraper/
│       ├── src/
│       │   └── script.ts
│       ├── index.html
│       └── vite.config.ts
├── Dockerfile        # Docker configuration
└── README.md
```

## How to Run / Como Executar

### 1. Install Dependencies / Instalar Dependências

```bash
# Backend (using Bun / usando Bun)
bun install

# Frontend (using npm / usando npm)
cd frontend/amazon-scraper
npm install
```

**Note / Nota**: This project uses **Bun** for backend and **npm** for frontend. The corresponding lock files are:

**Nota**: Este projeto usa **Bun** para o backend e **npm** para o frontend. Os arquivos de lock correspondentes são:

- `bun.lock` (backend)
- `frontend/amazon-scraper/package-lock.json` (frontend)

### 2. Run Backend / Executar o Backend

```bash
# In project root / Na raiz do projeto
bun run dev
# or / ou
bun run backend
# or / ou
bun run backend/server.ts
```

Backend will be running at / O backend estará rodando em `http://localhost:3000`

### 3. Run Frontend / Executar o Frontend

```bash
# In another terminal, in frontend/amazon-scraper folder
# Em outro terminal, na pasta frontend/amazon-scraper
npm run dev
```

Frontend will be running at / O frontend estará rodando em `http://localhost:5173`

## How to Use / Como Usar

1. Open browser at / Abra o navegador em `http://localhost:5173`
2. Type an Amazon URL or keyword / Digite uma URL da Amazon ou palavra-chave
3. Click "Search" / Clique em "Buscar"
4. Results will appear on screen / Os resultados aparecerão na tela

## Configuration / Configuração

Vite is configured with proxy to redirect `/api/scrape` requests to backend at `http://localhost:3000`.

O Vite está configurado com proxy para redirecionar requisições `/api/scrape` para o backend em `http://localhost:3000`.

## Docker

```bash
# Build and run with Docker
docker build -t amazon-scraper .
docker run -p 3000:3000 amazon-scraper
```

## Debug

Frontend includes detailed logs in browser console for debugging:

O frontend inclui logs detalhados no console do navegador para facilitar o debug:

- URL sent / URL enviada
- Encoded URL / URL codificada
- Complete request URL / URL completa da requisição
- Response status / Status da resposta
- Received data / Dados recebidos

## Technologies / Tecnologias

- **Backend**: Bun, Express, Axios, Cheerio
- **Frontend**: TypeScript, Vite
- **CORS**: Enabled for frontend-backend communication / Habilitado para comunicação entre frontend e backend

## Requirements Compliance / Conformidade com Requisitos

### ✅ Backend/API (Bun)
- ✅ Bun project configured with dependencies (express, axios, Cheerio)
- ✅ Script using axios to fetch Amazon search results
- ✅ HTML parsing with Cheerio (better than JSDOM)
- ✅ Extracts: Product Title, Rating (stars), Number of Reviews, Product Image URL
- ✅ Endpoint `/api/scrape` with `?keyword=suaPalavraChave` parameter
- ✅ Returns data in JSON format

### ✅ Frontend (HTML, CSS, JavaScript Vanilla with Vite)
- ✅ Simple web page with input field for search keyword
- ✅ Button to start extraction process
- ✅ User-friendly and presentable styling (Navy Blue theme)
- ✅ JavaScript AJAX call to backend endpoint
- ✅ Clear formatted results display

### ✅ Documentation
- ✅ Code comments explaining logic and process
- ✅ README.md with setup and execution instructions

### ✅ Considerations
- ✅ Error handling in both backend and frontend
- ✅ Clear application execution instructions
- ✅ Clean and functional code
