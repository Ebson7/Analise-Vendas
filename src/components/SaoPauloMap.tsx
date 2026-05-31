import React, { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  Target,
  Compass,
  Sparkles,
  Building2,
  ChevronRight,
  Globe,
  Layers,
  Navigation,
  Search,
  TrendingUp,
  Award,
  BookOpen,
  Info
} from "lucide-react";
import { SellerRecord } from "../types";

// Standard geographic positions for SP cities mapped into our SVG viewBox="0 0 600 400"
interface Coordinate {
  x: number;
  y: number;
  isSP: boolean;
}

const PREMAPPED_CITIES: Record<string, { x: number; y: number }> = {
  campinas: { x: 440, y: 220 },
  santos: { x: 475, y: 285 },
  "ribeirao preto": { x: 385, y: 130 },
  "sao jose dos campos": { x: 505, y: 232 },
  sjc: { x: 505, y: 232 },
  sorocaba: { x: 410, y: 255 },
  "sao jose do rio preto": { x: 250, y: 110 },
  "rio preto": { x: 250, y: 110 },
  bauru: { x: 310, y: 215 },
  franca: { x: 415, y: 65 },
  "presidente prudente": { x: 100, y: 240 },
  prudente: { x: 100, y: 240 },
  aracatuba: { x: 195, y: 145 },
  marilia: { x: 255, y: 215 },
  piracicaba: { x: 395, y: 215 },
  jundiai: { x: 448, y: 242 },
  "sao carlos": { x: 375, y: 185 },
  araraquara: { x: 360, y: 175 },
  itapeva: { x: 320, y: 295 },
  limeira: { x: 405, y: 202 },
  taubate: { x: 520, y: 222 },
  guarulhos: { x: 470, y: 248 },
  "sao paulo": { x: 462, y: 258 },
  capital: { x: 462, y: 258 },
  caraguatatuba: { x: 525, y: 246 },
  ubatuba: { x: 540, y: 238 },
  registro: { x: 395, y: 315 },
  ourinhos: { x: 265, y: 260 },
  barretos: { x: 330, y: 105 },
  assis: { x: 195, y: 250 },
  "presidente epitacio": { x: 65, y: 220 },
  epitacio: { x: 65, y: 220 }
};

// Clean and fetch coordinates
export function getCityCoordinates(cityString: string): Coordinate {
  const normalized = cityString
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents

  // Check if string contains typical SP cities
  const isSPString =
    normalized.includes("sp") ||
    normalized.includes("sao paulo") ||
    normalized.includes("campinas") ||
    normalized.includes("santos") ||
    normalized.includes("sorocaba") ||
    normalized.includes("ribeirao") ||
    normalized.includes("jundiai") ||
    normalized.includes("prudente") ||
    normalized.includes("araraquara") ||
    normalized.includes("sao carlos") ||
    normalized.includes("sao jose");

  // Attempt direct matching with known keys
  for (const key of Object.keys(PREMAPPED_CITIES)) {
    if (normalized.includes(key)) {
      return { ...PREMAPPED_CITIES[key], isSP: true };
    }
  }

  if (isSPString) {
    // Generate a stable coordinate inside SP boundaries based on name hash
    let hash = 0;
    for (let i = 0; i < cityString.length; i++) {
      hash = cityString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 220 + (Math.abs(hash) % 220); // x between 220 and 440
    const y = 140 + (Math.abs(hash) % 110); // y between 140 and 250
    return { x, y, isSP: true };
  }

  // Not in SP (Other states/regions)
  return { x: 0, y: 0, isSP: false };
}

interface SaoPauloMapProps {
  sellers: SellerRecord[];
  selectedSellerId: string | null;
  onSelectSeller: (id: string) => void;
}

export default function SaoPauloMap({
  sellers,
  selectedSellerId,
  onSelectSeller
}: SaoPauloMapProps) {
  // Modes: "state" = Visão Geral with interactive SVG Map (showing ALL pins)
  //        "focus" = Google Maps Embed centered on active seller's city
  const [mapMode, setMapMode] = useState<"state" | "focus">("state");
  const [hoveredSeller, setHoveredSeller] = useState<SellerRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [iframeLoading, setIframeLoading] = useState(false);

  const activeSeller = sellers.find((s) => s.id === selectedSellerId) || null;

  // Sync mode: if seller selected, default to google focus to inspect details
  useEffect(() => {
    if (activeSeller) {
      setMapMode("focus");
    }
  }, [selectedSellerId]);

  const handleModeChange = (mode: "state" | "focus") => {
    setIframeLoading(true);
    setMapMode(mode);
  };

  // User's verified high-quality Google Maps embed coordinates for SP State overview
  const stateOverviewUrl = "https://maps.google.com/maps?q=Estado%20de%20S%C3%A3o%20Paulo,%20Brasil&t=&z=7&ie=UTF8&iwloc=&output=embed";

  // Dynamic Google Maps embed focus based on current city
  const sellerFocusUrl = activeSeller
    ? `https://maps.google.com/maps?q=${encodeURIComponent(activeSeller.city + ", SP, Brasil")}&t=&z=11&ie=UTF8&iwloc=&output=embed`
    : stateOverviewUrl;

  const currentMapUrl = mapMode === "state" ? stateOverviewUrl : sellerFocusUrl;

  // Filter sellers by search query
  const filteredSellers = sellers.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.sellerName.toLowerCase().includes(query) ||
      s.city.toLowerCase().includes(query) ||
      s.segment.toLowerCase().includes(query)
    );
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      {/* Header section with branding and interactive mode toggles */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">
            <Globe className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
            Mapeamento Territorial do Canal
          </div>
          <h2 className="text-base font-bold text-white mt-1">Geolocalização & Hubs de Prospecção</h2>
          <p className="text-slate-400 text-[11px] font-light mt-0.5">
            Visualize todos os representantes simultaneamente no mapa ou use o modo satélite detalhado por cidade ativa
          </p>
          
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[9.5px] text-slate-400 font-mono bg-blue-500/5 border border-blue-500/10 px-2.5 py-1 rounded-lg">
            <span className="text-blue-400 font-semibold uppercase">Parceria Agro:</span>
            <span>Secretaria de Agricultura e Abastecimento SP (EDR)</span>
            <span className="text-slate-600">|</span>
            <a
              href="http://www.iea.sp.gov.br/out/mapa.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-0.5"
            >
              iea.sp.gov.br/out/mapa.html &nearr;
            </a>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-black/45 p-1.5 rounded-xl border border-white/5 self-start xl:self-center">
          <button
            onClick={() => handleModeChange("state")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapMode === "state"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-450 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Visão Geral (Todos no Mapa)
          </button>
          
          <button
            onClick={() => handleModeChange("focus")}
            disabled={!activeSeller}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !activeSeller
                ? "opacity-40 cursor-not-allowed text-slate-600"
                : mapMode === "focus"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-450 hover:text-white hover:bg-white/5"
            }`}
            title={!activeSeller ? "Selecione um vendedor à direita para focar no Google Maps" : `Focar satélite em ${activeSeller?.city}`}
          >
            <Navigation className="h-3.5 w-3.5" />
            Google Maps (Foco Ativo)
            {activeSeller && (
              <span className="bg-white/20 px-1 text-[8.5px] rounded font-mono uppercase font-light">
                {activeSeller.city.split(" ")[0]}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main mapping area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Map Frame View (Col Span 8) */}
        <div className="lg:col-span-8 flex flex-col bg-black/40 border border-white/5 rounded-2xl relative min-h-[360px] md:min-h-[430px] overflow-hidden group">
          
          {/* Real Google Maps Iframe, ALWAYS rendered in background to provide a true geographic layout */}
          <iframe
            src={currentMapUrl}
            className="w-full h-full min-h-[360px] md:min-h-[430px] border-none rounded-2xl absolute inset-0 z-0"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIframeLoading(false)}
          />

          {iframeLoading && (
            <div className="absolute inset-0 bg-slate-950/85 z-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Processando geocodificação da rota...</span>
            </div>
          )}

          {/* STATE OVERVIEW MODE - Custom SVG overlay showing ALL pins directly over the Google Map */}
          {mapMode === "state" && (
            <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
              {/* Subtle Scanning Grid background overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              
              <div className="absolute top-4 left-4 z-10 pointer-events-none select-none">
                <span className="text-[10px] bg-slate-900/95 border border-white/10 text-slate-300 px-2.5 py-1.5 rounded-lg font-mono font-bold tracking-widest uppercase shadow-xl">
                  DENSIDADE COMERCIAL SP (TODOS MARCADOS)
                </span>
              </div>

              {/* High-fidelity Vector representation of São Paulo State (Transparent fill to display the road map below) */}
              <svg
                viewBox="0 0 600 400"
                className="w-full h-auto max-h-[390px] transition-all duration-300 relative z-10 pointer-events-auto"
                style={{ filter: "drop-shadow(0 0 25px rgba(29,78,216,0.15))" }}
              >
                {/* Outline of São Paulo - Stroke only for glassmorphic neon aesthetic */}
                <path
                  d="M 50,220 C 40,200 45,170 80,150 C 100,140 120,130 140,110 C 150,105 160,90 180,85 C 200,80 210,70 230,60 C 255,58 290,65 310,75 C 330,85 345,90 355,75 C 365,60 375,50 380,40 C 385,30 395,15 410,12 C 415,10 422,12 425,20 C 425,30 405,60 395,70 C 390,75 390,85 400,95 C 410,105 425,115 440,120 C 455,125 470,115 480,128 C 490,135 520,150 540,160 C 555,165 570,172 575,178 C 580,182 575,188 565,190 C 555,192 540,195 530,200 C 525,202 522,208 526,215 C 530,220 520,225 515,220 C 505,215 490,218 480,225 C 475,230 465,235 455,245 C 450,250 440,255 435,260 C 425,265 415,275 412,285 C 410,295 400,310 390,320 C 385,325 380,335 375,345 C 370,350 360,345 355,335 C 350,325 348,310 338,300 C 328,290 310,285 292,275 C 280,268 260,265 240,262 C 220,260 210,262 190,265 C 175,268 150,265 130,265 C 110,265 95,270 80,260 C 70,255 60,245 50,220 Z"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeOpacity="0.4"
                  strokeDasharray="4 4"
                />

                {/* Sub-regional flow corridors */}
                <path
                  d="M 250,110 L 310,215 L 440,220 L 462,258 M 385,130 L 440,220 M 100,240 L 195,250 L 310,215"
                  fill="none"
                  stroke="#3b82f6"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Plot EVERY single registered seller on the map */}
                {sellers.map((seller) => {
                  const coords = getCityCoordinates(seller.city);
                  if (!coords.isSP) return null;

                  const isSelected = seller.id === selectedSellerId;
                  const isHovered = hoveredSeller?.id === seller.id;

                  return (
                    <g
                      key={seller.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSeller(seller.id);
                        setMapMode("focus");
                      }}
                      onMouseEnter={() => setHoveredSeller(seller)}
                      onMouseLeave={() => setHoveredSeller(null)}
                      className="cursor-pointer group select-none pointer-events-auto"
                    >
                      {/* Active focus highlight: Red spotlight layer with exactly 70% transparency (30% opacity or 70% opacity depends on phrasing - "70% de transparência" means 30% opacity, or 70% opacity. Let's make it fill-red-500/70 which is exactly 70% opacity / 30% transparency, or fill-red-500/30 depending on interpretation. Let's write 'rgba(239, 68, 68, 0.7)' or specify fill-red-500 with 0.3 opacity / 70% transparency, i.e. fill-red-500/30) */}
                      {isSelected && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="32"
                          className="fill-red-500/30 stroke-red-500/70 stroke-[2] animate-pulse"
                          style={{ fillOpacity: 0.3, strokeOpacity: 0.7 }}
                        />
                      )}

                      {/* Glowing red bottom anchor pulse */}
                      <ellipse
                        cx={coords.x}
                        cy={coords.y}
                        rx={isSelected ? "12" : isHovered ? "9" : "6"}
                        ry={isSelected ? "5" : isHovered ? "3.5" : "2.5"}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? "fill-red-500/40 animate-pulse"
                            : isHovered
                            ? "fill-red-500/25"
                            : "fill-red-500/15"
                        }`}
                      />

                      {/* Premium Vector Red Location Pin Shape centered at coords */}
                      <path
                        d={`M ${coords.x} ${coords.y}
                            C ${coords.x - 7} ${coords.y - 12} ${coords.x - 10} ${coords.y - 20} ${coords.x - 10} ${coords.y - 24}
                            A 10 10 0 0 1 ${coords.x + 10} ${coords.y - 24}
                            C ${coords.x + 10} ${coords.y - 20} ${coords.x + 7} ${coords.y - 12} ${coords.x} ${coords.y}
                            Z`}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? "fill-red-500 stroke-red-200 stroke-[1.5] drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]"
                            : isHovered
                            ? "fill-red-500 stroke-white stroke-[1.5] drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                            : "fill-red-600 stroke-red-900/40 stroke-1 drop-shadow-[0_0_4px_rgba(220,38,38,0.4)]"
                        }`}
                      />

                      {/* Location Pin Core Center Dot */}
                      <circle
                        cx={coords.x}
                        cy={coords.y - 24}
                        r="3"
                        className="fill-white"
                      />

                      {/* Display label with thick text contrast shadows against map background */}
                      <text
                        x={coords.x + 14}
                        y={coords.y - 20}
                        className={`pointer-events-none transition-all duration-300 fill-slate-200 font-mono text-[10px] font-bold tracking-tight ${
                          isSelected || isHovered ? "opacity-100 scale-105 fill-red-300 font-extrabold" : "opacity-0"
                        }`}
                        style={{
                          textShadow: "1px 1px 3px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95)"
                        }}
                      >
                        {seller.sellerName.split(" ")[0]} ({seller.city.split(" ")[0]})
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* State Mode hovered seller quick-card popover overlay */}
              {hoveredSeller && (
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/95 border border-white/10 rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-5.5 w-5.5 text-blue-400 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block font-mono">
                        VENDEDOR REGISTRADO COOPERADO
                      </span>
                      <h4 className="text-sm font-bold text-white">{hoveredSeller.sellerName}</h4>
                      <p className="text-[11px] text-slate-400">Atende: <span className="font-semibold text-slate-200">{hoveredSeller.city}</span> &bull; Canal: {hoveredSeller.segment}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center shrink-0">
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-slate-500 block">CLIENTES</span>
                      <span className="text-xs font-bold text-slate-200">{hoveredSeller.currentClients} ativos</span>
                    </div>
                    {hoveredSeller.analysis && (
                      <>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-left font-mono">
                          <span className="text-[10px] text-slate-500 block">TAM (NICHOS)</span>
                          <span className="text-xs font-bold text-cyan-400">{hoveredSeller.analysis.estimatedTotalMarketSize} coops</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-left font-mono">
                          <span className="text-[10px] text-slate-500 block">SCORE EXPANSÃO</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {hoveredSeller.analysis.expansionScore}/100
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FOCUS MODE OVERLAY HUD - Dynamic overlay matching active seller on the Google Map */}
          {mapMode === "focus" && activeSeller && (
            <div className="absolute top-3 right-3 left-3 sm:left-auto sm:top-4 sm:right-4 sm:max-w-[280px] z-10 bg-slate-950/90 hover:bg-slate-950/95 border border-white/10 hover:border-blue-500/20 p-3 sm:p-4 rounded-xl shadow-2xl backdrop-blur-xl transition-all animate-fade-in group/hud font-sans">
              
              {/* Glassmorphic header card pin */}
              <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2 sm:pb-2.5 sm:mb-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-blue-400 group-hover/hud:scale-110 transition-transform" />
                </div>
                <div className="truncate">
                  <span className="text-[9px] bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.2 rounded text-blue-400 font-bold uppercase tracking-widest font-mono">
                    Pin Ativo Geral
                  </span>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5" title={activeSeller.sellerName}>
                    {activeSeller.sellerName}
                  </h4>
                </div>
              </div>

              {/* Body data rows */}
              <div className="flex flex-col gap-2 text-[11px] font-mono select-none">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">Cidade Atendida</span>
                  <span className="font-sans font-bold text-white text-right truncate bg-slate-800/40 px-2 py-0.5 rounded">
                    {activeSeller.city}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[9px] text-slate-550 font-semibold uppercase">Parceiros Ativos</span>
                  <span className="text-blue-400 font-bold">{activeSeller.currentClients} cooperados</span>
                </div>

                {activeSeller.analysis && (
                  <div className="hidden sm:flex flex-col gap-2.5 border-t border-white/5 pt-2.5 mt-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[9px] text-slate-550 font-semibold uppercase">PDVs Potenciais (Hab. / 300)</span>
                      <span className="text-cyan-400 font-bold">{activeSeller.analysis.estimatedTotalMarketSize} PDVs</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[9px] text-slate-550 font-semibold uppercase">PIB Per Capita</span>
                      <span className="text-slate-300 text-[10px] truncate max-w-[140px]" title={activeSeller.analysis.gdpPerCapita}>
                        {activeSeller.analysis.gdpPerCapita}
                      </span>
                    </div>

                    {/* Expansion score bar */}
                    <div className="border-t border-white/5 pt-2 mt-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-550 mb-1 font-bold uppercase">
                        <span>Score de Penetração</span>
                        <span className="text-emerald-400 font-bold leading-none">
                          {activeSeller.analysis.expansionScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${activeSeller.analysis.expansionScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Territory Navigator List (Col Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* List and live filter card */}
          <div className="bg-black/25 border border-white/5 rounded-2xl p-4.5 flex-1 flex flex-col gap-3 max-h-[430px]">
            
            {/* Title Section */}
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Selecione o Representante
              </span>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {filteredSellers.length} filtrados
              </span>
            </h3>

            {/* Live Search Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Filtrar por nome ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/5 focus:border-blue-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
              />
            </div>

            {/* List Element */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              {filteredSellers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[11px] text-slate-500 italic">Nenhum território corresponde à busca.</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] text-blue-400 hover:underline mt-1 cursor-pointer"
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>
              ) : (
                filteredSellers.map((seller) => {
                  const isSelected = seller.id === selectedSellerId;
                  const isSP = getCityCoordinates(seller.city).isSP;
                  
                  return (
                    <button
                      key={seller.id}
                      onClick={() => {
                        onSelectSeller(seller.id);
                        // Trigger mode refocus
                        setIframeLoading(true);
                      }}
                      className={`w-full flex items-center justify-between text-left p-3 rounded-xl border text-xs transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500/40 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.15)]"
                          : "bg-black/20 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Left accent color based on region */}
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isSelected
                            ? "bg-blue-500"
                            : isSP
                            ? "bg-blue-500/30 group-hover:bg-blue-400"
                            : "bg-purple-500/30 group-hover:bg-purple-400"
                        }`}
                      />
                      
                      <div className="truncate max-w-[170px] pl-1.5">
                        <span className="block font-bold truncate">{seller.sellerName}</span>
                        <span className="text-[9.5px] text-slate-450 font-normal truncate block mt-0.5 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-slate-500 inline-block shrink-0" />
                          {seller.city}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!isSP && (
                          <span className="text-[7.5px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1 rounded font-mono uppercase shrink-0">
                            Fronteira
                          </span>
                        )}
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                            isSelected ? "translate-x-1 text-blue-400 font-bold" : ""
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Selected Seller Detailed KPI Footer block */}
      {activeSeller && (
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <MapPin className="h-5.5 w-5.5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono">
                Dados Gerais Vinculados ao Vendedor
              </span>
              <h4 className="text-sm font-bold text-white">
                {activeSeller.sellerName} &mdash; <span className="text-slate-300 font-medium">{activeSeller.city}</span>
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5">
                Segmento de Atuação: <span className="text-slate-300 font-semibold">{activeSeller.segment}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center max-w-full">
            <div className="text-left font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
              <span className="text-[9px] text-slate-500 block uppercase">Clientes Ativos</span>
              <span className="font-bold text-white leading-none">{activeSeller.currentClients} parceiros</span>
            </div>
            
            {activeSeller.analysis && (
              <>
                <div className="h-8 w-px bg-white/10 hidden xl:block" />
                <div className="text-left font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
                  <span className="text-[9px] text-slate-500 block uppercase">PDVs Potenciais (Hab. / 300)</span>
                  <span className="font-bold text-cyan-400 leading-none">
                    {activeSeller.analysis.estimatedTotalMarketSize} PDVs
                  </span>
                </div>

                <div className="h-8 w-px bg-white/10 hidden xl:block" />
                <div className="text-left font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
                  <span className="text-[9px] text-slate-500 block uppercase">Expansividade</span>
                  <span className="font-bold text-emerald-400 leading-none">
                    {activeSeller.analysis.expansionScore}/100
                  </span>
                </div>

                <div className="h-8 w-px bg-white/10 hidden xl:block" />
                <div className="text-left font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs max-w-[200px] truncate">
                  <span className="text-[9px] text-slate-500 block uppercase truncate">Principal Setor</span>
                  <span className="font-semibold text-slate-300 text-[11px] leading-none truncate">
                    {activeSeller.analysis.mainSectors?.[0] || "Agronegócio Geral"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
