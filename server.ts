import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared lazy init function
  let aiInstance: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não localizada. Configure sua chave API no painel de Segredos (Settings > Secrets) do AI Studio.");
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiInstance;
  }

  // API router for market potential analysis
  app.post("/api/analyze-market", async (req, res) => {
    try {
      const { sellerName, city, currentClients, segment } = req.body;

      if (!sellerName || !city || typeof currentClients === "undefined" || !segment) {
        return res.status(400).json({ error: "Parâmetros obrigatórios ausentes (sellerName, city, currentClients, segment)." });
      }

      const parsedClients = parseInt(currentClients, 10) || 0;

      const ai = getAi();
      const prompt = `Analise o potencial de mercado para expansão de vendas com os seguintes dados fornecidos:
- Cidade: ${city}
- Nome do Vendedor: ${sellerName}
- Clientes Atuais na cidade: ${parsedClients}
- Segmento de Atuação da Empresa: ${segment}

Com base nas informações populacionais, socioeconômicas e demográficas da cidade "${city}" no Brasil, traga estimativas do mercado disponível para expandir nossas vendas. Retorne os seguintes dados em português usando o formato JSON solicitado:
1. cityName: Nome oficial da cidade (e Estado, ex: "Campinas - SP")
2. estimatedPopulation: População estimada atual como número inteiro.
3. gdpPerCapita: PIB per Capita aproximado ou nível de renda média formatado como texto explicativo (ex: "R$ 45.000 ou Classe C predominante").
4. mainSectors: Uma lista (array de strings) com os 3 principais setores econômicos da cidade (ex: "Comércio", "Tecnologia", "Agronegócio").
5. estimatedTotalMarketSize: Uma estimativa realista do número TOTAL de clientes potenciais (empresas ou consumidores, dependendo do segmento e tamanho da cidade e do segmento "${segment}") que a cidade oferece no total. Certifique-se de que este número é um inteiro razoável e seja estritamente maior que zero e maior que o número de clientes atuais no segmento (ou seja: se o usuário já tem ${parsedClients} clientes na cidade, a estimativa de tamanho total de mercado nesta cidade deve ser sensivelmente superior para viabilizar a expansão, ex: se tem 15 clientes de varejo e a cidade tem 200.000 hab, o mercado total pode ser estimado em 350 varejistas locais).
6. expansionScore: Um score numérico de potencial de expansão de 1 a 100 (onde maior indica muito mercado virgem para conquistar e alto potencial, e menor indica mercado já saturado ou sem capacidade de expansão).
7. expansionDifficulty: Grau de dificuldade estimado para adentrar ou expandir na região (pode ser "Baixa", "Média" ou "Alta").
8. growthRateEstimate: Taxa de crescimento anual estimada do segmento na região (ex: "Forte (8% a.a.)" ou "Estável (3% a.a.)").
9. nicheRecommendations: Uma lista de 3 recomendações de nichos, bairros ou abordagens táticas específicas para o vendedor "${sellerName}" prospectar (ex: "Focar em academias de médio porte", "Parcerias com condomínios residenciais do bairro X").
10. actionPlan: Um plano passo a passo prático de 3 ou 4 itens simples para começar a prospectar imediatamente nesta cidade de forma direcionada.
11. demographicInsight: Um parágrafo explicativo e enriquecedor sobre o perfil demográfico, hábitos de consumo ou geografia da cidade "${city}" que se relacionam de forma relevante para o segmento de vendas "${segment}".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cityName: { type: Type.STRING },
              estimatedPopulation: { type: Type.INTEGER },
              gdpPerCapita: { type: Type.STRING },
              mainSectors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              estimatedTotalMarketSize: { type: Type.INTEGER },
              expansionScore: { type: Type.INTEGER },
              expansionDifficulty: { type: Type.STRING },
              growthRateEstimate: { type: Type.STRING },
              nicheRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              demographicInsight: { type: Type.STRING },
            },
            required: [
              "cityName",
              "estimatedPopulation",
              "gdpPerCapita",
              "mainSectors",
              "estimatedTotalMarketSize",
              "expansionScore",
              "expansionDifficulty",
              "growthRateEstimate",
              "nicheRecommendations",
              "actionPlan",
              "demographicInsight",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Nenhuma resposta recebida do modelo de IA.");
      }

      const parsedAnalysis = JSON.parse(responseText);
      res.json(parsedAnalysis);
    } catch (error: any) {
      console.error("Erro no processamento da IA para Potencial de Mercado:", error);
      res.status(500).json({
        error: error.message || "Erro desconhecido ao processar dados de mercado.",
      });
    }
  });

  // Handle Vite Dev Server or Production Static Files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
