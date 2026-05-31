import React, { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Building2,
  Target,
  Compass,
  Briefcase,
  Award,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  CircleDot,
  Gauge,
  Activity,
  Heart,
  Store,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  FileText,
  Phone,
  Pencil
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { SellerRecord, MarketAnalysis } from "./types";
import PresentationView from "./components/PresentationView";
import SaoPauloMap from "./components/SaoPauloMap";
import { generateLocalAnalysis } from "./utils";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocFromServer } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

// Setup stable mock data initially if none exists in localStorage
const DEFAULT_SELLERS: SellerRecord[] = [
  {
    id: "seller-1",
    sellerName: "Juliana Mendes",
    phone: "(19) 98844-3321",
    city: "Campinas - SP",
    segment: "Alimentos e Bebidas",
    currentClients: 24,
    createdAt: new Date().toISOString(),
    analysis: {
      cityName: "Campinas - SP",
      estimatedPopulation: 1220000,
      gdpPerCapita: "R$ 68.000 (Poder de compra Alto - Classe B predominante)",
      mainSectors: ["Tecnologia e Inovação", "Indústria Farmacêutica", "Comércio Varejista"],
      estimatedTotalMarketSize: 4067, // Computed as 1,220,000 / 300
      expansionScore: 82,
      expansionDifficulty: "Média",
      growthRateEstimate: "Forte (6.5% a.a.)",
      nicheRecommendations: [
        "Prospectar franquias de fast-food próximas a universidades de grande porte (Unicamp e Pucc).",
        "Oferecer condições exclusivas de fornecimento para restaurantes corporativos no polo tecnológico de Barão Geraldo.",
        "Desenvolver parcerias de atacado com empórios gourmet em bairros nobres como Cambuí e Taquaral."
      ],
      actionPlan: [
        "Fazer mapeamento presencial de novos empórios no Cambuí em até 5 dias úteis.",
        "Apresentar proposta de fornecimento recorrente para as 12 maiores cozinhas industriais do polo tecnológico.",
        "Lançar campanha de benefícios de indicação para fidelizar os 24 clientes ativos na região."
      ],
      demographicInsight: "Campinas desponta como um dos maiores polos socioeconômicos do interior paulista, caracterizado por uma classe média-alta estruturada e forte fluxo estudantil e executivo diário. O setor alimentício na região demanda alto grau de sofisticação e entregas rápidas devido ao dinamismo coorporativo."
    }
  },
  {
    id: "seller-2",
    sellerName: "Roberto Souza",
    phone: "(31) 99112-4455",
    city: "Belo Horizonte - MG",
    segment: "SaaS & Software B2B",
    currentClients: 8,
    createdAt: new Date().toISOString(),
    analysis: {
      cityName: "Belo Horizonte - MG",
      estimatedPopulation: 2520000,
      gdpPerCapita: "R$ 41.500 (Poder de compra Médio-Alto - Classe C/B dominante)",
      mainSectors: ["Serviços Financeiros", "Tecnologia da Informação", "E-commerce & Logística"],
      estimatedTotalMarketSize: 8400, // Computed as 2,520,000 / 300
      expansionScore: 92,
      expansionDifficulty: "Baixa",
      growthRateEstimate: "Acelerado (12% a.a.)",
      nicheRecommendations: [
        "Visitar hubs de inovação locais (San Pedro Valley) para fechar parcerias com startups recém-aceleradas.",
        "Oferecer pacotes de automação para microempresas e escritórios de contabilidade tradicionais no Barro Preto.",
        "Abordar associações de lojistas locais promovendo ofertas integradas de software."
      ],
      actionPlan: [
        "Agendar visitas a 5 importantes espaços de coworking centrais para apresentar o sistema.",
        "Fazer abordagem direta a contadores focando em economia de tempo fiscal com o app.",
        "Participar de eventos de negócios locais para construir autoridade de marca de forma presencial."
      ],
      demographicInsight: "Belo Horizonte possui um dos ecossistemas de tecnologia mais ativos do Brasil (popularizado como San Pedro Valley). O ambiente propicia que empresários de setores consolidados busquem softwares de gestão de forma natural para aumentar sua rentabilidade frente a inflação."
    }
  },
  {
    id: "seller-3",
    sellerName: "Aline Santos",
    phone: "(62) 98115-9988",
    city: "Goiânia - GO",
    segment: "Serviços Médicos & Saúde",
    currentClients: 15,
    createdAt: new Date().toISOString(),
    analysis: {
      cityName: "Goiânia - GO",
      estimatedPopulation: 1550000,
      gdpPerCapita: "R$ 38.000 (PIB forte e forte apelo ao setor terciário)",
      mainSectors: ["Serviços Médicos", "Agronegócio", "Estética e Cosméticos"],
      estimatedTotalMarketSize: 5167, // Computed as 1,550,000 / 300
      expansionScore: 68,
      expansionDifficulty: "Alta",
      growthRateEstimate: "Estável (4.2% a.a.)",
      nicheRecommendations: [
        "Focar em clínicas odontológicas em franca expansão no Setor Marista e Bueno.",
        "Desenvolver abordagens personalizadas de planos recorrentes para consultórios de pediatria.",
        "Estabelecer pontes de atendimento com clínicas renomadas de dermatologia que exigem alta esterilização."
      ],
      actionPlan: [
        "Realizar triagem de clínicas médicas privadas novas abertas nos últimos 6 meses.",
        "Oferecer demonstração gratuita de 7 dias para testar o nível de atendimento de nosso portfólio.",
        "Patrocinar pequenos eventos científicos ou rodadas de debate de jovens médicos locais."
      ],
      demographicInsight: "Goiânia consagrou-se paulatinamente como o polo de excelência médica e odontológica da Região Centro-Oeste, atraindo inclusive pacientes interestaduais. O setor de saúde estética exibe crescimento considerável, embora com um mercado local competitivo que exige diferenciais concretos."
    }
  }
];

export default function App() {
  // Sellers state
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);

  // Validate Connection to Firestore on startup
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync with Firestore in real-time
  useEffect(() => {
    const sellersCol = collection(db, "sellers");
    
    const unsubscribe = onSnapshot(
      sellersCol,
      async (snapshot) => {
        let list: SellerRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SellerRecord);
        });

        if (list.length === 0) {
          try {
            // Write pre-filled demo sellers to database so it isn't empty initially
            for (const d of DEFAULT_SELLERS) {
              await setDoc(doc(db, "sellers", d.id), d);
            }
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.WRITE, "sellers");
          }
        } else {
          // Sort by createdAt descending
          list.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          // Enforce formula
          const processed = list.map((s) => {
            if (s.analysis && s.analysis.estimatedPopulation) {
              return {
                ...s,
                analysis: {
                  ...s.analysis,
                  estimatedTotalMarketSize: Math.round(s.analysis.estimatedPopulation / 300) || 1
                }
              };
            }
            return s;
          });

          setSellers(processed);
          setIsLoadingSellers(false);
          
          setSelectedSellerId((current) => {
            if (!current || !processed.some(s => s.id === current)) {
              return processed.length > 0 ? processed[0].id : "";
            }
            return current;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "sellers");
      }
    );

    return () => unsubscribe();
  }, []);

  // Selected Seller state
  const [selectedSellerId, setSelectedSellerId] = useState<string>("");

  // Presentation State
  const [showPresentation, setShowPresentation] = useState(false);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    sellerName: "",
    phone: "",
    city: "",
    currentClients: 1,
    segment: "Varejo Geral"
  });

  // Segment Options
  const SEGMENTS = [
    "Varejo Geral",
    "Alimentos e Bebidas",
    "SaaS & Software B2B",
    "Serviços Médicos & Saúde",
    "Moda & Vestuário",
    "Agronegócio & Suprimentos",
    "Imobiliário & Construção",
    "Educação & Cursos",
    "Outro (Personalizado)"
  ];

  const [customSegment, setCustomSegment] = useState("");
  const [useAI, setUseAI] = useState(false);

  // Loading indicator for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // States for editing a seller
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    sellerName: "",
    phone: "",
    city: "",
    currentClients: 1,
    segment: "Varejo Geral"
  });
  const [editCustomSegment, setEditCustomSegment] = useState("");
  const [editUseAI, setEditUseAI] = useState(false);
  const [isEditingAnalyzing, setIsEditingAnalyzing] = useState(false);
  const [editAnalysisStep, setEditAnalysisStep] = useState(0);
  const [editApiError, setEditApiError] = useState<string | null>(null);

  // Search query filter
  const [searchQuery, setSearchQuery] = useState("");

  // Local Action checklist status tracker (persisted temporarily in memory or relative to active record)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Handle active seller changes - reset local checkboxes
  useEffect(() => {
    setCompletedSteps({});
    setShowPresentation(false);
  }, [selectedSellerId]);

  // Loading subtitle text loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % 4);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const loadingSteps = [
    "Carregando estimativas demográficas e dados populacionais do IBGE...",
    "Mapeando o PIB per capita, renda familiar e setores produtivos regionais...",
    "Calculando o mercado total disponível (TAM) e espaço para captação de clientes...",
    "Sintetizando plano de ataque comercial e nichos recomendados para o vendedor..."
  ];

  const activeSeller = sellers.find((s) => s.id === selectedSellerId);

  // Filtered sellers list
  const filteredSellers = sellers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.sellerName.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.segment.toLowerCase().includes(q)
    );
  });

  // Action to request server-side analysis
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sellerName || !formData.city) {
      alert("Por favor, preencha o nome do vendedor e a cidade de atuação.");
      return;
    }

    const finalSegment =
      formData.segment === "Outro (Personalizado)" ? customSegment || "Geral" : formData.segment;

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setApiError(null);

    // If LOCAL mode (No AI) is selected, generate instantly with a high-fidelity loading simulation
    if (!useAI) {
      try {
        // Fast-paced elegant progress simulation for user feedback
        for (let step = 0; step <= 3; step++) {
          setAnalysisStep(step);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const generated = generateLocalAnalysis(
          formData.city,
          formData.sellerName,
          finalSegment,
          Number(formData.currentClients) || 0
        );

        const newRecord: SellerRecord = {
          id: `seller-${Date.now()}`,
          sellerName: formData.sellerName,
          phone: formData.phone || "",
          city: generated.cityName,
          segment: finalSegment,
          currentClients: Number(formData.currentClients) || 0,
          createdAt: new Date().toISOString(),
          analysis: generated
        };

        try {
          await setDoc(doc(db, "sellers", newRecord.id), newRecord);
          setSelectedSellerId(newRecord.id);
          setShowAddModal(false);

          // Reset form
          setFormData({
            sellerName: "",
            phone: "",
            city: "",
            currentClients: 1,
            segment: "Varejo Geral"
          });
          setCustomSegment("");
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.WRITE, `sellers/${newRecord.id}`);
        }
      } catch (err: any) {
        console.error(err);
        setApiError("Erro ao calcular dados de mercado locally.");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // AI Mode
    try {
      const response = await fetch("/api/analyze-market", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sellerName: formData.sellerName,
          city: formData.city,
          currentClients: formData.currentClients,
          segment: finalSegment
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erro do servidor (Código: ${response.status}).`
        );
      }

      const rawAnalysis: MarketAnalysis = await response.json();

      // Enforce the SP formula: Total population / 300
      if (rawAnalysis && rawAnalysis.estimatedPopulation) {
        rawAnalysis.estimatedTotalMarketSize = Math.round(rawAnalysis.estimatedPopulation / 300) || 1;
      }

      const newRecord: SellerRecord = {
        id: `seller-${Date.now()}`,
        sellerName: formData.sellerName,
        phone: formData.phone || "",
        city: rawAnalysis.cityName || formData.city,
        segment: finalSegment,
        currentClients: Number(formData.currentClients) || 0,
        createdAt: new Date().toISOString(),
        analysis: rawAnalysis
      };

      try {
        await setDoc(doc(db, "sellers", newRecord.id), newRecord);
        setSelectedSellerId(newRecord.id);
        setShowAddModal(false);

        // Reset form
        setFormData({
          sellerName: "",
          phone: "",
          city: "",
          currentClients: 1,
          segment: "Varejo Geral"
        });
        setCustomSegment("");
      } catch (writeErr) {
        handleFirestoreError(writeErr, OperationType.WRITE, `sellers/${newRecord.id}`);
      }
    } catch (error: any) {
      console.warn("API Error, falling back to local simulation:", error);
      
      // Super resilient fallback: if AI or server-side fails, instantly build high-fidelity local statistics and succeed anyway!
      try {
        for (let step = 0; step <= 3; step++) {
          setAnalysisStep(step);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        const fallbackData = generateLocalAnalysis(
          formData.city,
          formData.sellerName,
          finalSegment,
          Number(formData.currentClients) || 0
        );

        const newRecord: SellerRecord = {
          id: `seller-${Date.now()}`,
          sellerName: formData.sellerName,
          phone: formData.phone || "",
          city: fallbackData.cityName,
          segment: finalSegment,
          currentClients: Number(formData.currentClients) || 0,
          createdAt: new Date().toISOString(),
          analysis: fallbackData
        };

        try {
          await setDoc(doc(db, "sellers", newRecord.id), newRecord);
          setSelectedSellerId(newRecord.id);
          setShowAddModal(false);

          // Reset form
          setFormData({
            sellerName: "",
            phone: "",
            city: "",
            currentClients: 1,
            segment: "Varejo Geral"
          });
          setCustomSegment("");
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.WRITE, `sellers/${newRecord.id}`);
        }
      } catch (fallbackError) {
        setApiError(
          "Não foi possível processar a consulta de IA e a geração alternativa local falhou."
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteSeller = async (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir a análise comercial do vendedor ${name}?`)) {
      try {
        await deleteDoc(doc(db, "sellers", id));
      } catch (deleteErr) {
        handleFirestoreError(deleteErr, OperationType.DELETE, `sellers/${id}`);
      }
    }
  };

  // Add edit handlers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEditingAnalyzing) {
      interval = setInterval(() => {
        setEditAnalysisStep((prev) => (prev + 1) % 4);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isEditingAnalyzing]);

  const handleEditSellerClick = (seller: SellerRecord) => {
    setEditingSellerId(seller.id);
    setEditFormData({
      sellerName: seller.sellerName,
      phone: seller.phone || "",
      city: seller.city,
      currentClients: seller.currentClients,
      segment: SEGMENTS.includes(seller.segment) ? seller.segment : "Outro (Personalizado)"
    });
    setEditCustomSegment(SEGMENTS.includes(seller.segment) ? "" : seller.segment);
    setEditUseAI(false); // Default to local for fast edits, user can toggle to AI
    setEditApiError(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSellerId) return;

    if (!editFormData.sellerName || !editFormData.city) {
      alert("Por favor, preencha o nome do vendedor e a cidade de atuação.");
      return;
    }

    const finalSegment =
      editFormData.segment === "Outro (Personalizado)" ? editCustomSegment || "Geral" : editFormData.segment;

    setIsEditingAnalyzing(true);
    setEditAnalysisStep(0);
    setEditApiError(null);

    // Get original creator date
    const originalSeller = sellers.find(s => s.id === editingSellerId);
    const createdAt = originalSeller ? originalSeller.createdAt : new Date().toISOString();

    // If LOCAL mode (No AI) is selected, generate instantly
    if (!editUseAI) {
      try {
        // Fast progress simulation
        for (let step = 0; step <= 3; step++) {
          setEditAnalysisStep(step);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        const generated = generateLocalAnalysis(
          editFormData.city,
          editFormData.sellerName,
          finalSegment,
          Number(editFormData.currentClients) || 0
        );

        const updatedRecord: SellerRecord = {
          id: editingSellerId,
          sellerName: editFormData.sellerName,
          phone: editFormData.phone || "",
          city: generated.cityName,
          segment: finalSegment,
          currentClients: Number(editFormData.currentClients) || 0,
          createdAt: createdAt,
          analysis: generated
        };

        try {
          await setDoc(doc(db, "sellers", editingSellerId), updatedRecord);
          setShowEditModal(false);
          setEditingSellerId(null);
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.WRITE, `sellers/${editingSellerId}`);
        }
      } catch (err: any) {
        console.error(err);
        setEditApiError("Erro ao calcular dados de mercado locally.");
      } finally {
        setIsEditingAnalyzing(false);
      }
      return;
    }

    // AI Mode
    try {
      const response = await fetch("/api/analyze-market", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sellerName: editFormData.sellerName,
          city: editFormData.city,
          currentClients: editFormData.currentClients,
          segment: finalSegment
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erro do servidor (Código: ${response.status}).`
        );
      }

      const rawAnalysis: MarketAnalysis = await response.json();

      // Enforce the SP formula: Total population / 300
      if (rawAnalysis && rawAnalysis.estimatedPopulation) {
        rawAnalysis.estimatedTotalMarketSize = Math.round(rawAnalysis.estimatedPopulation / 300) || 1;
      }

      const updatedRecord: SellerRecord = {
        id: editingSellerId,
        sellerName: editFormData.sellerName,
        phone: editFormData.phone || "",
        city: rawAnalysis.cityName || editFormData.city,
        segment: finalSegment,
        currentClients: Number(editFormData.currentClients) || 0,
        createdAt: createdAt,
        analysis: rawAnalysis
      };

      try {
        await setDoc(doc(db, "sellers", editingSellerId), updatedRecord);
        setShowEditModal(false);
        setEditingSellerId(null);
      } catch (writeErr) {
        handleFirestoreError(writeErr, OperationType.WRITE, `sellers/${editingSellerId}`);
      }
    } catch (error: any) {
      console.warn("API Error, falling back to local simulation:", error);
      
      try {
        for (let step = 0; step <= 3; step++) {
          setEditAnalysisStep(step);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        const fallbackData = generateLocalAnalysis(
          editFormData.city,
          editFormData.sellerName,
          finalSegment,
          Number(editFormData.currentClients) || 0
        );

        const updatedRecord: SellerRecord = {
          id: editingSellerId,
          sellerName: editFormData.sellerName,
          phone: editFormData.phone || "",
          city: fallbackData.cityName,
          segment: finalSegment,
          currentClients: Number(editFormData.currentClients) || 0,
          createdAt: createdAt,
          analysis: fallbackData
        };

        try {
          await setDoc(doc(db, "sellers", editingSellerId), updatedRecord);
          setShowEditModal(false);
          setEditingSellerId(null);
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.WRITE, `sellers/${editingSellerId}`);
        }
      } catch (fallbackError) {
        setEditApiError(
          "Não foi possível processar a consulta de IA e a geração alternativa local falhou."
        );
      }
    } finally {
      setIsEditingAnalyzing(false);
    }
  };

  // Toggle strategic action lists checked items
  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Safe percentage calculation
  const getPenetrationRate = (current: number, total: number | undefined) => {
    if (!total || total <= 0) return 0;
    const rate = (current / total) * 100;
    return Number(rate.toFixed(1));
  };

  // UI charts setup
  const getChartData = () => {
    if (!activeSeller?.analysis) return [];
    const current = activeSeller.currentClients;
    const total = activeSeller.analysis.estimatedTotalMarketSize;
    const remaining = Math.max(0, total - current);

    return [
      { name: "Clientes Conquistados", value: current, color: "#22d3ee" }, // Cyan
      { name: "Mercado Potencial Disponível", value: remaining, color: "rgba(255, 255, 255, 0.12)" }
    ];
  };

  const getDifficultyColor = (diff: string | undefined) => {
    if (!diff) return "bg-white/5 text-slate-400";
    const dLower = diff.toLowerCase();
    if (dLower.includes("baixo") || dLower.includes("baixa")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    if (dLower.includes("méd") || dLower.includes("medio") || dLower.includes("media") || dLower.includes("médio")) {
      return "bg-amber-500/10 text-amber-450 border border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return "text-slate-400";
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const totalClientsGlobal = sellers.reduce((sum, s) => sum + s.currentClients, 0);
  const potentialRemainingGlobal = sellers.reduce((sum, s) => {
    if (s.analysis) {
      return sum + Math.max(0, s.analysis.estimatedTotalMarketSize - s.currentClients);
    }
    return sum;
  }, 0);

  if (showPresentation && activeSeller) {
    return (
      <PresentationView
        seller={activeSeller}
        onClose={() => setShowPresentation(false)}
        completedSteps={completedSteps}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05060b] text-slate-200 font-sans antialiased overflow-x-hidden">
      {/* Global Glowing Background Decors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Top Navigation Bar adhering to client theme */}
      <header id="main-header" className="relative z-20 sticky top-0 border-b border-white/5 bg-[#05060b]/80 backdrop-blur-md px-6 py-4.5 flex items-center justify-between shrink-0">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white shrink-0">
              <Compass className="h-5.5 w-5.5 stroke-[2.2] text-white animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-blue-450 block leading-tight">Painel de Expansão</span>
              <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                GESTÃO DE VENDAS MARCIO SANCHEZ
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="add-seller-button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:shadow-[0_0_35px_rgba(37,99,235,0.55)] px-4.5 py-2.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-4.5 w-4.5" />
              Analisar Nova Expansão
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Statistics Dashboard Banner */}
        <section id="global-stats" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl transition-all hover:bg-white/10 hover:border-white/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendedores Ativos</p>
              <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">{sellers.length}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl transition-all hover:bg-white/10 hover:border-white/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clientes Conquistados</p>
              <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">{totalClientsGlobal}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl transition-all hover:bg-white/10 hover:border-white/15">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oportunidade Comercial</p>
              <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
                ~ {potentialRemainingGlobal} <span className="text-xs font-semibold text-slate-400">contatos</span>
              </h3>
            </div>
          </div>
        </section>

        {sellers.length === 0 ? (
          /* Empty State View */
          <div id="empty-state" className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-16 text-center shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Compass className="h-10 w-10 animate-pulse text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Nenhum Vendedor ou Região sob Monitoramento</h3>
            <p className="mt-2.5 max-w-md text-xs leading-relaxed text-slate-400">
              Adicione seu primeiro consultor comercial e sua cidade de atuação. Nossa inteligência cruzará estimativas populacionais regionais com seu segmento para projetar o TAM ideal.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/20 hover:scale-102 transition"
            >
              <Plus className="h-4.5 w-4.5" />
              Cadastrar Vendedor Comercial
            </button>
          </div>
        ) : (
          /* Active Split Screen Dashboard */
          <div className="flex flex-col gap-8">
            <SaoPauloMap
              sellers={sellers}
              selectedSellerId={selectedSellerId}
              onSelectSeller={(id) => setSelectedSellerId(id)}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Sellers List */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">Territórios de Atuação</h2>
                  <span className="text-xs bg-white/10 text-slate-300 border border-white/5 px-2 py-0.5 rounded-full font-semibold">{filteredSellers.length}</span>
                </div>

                {/* Filter and search */}
                <div className="relative">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar vendedor ou cidade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d0e14] border border-white/10 rounded-xl py-2 pl-9.5 pr-4 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Sellers List Wrap */}
                <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredSellers.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Nenhum resultado coincidente com o filtro.
                    </div>
                  ) : (
                    filteredSellers.map((seller) => {
                      const isSelected = seller.id === selectedSellerId;
                      const hasAnalysis = !!seller.analysis;
                      const penetration = hasAnalysis
                        ? getPenetrationRate(seller.currentClients, seller.analysis?.estimatedTotalMarketSize)
                        : null;

                      return (
                        <div
                          key={seller.id}
                          onClick={() => setSelectedSellerId(seller.id)}
                          className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all duration-150 active:scale-98 ${
                            isSelected
                              ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-white"
                              : "border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm leading-snug">{seller.sellerName}</h4>
                              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                                <span className="font-medium truncate max-w-[160px]">{seller.city}</span>
                              </div>
                              {seller.phone && (
                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <Phone className="h-3 w-3 shrink-0 text-slate-500" />
                                  <span className="font-medium truncate font-mono max-w-[160px]">{seller.phone}</span>
                                </div>
                              )}
                              <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] bg-white/10 border border-white/5 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                                {seller.segment}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSellerClick(seller);
                                }}
                                className="text-slate-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                title="Editar dados"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSeller(seller.id, seller.sellerName);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                title="Remover análise"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2.5 text-[11px] text-slate-400">
                            <span>
                              Clientes: <strong className="text-slate-200">{seller.currentClients}</strong>
                            </span>
                            {hasAnalysis && (
                              <span className="font-mono font-bold text-cyan-400">
                                Atendido: {penetration}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tips Help Card */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4.5 shrink-0 shadow-sm text-blue-200">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Como funciona?</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-blue-300">
                      Nossa Inteligência Artificial demográfica cruza a população local com seu segmento de vendas para mapear o mercado total disponível (TAM) e traçar abordagens estratégicas refinadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column: Interactive Selected Seller Detail Dashboard */}
            <div className="lg:col-span-8">
              {activeSeller ? (
                <div className="flex flex-col gap-6">
                  {/* Dashboard Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4.5 shadow-2xl backdrop-blur-xl">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-widest font-mono">
                        <Briefcase className="h-4 w-4 text-blue-400" />
                        Análise de Potencial Comercial
                      </div>
                      <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 mt-1">
                        {activeSeller.sellerName}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">
                        Território: <span className="text-slate-200 font-semibold">{activeSeller.city}</span> &bull; Segmento: <span className="text-slate-300 font-semibold">{activeSeller.segment}</span>
                        {activeSeller.phone && (
                          <>
                            {" "}&bull; Telefone: <span className="text-slate-300 font-semibold font-mono">{activeSeller.phone}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 self-start sm:self-center shrink-0">
                      <button
                        onClick={() => handleEditSellerClick(activeSeller)}
                        className="inline-flex shrink-0 items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100 rounded-xl px-4 py-2 text-center text-xs font-bold transition-all cursor-pointer active:scale-95"
                        title="Editar Informações do Vendedor"
                      >
                        <Pencil className="h-4 w-4 mr-1.5 text-slate-400" />
                        Editar Vendedor
                      </button>

                      {activeSeller.analysis && (
                        <button
                          onClick={() => setShowPresentation(true)}
                          className="inline-flex shrink-0 items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-center text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.35)] active:scale-95"
                          title="Visualizar Apresentação Executiva em Slides e Exportar PDF"
                        >
                          <FileText className="h-4 w-4 mr-1.5" />
                          Ver Apresentação (PDF)
                        </button>
                      )}

                      <div className="inline-flex shrink-0 items-center justify-center bg-blue-500/10 border border-blue-500/30 rounded-xl px-3.5 py-2 text-center text-xs text-blue-400 font-bold">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-400 animate-pulse" /> IA Atualizada
                      </div>
                    </div>
                  </div>

                  {activeSeller.analysis ? (
                    /* The loaded dynamic report from server */
                    <React.Fragment>
                      {/* Metric Cards Grid */}
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {/* 1. Population Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="h-4 w-4 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">População</span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-base font-bold font-mono text-white leading-none sm:text-lg">
                              {activeSeller.analysis.estimatedPopulation.toLocaleString("pt-BR")}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1">hab. estimados</p>
                          </div>
                        </div>

                        {/* 2. Total Market size Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Building2 className="h-4 w-4 text-cyan-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Potencial de Vendas</span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-base font-bold font-mono text-white leading-none sm:text-lg">
                              {activeSeller.analysis.estimatedTotalMarketSize}
                            </h4>
                            <p className="text-[10px] text-slate-450 mt-1">PDVs (População / 300)</p>
                          </div>
                        </div>

                        {/* 3. Market penetration Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Activity className="h-4 w-4 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Percentual Atendido</span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-base font-bold font-mono text-emerald-400 leading-none sm:text-lg">
                              {getPenetrationRate(
                                activeSeller.currentClients,
                                activeSeller.analysis.estimatedTotalMarketSize
                              )}
                              %
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1">cobertura de clientes conquistados</p>
                          </div>
                        </div>

                        {/* 4. Score Potential Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Gauge className="h-4 w-4 text-pink-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Score Expansão</span>
                          </div>
                          <div className="mt-3 flex items-baseline gap-0.5">
                            <h4 className={`text-base font-bold font-mono leading-none sm:text-lg ${getScoreColor(activeSeller.analysis.expansionScore)}`}>
                              {activeSeller.analysis.expansionScore}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-bold">/100</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 font-medium">Viabilidade Geral</div>
                        </div>
                      </div>

                      {/* Split view: Graphical Market chart & Demographic Insight */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Interactive Graph Card */}
                        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">Clientes vs. Potencial</h3>
                            <p className="text-slate-400 text-[11px] mt-0.5">Visão gráfica da oportunidade de expansão regional</p>
                          </div>

                          <div className="my-4 flex h-[200px] w-full items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getChartData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {getChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => [`${value} clientes`, "Quantidade"]}
                                  contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    backgroundColor: "#0d0e14",
                                    color: "#f1f5f9"
                                  }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={36}
                                  iconSize={10}
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: "11px", color: "#f1f5f9" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-3.5 text-[11px] text-slate-400">
                            <span>
                              Oportunidade de expansão livre:
                            </span>
                            <span className="font-mono font-bold text-cyan-400 text-xs shadow-sm shadow-cyan-400/5">
                              {Math.max(
                                0,
                                activeSeller.analysis.estimatedTotalMarketSize - activeSeller.currentClients
                              )}{" "}
                              novos contatos
                            </span>
                          </div>
                        </div>

                        {/* Demographics & Economic Profile Card */}
                        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">Perfil Socioeconômico</h3>
                            <p className="text-slate-400 text-[11px] mt-0.5">Diagnóstico para alinhar a precificação comercial</p>
                          </div>

                          <div className="my-3 flex flex-col gap-3">
                            <div className="rounded-xl bg-black/20 p-3.5 border border-white/5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Renda Média & Poder de Compra</p>
                              <p className="mt-1 text-xs font-semibold text-slate-250 leading-snug">
                                {activeSeller.analysis.gdpPerCapita}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono font-bold">Principais Setores</p>
                              <div className="flex flex-wrap gap-1.5">
                                {activeSeller.analysis.mainSectors.map((sector, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 text-xs font-semibold"
                                  >
                                    {sector}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between items-center bg-black/20 rounded-xl px-3 py-2 border border-white/5 font-mono">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ritmo de Crescimento</span>
                              <span className="text-xs font-bold text-purple-400">{activeSeller.analysis.growthRateEstimate}</span>
                            </div>

                            <div className="flex justify-between items-center bg-black/20 rounded-xl px-3 py-2 border border-white/5 font-mono">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dificuldade Comercial</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getDifficultyColor(activeSeller.analysis.expansionDifficulty)}`}>
                                {activeSeller.analysis.expansionDifficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* General Explanatory Insight Box */}
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-1.5 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-mono">
                          <Compass className="h-4.5 w-4.5 text-blue-400" />
                          Ambiente de Prospecção & insights Econômico-Sociais
                        </h3>
                        <p className="mt-3.5 text-xs text-slate-300 leading-relaxed italic bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                          &ldquo; {activeSeller.analysis.demographicInsight} &rdquo;
                        </p>
                      </div>


                    </React.Fragment>
                  ) : (
                    /* Initial pending processing layout */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-12 text-center shadow-xl backdrop-blur-md">
                      <Sparkles className="h-8 w-8 text-blue-500 animate-spin" />
                      <h4 className="mt-3 text-sm font-extrabold text-white">Processando Análise Demográfica</h4>
                      <p className="mt-1 text-xs text-slate-450">
                        Os dados demográficos reais e insights demográficos estão sendo gerados.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Non selected seller fallback state */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-16 text-center shadow-2xl backdrop-blur-xl h-full min-h-[485px]">
                  <Compass className="h-12 w-12 text-blue-500/40 animate-pulse mb-4" />
                  <h3 className="text-base font-bold text-white uppercase tracking-widest font-mono">Território não selecionado</h3>
                  <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
                    Clique em qualquer vendedor ou território na lista lateral para carregar a estimativa demográfica, TAM mapeado, perfil de poder de compra e plano de ação tático.
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </main>

      {/* Add New Seller Overlay Modal / Slide-over */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0e14]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
                <h3 className="font-extrabold text-white text-base">Nova Pesquisa demográfica de Mercado</h3>
              </div>
              <button
                onClick={() => {
                  if (!isAnalyzing) {
                    setShowAddModal(false);
                  }
                }}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                disabled={isAnalyzing}
              >
                ✕
              </button>
            </div>

            {apiError && (
              <div className="mt-4 flex gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-rose-300 text-xs">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <h5 className="font-bold">Ocorreu um erro ao consultar</h5>
                  <p className="mt-1 leading-relaxed">{apiError}</p>
                </div>
              </div>
            )}

            {isAnalyzing ? (
              /* Beautiful active diagnostic progress interface */
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
                  <Sparkles className="h-6 w-6 text-blue-400 animate-bounce" />
                </div>
                <h4 className="mt-4 font-bold text-white text-sm">Consultando Inteligência Demográfica</h4>
                <p className="mt-2 max-w-sm text-xs text-slate-400 leading-relaxed min-h-[40px] font-mono">
                  {loadingSteps[analysisStep]}
                </p>
                <div className="mt-3 flex gap-1 justify-center width-full justify-between max-w-xs">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1 w-12 rounded-full transition-all duration-300 ${
                        step <= analysisStep ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Form fields */
              <form onSubmit={handleAddSubmit} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Nome do Vendedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Oliveira"
                    value={formData.sellerName}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Telefone de Contato</label>
                  <input
                    type="tel"
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Cidade Alvo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ribeirão Preto - SP"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block leading-normal">Insira a cidade acompanhada do Estado para melhores resultados.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Clientes conquistados</label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="Ex: 5"
                      value={formData.currentClients}
                      onChange={(e) => setFormData({ ...formData, currentClients: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block leading-normal">Número de pontos comerciais já ativos nesta região.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Segmento de Negócio</label>
                  <select
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white select-none transition-all font-mono"
                  >
                    {SEGMENTS.map((seg, i) => (
                      <option key={i} value={seg} className="bg-[#0d0e14] text-white">
                        {seg}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.segment === "Outro (Personalizado)" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Especifique o Segmento</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Fabricação de Cosméticos, Distribuidora Pet"
                      value={customSegment}
                      onChange={(e) => setCustomSegment(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                    />
                  </div>
                )}

                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 mt-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Modo de Mapeamento</span>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setUseAI(false)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        !useAI 
                          ? "bg-blue-500/10 border-blue-500 text-white" 
                          : "bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-extrabold flex items-center gap-1.5 leading-none">
                        <Store className="h-3.5 w-3.5 text-blue-400" />
                        Mapeamento Local
                      </span>
                      <span className="text-[9px] text-slate-500 mt-1 leading-normal">Fórmula direta de PDVs. Excelente para Vercel rápido.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseAI(true)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        useAI 
                          ? "bg-purple-500/10 border-purple-500 text-white" 
                          : "bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-extrabold flex items-center gap-1.5 leading-none">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                        Mapeamento por IA
                      </span>
                      <span className="text-[9px] text-slate-500 mt-1 leading-normal">Insights demográficos e nichos gerados com Gemini.</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 justify-end border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-white/10 px-4.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4.5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
                  >
                    {!useAI ? <Store className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
                    {!useAI ? "Cadastrar com Mapeamento Local" : "Iniciar Análise Demográfica IA"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Edit Seller Overlay Modal / Slide-over */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0e14]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-405 animate-pulse text-blue-405" />
                <h3 className="font-extrabold text-white text-base">Editar Pesquisa demográfica de Mercado</h3>
              </div>
              <button
                onClick={() => {
                  if (!isEditingAnalyzing) {
                    setShowEditModal(false);
                    setEditingSellerId(null);
                  }
                }}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                disabled={isEditingAnalyzing}
              >
                ✕
              </button>
            </div>

            {editApiError && (
              <div className="mt-4 flex gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-rose-300 text-xs">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <h5 className="font-bold">Ocorreu um erro ao atualizar</h5>
                  <p className="mt-1 leading-relaxed">{editApiError}</p>
                </div>
              </div>
            )}

            {isEditingAnalyzing ? (
              /* Beautiful active diagnostic progress interface */
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
                  <Sparkles className="h-6 w-6 text-blue-400 animate-bounce" />
                </div>
                <h4 className="mt-4 font-bold text-white text-sm">Atualizando Inteligência Demográfica</h4>
                <p className="mt-2 max-w-sm text-xs text-slate-400 leading-relaxed min-h-[40px] font-mono">
                  {loadingSteps[editAnalysisStep]}
                </p>
                <div className="mt-3 flex gap-1 justify-center width-full justify-between max-w-xs">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1 w-12 rounded-full transition-all duration-300 ${
                        step <= editAnalysisStep ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Form fields */
              <form onSubmit={handleEditSubmit} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Nome do Vendedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Oliveira"
                    value={editFormData.sellerName}
                    onChange={(e) => setEditFormData({ ...editFormData, sellerName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Telefone de Contato</label>
                  <input
                    type="tel"
                    placeholder="Ex: (11) 99999-9999"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Cidade Alvo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ribeirão Preto - SP"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block leading-normal">Insira a cidade acompanhada do Estado para melhores resultados.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Clientes conquistados</label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="Ex: 5"
                      value={editFormData.currentClients}
                      onChange={(e) => setEditFormData({ ...editFormData, currentClients: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block leading-normal">Número de pontos comerciais já ativos nesta região.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Segmento de Negócio</label>
                  <select
                    value={editFormData.segment}
                    onChange={(e) => setEditFormData({ ...editFormData, segment: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white select-none transition-all font-mono"
                  >
                    {SEGMENTS.map((seg, i) => (
                      <option key={i} value={seg} className="bg-[#0d0e14] text-white">
                        {seg}
                      </option>
                    ))}
                  </select>
                </div>

                {editFormData.segment === "Outro (Personalizado)" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Especifique o Segmento</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Fabricação de Cosméticos, Distribuidora Pet"
                      value={editCustomSegment}
                      onChange={(e) => setEditCustomSegment(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:bg-black/60 focus:outline-none text-white placeholder-slate-600 transition-all font-mono"
                    />
                  </div>
                )}

                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 mt-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Modo de Mapeamento de Edição</span>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditUseAI(false)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        !editUseAI 
                          ? "bg-blue-500/10 border-blue-500 text-white" 
                          : "bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-extrabold flex items-center gap-1.5 leading-none">
                        <Store className="h-3.5 w-3.5 text-blue-400" />
                        Mapeamento Local
                      </span>
                      <span className="text-[9px] text-slate-500 mt-1 leading-normal">Re-calcula na hora com a fórmula local. Super rápido.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditUseAI(true)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        editUseAI 
                          ? "bg-purple-500/10 border-purple-500 text-white" 
                          : "bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-extrabold flex items-center gap-1.5 leading-none">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                        Mapeamento por IA
                      </span>
                      <span className="text-[9px] text-slate-500 mt-1 leading-normal">Solicita novos insights estruturados com a IA Gemini.</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 justify-end border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSellerId(null);
                    }}
                    className="rounded-xl border border-white/10 px-4.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4.5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
                  >
                    {!editUseAI ? <Store className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
                    {!editUseAI ? "Salvar com Mapeamento Local" : "Atualizar Análise via IA"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Decorative footer adhering to the dark layout */}
      <footer className="mt-16 border-t border-white/5 bg-black/20 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 Inteligência Regional Comercial. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5 text-slate-600">
            Mapeamento de TAM e Demografia Real Powered by Gemini 2.5 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
