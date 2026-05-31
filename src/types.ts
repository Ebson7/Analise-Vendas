export interface MarketAnalysis {
  cityName: string;
  estimatedPopulation: number;
  gdpPerCapita: string;
  mainSectors: string[];
  estimatedTotalMarketSize: number; // Potential target clients in this city
  expansionScore: number; // 0 to 100
  expansionDifficulty: "Baixa" | "Média" | "Alta" | string;
  growthRateEstimate: string;
  nicheRecommendations: string[];
  actionPlan: string[];
  demographicInsight: string;
}

export interface SellerRecord {
  id: string;
  sellerName: string;
  phone?: string;
  city: string;
  segment: string;
  currentClients: number;
  createdAt: string;
  analysis?: MarketAnalysis;
}
