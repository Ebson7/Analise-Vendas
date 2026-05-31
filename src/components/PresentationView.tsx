import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Sparkles,
  MapPin,
  Building2,
  Target,
  Activity,
  Gauge,
  Compass,
  Briefcase,
  CheckCircle2,
  FileText,
  Eye,
  TrendingUp,
  Award
} from "lucide-react";
import { SellerRecord } from "../types";

interface PresentationViewProps {
  seller: SellerRecord;
  onClose: () => void;
  completedSteps: Record<string, boolean>;
}

export default function PresentationView({
  seller,
  onClose,
  completedSteps
}: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "scroll">("slides");
  const [showPdfTip, setShowPdfTip] = useState(true);

  const analysis = seller.analysis ? {
    ...seller.analysis,
    estimatedTotalMarketSize: Math.round(seller.analysis.estimatedPopulation / 300) || 1
  } : null;

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-white/5 bg-white/5 rounded-2xl p-12 text-center">
        <Sparkles className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <h4 className="text-white font-extrabold text-lg">Nenhuma análise disponível</h4>
        <p className="text-slate-400 text-xs mt-1 max-w-sm">
          Apenas territórios com análise demográfica processável podem ser apresentados.
        </p>
        <button
          onClick={onClose}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/5 text-xs font-bold text-white hover:bg-white/15"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
      </div>
    );
  }

  const SLIDES_COUNT = 3;

  const handlePrint = () => {
    window.print();
  };

  const getPenetrationRate = (current: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Number(((current / total) * 100).toFixed(1));
  };

  const penetrationRate = getPenetrationRate(seller.currentClients, analysis.estimatedTotalMarketSize);
  const remainingMarket = Math.max(0, analysis.estimatedTotalMarketSize - seller.currentClients);

  // Score colors
  const getScoreColorHex = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 50) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  const getDifficultyBg = (diff: string) => {
    const dLower = diff.toLowerCase();
    if (dLower.includes("baixo") || dLower.includes("baixa")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-200";
    }
    if (dLower.includes("méd") || dLower.includes("medio") || dLower.includes("médio") || dLower.includes("media")) {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20 print:bg-amber-50 print:text-amber-800 print:border-amber-200";
    }
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20 print:bg-rose-50 print:text-rose-800 print:border-rose-200";
  };

  return (
    <div className="print-presentation-view relative min-h-screen bg-[#07080f] text-slate-200 p-4 md:p-6 font-sans">
      {/* Dynamic Style Sheet Injected Specifically for Optimized High-Fidelity PDF Prints */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0; /* Let print CSS handle exact full slide paging */
          }
          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Keep React root container visible on print */
          #root {
            display: block !important;
            width: 100% !important;
            height: auto !important;
          }
          /* Hide non-root elements that might be appended directly to body */
          body > :not(#root) {
            display: none !important;
          }
          .print-presentation-view {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          .print-slide-card {
            page-break-after: always !important;
            break-after: page !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            min-height: 210mm !important;
            height: 210mm !important;
            width: 297mm !important;
            padding: 18mm 24mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-shadow: none !important;
            border: none !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          /* Fix text-transparent visibility bug from bg-clip-text during print */
          .print-slide-card .bg-clip-text {
            background-clip: unset !important;
            -webkit-background-clip: unset !important;
            background-image: none !important;
            color: #0f172a !important;
            -webkit-text-fill-color: #0f172a !important;
          }
          .print-hide {
            display: none !important;
          }
          .print-bg-card {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
          .print-text-muted {
            color: #475569 !important;
          }
          .print-border-subtle {
            border-bottom: 2px solid #e2e8f0 !important;
          }
          .print-progress-bg {
            background-color: #e2e8f0 !important;
          }
        }
      `}</style>

      {/* Control Panel (Hidden on Printing) */}
      <div className="print-hide max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 bg-[#0d0e14]/90 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
            title="Voltar ao Painel"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              Módulo de Apresentação Comercial
            </div>
            <h2 className="text-base font-bold text-white">Report Comercial: {seller.sellerName}{seller.phone && ` (${seller.phone})`}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selector */}
          <div className="flex bg-black/40 border border-white/5 rounded-xl p-0.5 font-mono text-xs">
            <button
              onClick={() => {
                setViewMode("slides");
                setCurrentSlide(0);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "slides"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="h-3 w-3" /> Slides
            </button>
            <button
              onClick={() => setViewMode("scroll")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "scroll"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3 w-3" /> Visão Geral (Print Preview)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 py-2.5 transition cursor-pointer active:scale-95"
          >
            <Printer className="h-4.5 w-4.5" />
            Exportar para PDF
          </button>

          <button
            onClick={onClose}
            className="p-2 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition border border-white/10"
            title="Fechar Apresentação"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF Export Guidance Banner (Hidden on print) */}
      {showPdfTip && (
        <div className="print-hide max-w-6xl mx-auto mb-6 flex items-center justify-between gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-slate-350">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-400 shrink-0" />
            <span>
              <strong>Dica de PDF:</strong> No menu de impressão do navegador, mude o destino para <strong>"Salvar como PDF"</strong> e lembre-se de ativar <strong>"Gráficos de segundo plano"</strong> para preservar o design premium original.
            </span>
          </div>
          <button
            onClick={() => setShowPdfTip(false)}
            className="p-1 cursor-pointer text-slate-400 hover:text-white rounded-lg transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Screen Slide Navigation Dots (Hidden on Print & Scroll View) */}
      {viewMode === "slides" && (
        <div className="print-hide max-w-6xl mx-auto mb-6 flex items-center justify-between bg-white/5 border border-white/5 rounded-xl py-2 px-5 text-xs text-slate-400">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 disabled:opacity-30 enabled:hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>

          <div className="flex gap-2">
            {Array.from({ length: SLIDES_COUNT }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "bg-blue-500 w-6" : "bg-white/20 hover:bg-white/40"
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            disabled={currentSlide === SLIDES_COUNT - 1}
            onClick={() => setCurrentSlide((p) => Math.min(SLIDES_COUNT - 1, p + 1))}
            className="flex items-center gap-1 disabled:opacity-30 enabled:hover:text-white transition cursor-pointer"
          >
            Próximo <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Presentation Deck container */}
      <div className="max-w-6xl mx-auto flex flex-col gap-8 md:gap-12 pb-16">
        {Array.from({ length: viewMode === "slides" ? 1 : SLIDES_COUNT }).map((_, viewIdx) => {
          const slideId = viewMode === "slides" ? currentSlide : viewIdx;

          return (
            <div
              key={slideId}
              className="print-slide-card relative w-full aspect-[16/10] max-md:aspect-auto max-md:min-h-[585px] md:h-[620px] rounded-3xl border border-white/10 bg-[#090a12] p-5 sm:p-8 md:p-12 shadow-2xl flex flex-col justify-between transition-all duration-300 overflow-auto sm:overflow-hidden"
              id={`slide-${slideId}`}
            >
              {/* Slide Background Subtle Grid Glowing Accents (Decor) */}
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none print:hidden"></div>
              <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none print:hidden"></div>

              {/* Slide Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4 print-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white print:hidden">
                    <Compass className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 font-mono print:text-blue-700">
                      Análise de Inteligência Demográfica
                    </span>
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 leading-tight tracking-wider print:text-slate-600 font-mono">
                      {seller.city} &bull; {seller.segment}
                    </h5>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-300 print:text-slate-800 font-mono">
                    Slide 0{slideId + 1}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">EXEC REPORT</span>
                </div>
              </div>

              {/* Slide Content */}
              <div className="relative z-10 my-auto py-6 flex-1 flex flex-col justify-center">
                {/* SLIDE 01: CAPA COMERCIAL (COVER) */}
                {slideId === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                    <div className="md:col-span-8 flex flex-col gap-4">
                      <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full font-mono text-[10px] tracking-widest text-blue-450 font-bold print:bg-blue-50 print:text-blue-800 print:border-blue-200">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-400 print:text-blue-700" /> APRESENTAÇÃO ESTRATÉGICA
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight print:text-slate-900 print:bg-none">
                        Plano de Expansão e <br />
                        <span className="text-blue-400 print:text-blue-700">Potencial Demográfico</span>
                      </h1>
                      <p className="text-slate-405 text-sm max-w-xl leading-relaxed font-light print:text-slate-650">
                        Um mapeamento analítico completo do mercado de atuação de <strong className="text-white font-semibold print:text-slate-800">{seller.sellerName}</strong>{seller.phone && ` (${seller.phone})`} na municipalidade de <strong className="text-white font-semibold print:text-slate-800">{seller.city}</strong>.
                      </p>
                    </div>

                    <div className="md:col-span-4 rounded-2xl border border-white/5 bg-white/5 p-6 print-bg-card flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Indicadores Principais</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block font-mono">Score Viabilidade</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span
                            className="text-4xl font-extrabold font-mono"
                            style={{ color: getScoreColorHex(analysis.expansionScore) }}
                          >
                            {analysis.expansionScore}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/100</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-black/25 rounded-xl p-3 border border-white/5 print:bg-white print:border-slate-200">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">Dificuldade</span>
                          <span className="text-xs font-bold text-slate-300 print:text-slate-900 uppercase">
                            {analysis.expansionDifficulty}
                          </span>
                        </div>
                        <div className="bg-black/25 rounded-xl p-3 border border-white/5 print:bg-white print:border-slate-200">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">Clientes Ativos</span>
                          <span className="text-xs font-bold text-blue-400 print:text-blue-700 font-mono">
                            {seller.currentClients} ativos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 02: PANORAMA DEMOGRÁFICO */}
                {slideId === 1 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400 print:text-blue-700" />
                      <h2 className="text-lg md:text-xl font-extrabold text-white print:text-slate-900">
                        Raio-X Socioeconômico & Demografia Real
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Metric widgets */}
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4.5 print-bg-card">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          População Residente
                        </span>
                        <h4 className="text-2xl font-black font-mono text-white mt-1.5 print:text-slate-950">
                          {analysis.estimatedPopulation.toLocaleString("pt-BR")}
                        </h4>
                        <span className="text-[10px] text-slate-500 mt-1 block">habitantes projetados</span>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4.5 print-bg-card">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Poder de Compra & PIB
                        </span>
                        <p className="text-xs font-semibold text-slate-250 mt-2 leading-snug print:text-slate-800">
                          {analysis.gdpPerCapita}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4.5 print-bg-card">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Ritmo de Crescimento
                        </span>
                        <h4 className="text-lg font-bold text-indigo-400 font-mono mt-2 uppercase print:text-indigo-800">
                          {analysis.growthRateEstimate}
                        </h4>
                        <span className="text-[10px] text-slate-500 mt-1 block">ritmo corporativo local</span>
                      </div>
                    </div>

                    {/* Sectors and outlook block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 print-bg-card">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-2.5">
                          Estrutura Econômica Municipal
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.mainSectors.map((sector, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-450 rounded-full print:bg-slate-100 print:text-slate-800 print:border-slate-300"
                            >
                              {sector}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 print-bg-card">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          Diagnóstico Demográfico IA
                        </span>
                        <p className="text-[11px] leading-relaxed italic text-slate-300 print:text-slate-705">
                          &ldquo; {analysis.demographicInsight} &rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 03: DIMENSIONAMENTO COMERCIAL (TAM) */}
                {slideId === 2 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-cyan-400 print:text-cyan-700" />
                      <h2 className="text-lg md:text-xl font-extrabold text-white print:text-slate-900">
                        Dimensionamento do Mercado Potencial (TAM)
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-5 flex flex-col gap-4">
                        <div className="rounded-xl border border-white/5 bg-black/30 p-4.5 print-bg-card">
                          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">
                            Pontos de Venda Potenciais (População / 300)
                          </span>
                          <h3 className="text-3xl font-black font-mono text-cyan-400 print:text-cyan-800 leading-tight">
                            {analysis.estimatedTotalMarketSize} PDVs
                          </h3>
                          <span className="text-[10px] text-slate-500 mt-1 block leading-normal">
                            quantidade total estimada de PDVs potenciais para prospecção regional neste segmento.
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 border border-white/5 rounded-xl p-3 print-bg-card">
                            <span className="text-[9px] text-slate-450 block uppercase font-mono">Abordados</span>
                            <span className="text-sm font-bold text-white print:text-slate-900 font-mono">
                              {seller.currentClients} clientes
                            </span>
                          </div>
                          <div className="bg-white/5 border border-white/5 rounded-xl p-3 print-bg-card">
                            <span className="text-[9px] text-slate-450 block uppercase font-mono">Disponíveis</span>
                            <span className="text-sm font-bold text-emerald-400 print:text-emerald-800 font-mono">
                              {remainingMarket} contatos
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vector circular comparison and penetration graph (No Recharts lag) */}
                      <div className="md:col-span-7 rounded-2xl border border-white/5 bg-white/5 p-6 print-bg-card flex flex-col gap-4.5">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">
                            Percentual de Cobertura Atendido
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            Representação do marketshare conquistado até o momento
                          </span>
                        </div>

                        {/* Beautiful custom vector progress chart with precise prints */}
                        <div className="relative">
                          {/* Progress bar scale */}
                          <div className="h-5 w-full bg-white/10 rounded-full overflow-hidden print-progress-bg relative">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 print:bg-blue-600 print:bg-none"
                              style={{ width: `${Math.min(100, Math.max(1, penetrationRate))}%` }}
                            />
                            <span className="absolute inset-y-0 right-4 flex items-center text-[10px] font-mono font-extrabold text-white print:text-slate-900">
                              {penetrationRate}% ATENDIDO
                            </span>
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-450 mt-1.5">
                            <span>0% (Início)</span>
                            <span>{seller.currentClients} de {analysis.estimatedTotalMarketSize} clientes</span>
                            <span>100% (Potencial Total)</span>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-slate-400 print-border-subtle print-text-muted">
                          <span>Status da Ocupação:</span>
                          <span className="font-semibold text-slate-200 print:text-slate-900">
                            {penetrationRate < 10
                              ? "Fase Inicial — Amplo espaço livre para crescimento comercial"
                              : penetrationRate < 35
                              ? "Consolidação Média — Espaço propício para otimização estratégica"
                              : "Alta Ocupação — Foco em blindagem e serviços complementares"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4 text-[9px] text-slate-500 print-border-subtle print-text-muted font-mono">
                <span>INTELIGÊNCIA REGIONAL COMERCIAL &copy; 2026</span>
                <span className="font-semibold uppercase tracking-widest text-[#22d3ee] print:text-blue-700">
                  Slide {slideId + 1} de {SLIDES_COUNT}
                </span>
                <span>DATA EMISSÃO: {new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
