import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Trophy, Flame, BookOpen, Palette, MessageSquare, 
  Send, UploadCloud, CheckCircle, ChevronRight, Award, 
  Zap, FileText, Check, ExternalLink, Lock, BookMarked, 
  LayoutGrid, Folder, LineChart, Code, Copy, Eye, Clock, HelpCircle, AlertCircle,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { REFERENCE_FILES } from "./referenceData";
import { LibraryMaterial, StudyPathway, StudyTopic, GamificationState, Badge, ColorUnit, ChatMessage } from "./types";
import Biblioteca from "./components/Biblioteca";

// Conteúdo Inicial de demonstração para hidratar o aplicativo SkillQuest com requinte
const INITIAL_MATERIALS: LibraryMaterial[] = [
  {
    id: "mat_01",
    name: "Modelagem_Isometria_Blender_SciFi.jpg",
    mimeType: "image/jpeg",
    base64Data: "",
    date: "2026-06-12",
    category: "Design 3D",
    pathwayCreated: true
  },
  {
    id: "mat_02",
    name: "Arquitetura_BentoGrid_Dashboard.png",
    mimeType: "image/png",
    base64Data: "",
    date: "2026-06-11",
    category: "Desenvolvimento Web",
    pathwayCreated: true
  }
];

const SAMPLE_PATHWAYS: { [key: string]: StudyPathway } = {
  "mat_01": {
    id: "pw_01",
    materialId: "mat_01",
    materialName: "Modelagem_Isometria_Blender_SciFi.jpg",
    category: "Design 3D",
    complexity: "Intermediário",
    justifiedPedagogy: "A imagem apresenta composições poligonais limpas em visual isométrico 3D, exigindo compreensão precisa sobre modelagem volumétrica modulares, parametrização física de materiais reflexivos e setup avançado de luz de preenchimento (fill light) de três pontos combinados a pós-processamento de glows.",
    estimatedTime: "4 semanas (aprox. 48h de estudos)",
    colors: [
      { hex: "#40C9AD", name: "Ciano Neon", psychology: "Evoca dinamismo tecnológico, criatividade ativa e estética futurista.", usage: "Utilizado nas ranhuras de iluminação emissiva internas do robô." },
      { hex: "#111827", name: "Slate Escuro Secundário", psychology: "Passa sensação de robustez de engenharia e foco imersivo prolongado.", usage: "Cor dominante dos painéis de contenção mecânicos." },
      { hex: "#F59E0B", name: "Laranja Alerta", psychology: "Chama a atenção focal do observador para as centrais de comando.", usage: "Destaque técnico em displays e sinalizações eletrônicas." }
    ],
    topics: [
      { id: "tp_bl_1", name: "Câmera Ortográfica e Grades Modulares", summary: "Como parametrizar o ângulo isométrico perfeito no Blender. Configuração de grades decimais de modelagem e Snapping de vértices estruturais para alinhamento profissional.", completed: true, xpReward: 100 },
      { id: "tp_bl_2", name: "Configuração Básica de Materiais PBR", summary: "Estudo sobre canais difusos, coeficientes físicos de rugosidade de shaders dielétricos (plásticos isométricos brilhantes) e índices reflexivos de vidro.", completed: false, xpReward: 100 },
      { id: "tp_bl_3", name: "Iluminação Isométrica com Shaders", summary: "Posicionamento correto do setup de Luzes de Três Pontos: Luz Principal (Key), Luz de Preenchimento (Fill) e Contraluz técnica para destacar as bordas poligonais do objeto.", completed: false, xpReward: 150 },
      { name: "Pós-Processamento e Glow shader", summary: "Habilitação de Bloom no motor físico de renderização. Filtros de distorção de lente (lens distortion) e correção gama para conferir aspecto de computação gráfica premium.", completed: false, xpReward: 200, id: "tp_bl_4" }
    ],
    roadmap: {
      primary: ["Câmera Ortográfica e Grades Modulares"],
      secondary: ["Configuração Básica de Materiais PBR", "Iluminação Isométrica com Shaders"],
      advanced: ["Pós-Processamento e Glow shader"]
    }
  },
  "mat_02": {
    id: "pw_02",
    materialId: "mat_02",
    materialName: "Arquitetura_BentoGrid_Dashboard.png",
    category: "Desenvolvimento Web",
    complexity: "Intermediário",
    justifiedPedagogy: "A imagem carrega layouts baseados no design Bento Grid com micro-interações reativas em painéis responsivos. Exige domínio sólido de grids CSS no Tailwind, gerenciamento atômico de estados em componentes React, e estruturação síncrona de chamadas REST.",
    estimatedTime: "5 semanas (aprox. 55h de estudos)",
    colors: [
      { hex: "#40C9AD", name: "Verde Água SkillQuest", psychology: "Favorece excelente contraste visual, promove incentivo e foco de estudo.", usage: "Utilizado nas barras de progresso virtuais e contadores ativos." },
      { hex: "#0F172A", name: "Dark Slate", psychology: "Fornece sobriedade profissional e excelente legibilidade de dados.", usage: "Aplicações de background no cockpit e sidebars de controle." },
      { hex: "#6366F1", name: "Indigo Elétrico", psychology: "Gera destaque de links especiais e evoca estética moderna polida.", usage: "Cor de marcadores secundários selecionados." }
    ],
    topics: [
      { id: "tp_web_1", name: "Bento Grid Layout com Tailwind CSS", summary: "Estruturação matemática de grades flexíveis e assimétricas usando CSS Grid, trabalhando classes complexas de rows e spans para ajuste responsivo elegante.", completed: false, xpReward: 100 },
      { id: "tp_web_2", name: "Gerenciamento Reativo de Estados Atômicos", summary: "Implementação lógica e controlada de estados do usuário. Técnicas para evitar renders desnecessários usando memoização e ordenação estruturada de props.", completed: false, xpReward: 100 },
      { id: "tp_web_3", name: "Animações Fluídas de Entrada e Micro-Estados", summary: "Uso correto do motion para carregar elementos com física elástica natural. Transição de mola (spring) aplicadas a checklists de missões e menus de navegação.", completed: false, xpReward: 150 },
      { id: "tp_web_4", name: "Endpoints Full-Stack Seguros e Proxies", summary: "Aprenda a estruturar rotas API Express servidas conjuntamente a clients React para encapsular segredos e chaves das chamadas no servidor.", completed: false, xpReward: 200 }
    ],
    roadmap: {
      primary: ["Bento Grid Layout com Tailwind CSS", "Gerenciamento Reativo de Estados Atômicos"],
      secondary: ["Animações Fluídas de Entrada e Micro-Estados"],
      advanced: ["Endpoints Full-Stack Seguros e Proxies"]
    }
  }
};

const INITIAL_BADGES: Badge[] = [
  { id: "b1", name: "Analisador Multimodal", description: "Subiu 5 mídias diferentes para análise reversa do robô.", unlocked: false, icon: "Eye", category: "Geral" },
  { id: "b2", name: "Foco Total", description: "Concluiu a leitura de seu primeiro assunto de alta prioridade.", unlocked: true, icon: "CheckCircle", category: "Estudos" },
  { id: "b3", name: "Mestre da Engenharia Reversa", description: "Completou uma trilha pedagógica inteira de estudos.", unlocked: false, icon: "Trophy", category: "Domínio" },
  { id: "b4", name: "Ofensiva de 5 Dias", description: "Manteve o streak estrito de estudos ativo por 5 dias.", unlocked: true, icon: "Flame", category: "Fidelidade" }
];

export default function App() {
  // Navegação por abas
  const [activeTab, setActiveTab] = useState<"hub" | "trilhas" | "arquivos" | "status">("hub");

  // Estado Geral de Gamificação
  const [game, setGame] = useState<GamificationState>({
    xp: 655,
    level: 4,
    streak: 5,
    badges: INITIAL_BADGES
  });

  // Lista de Materiais e Trilha Ativa
  const [materials, setMaterials] = useState<LibraryMaterial[]>(INITIAL_MATERIALS);
  const [pathways, setPathways] = useState<{ [key: string]: StudyPathway }>(SAMPLE_PATHWAYS);
  const [activePathway, setActivePathway] = useState<StudyPathway | null>(SAMPLE_PATHWAYS["mat_01"]);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);

  // Estados Relacionados a Upload do Arquivo
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de Confirmação de Categoria Detectada
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    materialId: string;
    filePathName: string;
    categoryDetected: string;
    pathwayData: StudyPathway;
  } | null>(null);

  // Mensagens do Mentor IA
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m_init", sender: "mentor", text: "Olá novato curioso! Sou seu Mentor IA. Após processar o arquivo de referência, fatiou-se uma trilha de fomento para guiar seus passos conceituais e práticos. Clique em qualquer assunto à esquerda e faça sua primeira pergunta técnica sobre o tema!", timestamp: "06:51" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Floating XP animado no clique
  const [floats, setFloats] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);
  const floatIdCounter = useRef(0);

  // Centralizando a aba de arquivos na mudança do activePathway
  useEffect(() => {
    if (activePathway && activePathway.topics.length > 0) {
      setSelectedTopic(activePathway.topics[0]);
    }
  }, [activePathway]);

  // Função para criar floating XP na interface
  const triggerFloatXp = (amount: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 20;
    const y = e.clientY - rect.top - 20;
    const id = floatIdCounter.current++;
    setFloats(prev => [...prev, { id, x, y, amount }]);
    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id));
    }, 1200);
  };

  // Função para lidar com drag e drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  // Executa o upload e faz a requisição na API segura do Node
  const processSelectedFile = (file: File) => {
    setScanning(true);
    setScanMessage("Conectando ao Motor de IA do SkillQuest...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;

      try {
        setScanMessage("IA escaneando composição à procura de primitivas técnicas...");
        
        // Timeout para simular processamento visual premium com feedback de mensagens mudando
        setTimeout(() => setScanMessage("IA fatiando disciplinas mecânicas e extraindo paleta cromática..."), 1200);
        setTimeout(() => setScanMessage("IA organizando assuntos em ordem cronológica de pré-requisito..."), 2600);

        const response = await fetch("/api/analyze-material", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: file.type,
            fileName: file.name
          })
        });

        const aiOutput = await response.json();

        // Insere o material de estudos no histórico do usuário
        const newMaterialId = `mat_${Date.now()}`;
        const newMaterial: LibraryMaterial = {
          id: newMaterialId,
          name: file.name,
          mimeType: file.type,
          base64Data: base64Data,
          date: new Date().toISOString().split('T')[0],
          category: aiOutput.category || "Design 3D",
          pathwayCreated: true
        };

        // Prepara o objeto StudyPathway correspondente
        const generatedPathway: StudyPathway = {
          id: `pw_${Date.now()}`,
          materialId: newMaterialId,
          materialName: file.name,
          category: aiOutput.category || "Design 3D",
          complexity: aiOutput.complexity || "Intermediário",
          justifiedPedagogy: aiOutput.justifiedPedagogy || "Análise pedagógica gerada pela IA.",
          estimatedTime: aiOutput.estimatedTime || "4 semanas",
          colors: aiOutput.colors || [],
          topics: (aiOutput.topics || []).map((t: any, idx: number) => ({
            id: `tp_${Date.now()}_${idx}`,
            name: t.name,
            summary: t.summary,
            completed: false,
            xpReward: t.xpReward || 100
          })),
          roadmap: aiOutput.roadmap || { primary: [], secondary: [], advanced: [] }
        };

        // Salva na memória do estado do modal para confirmação
        setTimeout(() => {
          setScanning(false);
          setConfirmModal({
            visible: true,
            materialId: newMaterialId,
            filePathName: file.name,
            categoryDetected: aiOutput.category || "Design 3D",
            pathwayData: generatedPathway
          });
        }, 3600);

      } catch (err) {
        console.error("Erro ao analisar arquivo via IA:", err);
        setScanning(false);
        alert("Ocorreu uma falha ao enviar o arquivo para análise. Rodando em fallback de desenvolvimento!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirmação final de categoria no modal
  const handleConfirmCategory = (chosenCategory: string) => {
    if (!confirmModal) return;

    const updatedPathway = {
      ...confirmModal.pathwayData,
      category: chosenCategory
    };

    const newMaterial: LibraryMaterial = {
      id: confirmModal.materialId,
      name: confirmModal.filePathName,
      mimeType: "image/png",
      base64Data: "",
      date: new Date().toISOString().split('T')[0],
      category: chosenCategory,
      pathwayCreated: true
    };

    // Insere o material nos estados
    setMaterials(prev => [newMaterial, ...prev]);
    setPathways(prev => ({
      ...prev,
      [confirmModal.materialId]: updatedPathway
    }));
    
    // Configura o caminho ativo de estudos
    setActivePathway(updatedPathway);

    // Adiciona XP de Recompensa de Postagem (+100 XP)
    awardXp(100);

    // Ajusta o streak de fidelidade do usuário
    setGame(prev => ({
      ...prev,
      streak: prev.streak + 1
    }));

    // Verifica se completou 5 imagens para liberar badge Analisador Multimodal
    const totalMaterials = materials.length + 1;
    if (totalMaterials >= 5) {
      unlockBadge("b1");
    }

    // Fecha o modal e navega automaticamente para a aba de missões
    setConfirmModal(null);
    setActiveTab("trilhas");

    // Limpa chats antigos para contextualizar com a nova trilha
    setMessages([
      { id: "m_new", sender: "mentor", text: `Excelente! Detectamos que você carregou o conteúdo da categoria "${chosenCategory}". Preparei uma trilha fantástica para você dominar isso do zero! Qual dúvida técnica quer tirar?`, timestamp: "06:51" }
    ]);
  };

  // Sistema de premiação de XP robusto gerenciando nível de RPG
  const awardXp = (amount: number) => {
    setGame(prev => {
      let currentXp = prev.xp + amount;
      let currentLvl = prev.level;
      let leveledUp = false;

      // Cada nível pede level * 1000 XP
      while (currentXp >= currentLvl * 1000) {
        currentXp -= currentLvl * 1000;
        currentLvl += 1;
        leveledUp = true;
      }

      // Caso tenha caído para negativo na desmarcação
      if (currentXp < 0) {
        currentXp = 0;
      }

      if (leveledUp) {
        // Dispara uma notificação ou bota no log
        console.log(`Parabéns! Evoluiu para o nível intelectual ${currentLvl}!`);
      }

      return {
        ...prev,
        xp: currentXp,
        level: currentLvl
      };
    });
  };

  const unlockBadge = (badgeId: string) => {
    setGame(prev => {
      const updatedBadges = prev.badges.map(b => {
        if (b.id === badgeId && !b.unlocked) {
          return { ...b, unlocked: true };
        }
        return b;
      });
      return { ...prev, badges: updatedBadges };
    });
  };

  // Marcação física do checkbox de conclusão de tópicos
  const handleToggleTopic = (topicId: string, event: React.MouseEvent) => {
    if (!activePathway) return;

    const updatedTopics = activePathway.topics.map(t => {
      if (t.id === topicId) {
        const nextCompleted = !t.completed;
        
        if (nextCompleted) {
          triggerFloatXp(t.xpReward, event);
          awardXp(t.xpReward);
          
          // Se for o primeiro tópico finalizado, libera Medalha "Foco Total"
          const anyCompleted = activePathway.topics.some(tp => tp.completed);
          if (!anyCompleted) {
            unlockBadge("b2");
          }
        } else {
          // Descontamos XP caso desmarque
          awardXp(-t.xpReward);
        }

        return { ...t, completed: nextCompleted };
      }
      return t;
    });

    // Se concluiu todas as tarefas, ganha XP bônus (+200 XP) e medalha de mestre
    const allCompletedNow = updatedTopics.every(t => t.completed);
    if (allCompletedNow) {
      awardXp(200);
      unlockBadge("b3");
    }

    const nextPathwayState = {
      ...activePathway,
      topics: updatedTopics
    };

    setActivePathway(nextPathwayState);
    
    // Atualiza o tópico em foco caso seja o mesmo
    const modified = updatedTopics.find(t => t.id === topicId);
    if (modified && selectedTopic?.id === topicId) {
      setSelectedTopic(modified);
    }
  };

  // Carrega pasta de demonstração pelo botão do hub
  const loadDemoMaterial = (matId: string) => {
    const demoPw = SAMPLE_PATHWAYS[matId];
    if (demoPw) {
      setActivePathway(demoPw);
      setActiveTab("trilhas");
      // Reseta chats
      setMessages([
        { id: "m_demo", sender: "mentor", text: `Você selecionou a trilha "${demoPw.materialName}". Este é um projeto focado na categoria corporativa "${demoPw.category}". Qual disciplina você quer dissecar primeiro?`, timestamp: "06:51" }
      ]);
    }
  };

  // Envia pergunta ao Mentor IA usando a API segura
  const handleSendMentorMessage = async () => {
    if (!inputVal.trim() || !activePathway || !selectedTopic) return;
    
    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: inputVal,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal("");
    setSendingMessage(true);

    try {
      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          topicName: selectedTopic.name,
          materialCategory: activePathway.category
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: `mnt_${Date.now()}`,
        sender: "mentor",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }]);

    } catch (err) {
      console.error("Falha ao comunicar com mentor IA:", err);
      // Fallback local elegante
      setMessages(prev => [...prev, {
        id: `mnt_err_${Date.now()}`,
        sender: "mentor",
        text: "Infelizmente, tive um breve desvio de conexão. Mas lembre-se: " + selectedTopic.summary + " Estude este resumo conceitual para avançar!",
        timestamp: "06:51"
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR FIXA LATERAL */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col justify-between border-r border-slate-200 flex-shrink-0 z-20">
        <div>
          {/* Logo Brand minimalista */}
          <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-200">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#40C9AD] rounded-lg blur-xs opacity-40 animate-pulse"></div>
              <div className="relative bg-slate-50 border border-slate-200 text-[#40C9AD] p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-850 leading-none block">SkillQuest</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#40C9AD] font-bold block mt-0.5">Aprendizado Reverso</span>
            </div>
          </div>

          {/* Menu de Abas */}
          <nav className="p-4 space-y-1.5">
            <button 
              id="tab-hub"
              onClick={() => setActiveTab("hub")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "hub" 
                  ? "bg-[#40C9AD]/10 text-teal-800 border border-[#40C9AD]/30 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className={`w-4 h-4 ${activeTab === "hub" ? "text-[#40C9AD]" : "text-slate-400"}`} />
                <span>Painel Hub</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            <button 
              id="tab-trilhas"
              onClick={() => setActiveTab("trilhas")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "trilhas" 
                  ? "bg-[#40C9AD]/10 text-teal-800 border border-[#40C9AD]/30 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookMarked className={`w-4 h-4 ${activeTab === "trilhas" ? "text-[#40C9AD]" : "text-slate-400"}`} />
                <span>Trilhas de Estudo</span>
              </div>
              {activePathway && (
                <span className="bg-[#40C9AD] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </button>

            <button 
              id="tab-arquivos"
              onClick={() => setActiveTab("arquivos")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "arquivos" 
                  ? "bg-[#40C9AD]/10 text-teal-800 border border-[#40C9AD]/30 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className={`w-4 h-4 ${activeTab === "arquivos" ? "text-[#40C9AD]" : "text-slate-400"}`} />
                <span>Biblioteca</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{materials.length}</span>
            </button>

            <button 
              id="tab-status"
              onClick={() => setActiveTab("status")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "status" 
                  ? "bg-[#40C9AD]/10 text-teal-800 border border-[#40C9AD]/30 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <LineChart className={`w-4 h-4 ${activeTab === "status" ? "text-[#40C9AD]" : "text-slate-400"}`} />
                <span>Status de Progresso</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            {/* Dev Sandbox block removed as per user instruction */}
          </nav>
        </div>

        {/* Bloco inferior do Perfil RPG */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="bg-[#40C9AD]/10 border border-[#40C9AD]/20 w-10 h-10 rounded-xl flex items-center justify-center text-[#40C9AD]">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 truncate">Mia Polímata</span>
                <span className="text-[10px] font-mono text-[#40C9AD] font-extrabold bg-[#40C9AD]/10 px-1.5 py-0.5 rounded-md">Lvl {game.level}</span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block">Reverendo da Oficina</span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
              <span>Nível Intelectual</span>
              <span>{game.xp} / {game.level * 1000} XP</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#40C9AD] h-full transition-all duration-300"
                style={{ width: `${(game.xp / (game.level * 1000)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (DERECHA) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Central de Status de Gamificação */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex-shrink-0 flex items-center justify-between gap-6 z-10">
          <div>
            {activePathway ? (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#40C9AD] font-mono block">Ativo: {activePathway.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">{activePathway.complexity}</span>
              </div>
            ) : (
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#40C9AD] font-mono">Cognitive Learning Arena</span>
            )}
            <h1 className="font-display font-black text-lg text-slate-800 tracking-tight leading-none">
              {activePathway ? activePathway.materialName : "SkillQuest Dashboard"}
            </h1>
          </div>

          {/* Gamification Hub Widget */}
          <div className="flex items-center gap-4">
            {/* Streak Widget */}
            <div className="flex items-center gap-2 bg-amber-50/80 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 text-xs font-bold shadow-3xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{game.streak} d</span>
            </div>

            {/* Level Trophy */}
            <div className="flex items-center gap-2 bg-[#40C9AD]/10 text-teal-800 px-3 py-1.5 rounded-lg border border-[#40C9AD]/20 text-xs font-bold shadow-3xs">
              <Trophy className="w-3.5 h-3.5 text-[#40C9AD]" />
              <span>Lvl {game.level}</span>
            </div>

            {/* Total XP Progress */}
            <div className="w-40 bg-slate-50 p-2 border border-slate-200/60 rounded-lg flex flex-col gap-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-500">
                <span>XP Progress</span>
                <span className="font-mono text-[#40C9AD]">{(game.level * 1000) - game.xp} XP restando</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#40C9AD] h-full transition-all duration-300"
                  style={{ width: `${(game.xp / (game.level * 1000)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </header>

        {/* Switcher de Telas/Abas do App */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          
          <AnimatePresence mode="wait">
            
            {/* ABA 1: HUB (Dashboard Inicial) */}
            {activeTab === "hub" && (
              <motion.div 
                key="hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-6xl mx-auto px-8 py-8 space-y-8"
              >
                
                {/* Hero MinimalISTA com explicação do aprendizado reverso */}
                <div className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-xs overflow-hidden">
                  <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#40C9AD]/10 via-transparent to-transparent rounded-full -mr-20 -mt-20"></div>
                  
                  <div className="max-w-lg">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#40C9AD] font-bold bg-[#40C9AD]/5 px-2.5 py-1 rounded-md">
                      Mecanismos de Engenharia Reversa
                    </span>
                    <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-800 leading-tight mt-3">
                      Desmonte layouts e codifique do zero com nosso <span className="text-[#40C9AD]">Motor Multimodal IA</span>.
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed">
                      Faça o upload de infográficos, pôsters, diagramas ou designs de produto. A nossa inteligência gerará uma grade curricular completa sequencial explicando exatamente o que você precisa focar para recriar o mesmo objeto.
                    </p>
                  </div>
                </div>

                {/* Grid Superior: Upload Dropzone + Trilha Ativa */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* DRAGZONE DE UPLOAD */}
                  <div className="lg:col-span-7">
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`h-64 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
                        isDragging 
                          ? "border-[#40C9AD] bg-[#40C9AD]/5 scale-[0.99] shadow-xs" 
                          : "border-slate-200 hover:border-[#40C9AD] hover:bg-slate-50/40"
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf,text/plain"
                        className="hidden"
                      />
                      
                      <div className="bg-[#40C9AD]/10 p-4 rounded-full mb-4 text-[#40C9AD] shadow-sm animate-pulse-slow">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      
                      <h3 className="font-display font-bold text-sm text-slate-800">Arraste e solte o arquivo de referência</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                        Imagens (JPG/PNG), PDFs técnicos ou arquivos de texto/código. A IA analisará o material e estruturará percursos de estudo gamificados.
                      </p>
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 bg-[#40C9AD] hover:bg-[#32b298] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#40C9AD]/15"
                      >
                        Selecionar do Computador
                      </button>
                    </div>
                  </div>

                  {/* CARD DE TRILHA ATIVA */}
                  <div className="lg:col-span-5 flex">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between w-full">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Trilha em Execução
                          </span>
                          <span className="bg-[#40C9AD]/10 text-[#40C9AD] text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                            Ativa
                          </span>
                        </div>

                        {activePathway ? (
                          <>
                            <h3 className="font-display font-extrabold text-base text-slate-800 line-clamp-1">
                              {activePathway.materialName}
                            </h3>
                            <div className="flex gap-4 mt-3">
                              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {activePathway.estimatedTime}
                              </span>
                              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-[#40C9AD]" />
                                {activePathway.complexity}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed mt-4 line-clamp-3">
                              {activePathway.justifiedPedagogy}
                            </p>

                            {/* Próximo assunto recomendado na trilha */}
                            <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[9px] uppercase font-mono tracking-widest text-[#40C9AD] font-bold block">Próxima Missão Acadêmica</span>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                                {activePathway.topics.find(t => !t.completed)?.name || "Todas as missões concluídas!"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-xs">Nenhum percurso didático gerado ainda.</p>
                          </div>
                        )}
                      </div>

                      {activePathway && (
                        <button 
                          onClick={() => setActiveTab("trilhas")}
                          className="w-full mt-6 bg-[#0F172A] hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition-all transition-transform flex items-center justify-center gap-2"
                        >
                          <span>Entrar na Arena das Missões</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Demonstrações alternativas Rápidas para testar o App de forma instantânea */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                    Quer testar instantaneamente? Escolha um item de demonstração de alta fidelidade:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => loadDemoMaterial("mat_01")}
                      className="text-left bg-white p-4 rounded-xl border border-slate-200/50 hover:border-[#40C9AD] transition-all group flex items-start gap-4"
                    >
                      <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg group-hover:scale-105 transition-transform font-bold font-mono text-xs">3D</div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Poster Blender Isométrico Sci-Fi</span>
                        <span className="text-[11px] text-slate-400">Scan multimodal extrairá modelagem modular e shaders reflexivos.</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => loadDemoMaterial("mat_02")}
                      className="text-left bg-white p-4 rounded-xl border border-slate-200/50 hover:border-[#40C9AD] transition-all group flex items-start gap-4"
                    >
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform font-bold font-mono text-xs">Web</div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Bento-Grid Dashboard Premium</span>
                        <span className="text-[11px] text-slate-400">Scan multimodal fatiará grids do CSS e micro-estados atômicos React.</span>
                      </div>
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ABA 2: TRILHAS (A Arena do Walkthrough) */}
            {activeTab === "trilhas" && (
              <motion.div 
                key="trilhas"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto px-8 py-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* COLUNA ESQUERDA - LISTA DE MATERIAIS */}
                  <div className="lg:col-span-3 lg:sticky lg:top-24 flex flex-col gap-4">
                    <div className="bg-white rounded-3xl border border-slate-200/65 p-5 shadow-xs">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <BookMarked className="w-4 h-4 text-[#40C9AD]" />
                        <h3 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider">
                          Materiais de Estudo
                        </h3>
                      </div>

                      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                        {materials.map((m) => {
                          const isActive = activePathway?.materialId === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                const matchedPw = pathways[m.id] || SAMPLE_PATHWAYS[m.id];
                                if (matchedPw) {
                                  setActivePathway(matchedPw);
                                } else {
                                  // Fallback demo material
                                  const demoPw = SAMPLE_PATHWAYS[m.id];
                                  if (demoPw) {
                                    setActivePathway(demoPw);
                                  } else {
                                    loadDemoMaterial("mat_01");
                                  }
                                }
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                                isActive
                                  ? "border-[#40C9AD] bg-[#40C9AD]/5 shadow-3xs"
                                  : "border-slate-150 hover:border-slate-300 hover:bg-slate-50/60 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                  isActive 
                                    ? "bg-[#40C9AD]/15 text-[#40C9AD]" 
                                    : "bg-slate-100 text-slate-600"
                                }`}>
                                  {m.category}
                                </span>
                                {isActive && (
                                  <span className="flex items-center gap-1 text-[9px] text-[#40C9AD] font-bold uppercase tracking-wider font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#40C9AD] animate-pulse"></span>
                                    Ativo
                                  </span>
                                )}
                              </div>
                              <h4 className={`font-display font-bold text-xs line-clamp-2 transition-all leading-tight ${
                                isActive ? "text-slate-800" : "text-slate-650"
                              }`}>
                                {m.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Sincronizado: {m.date}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {activePathway ? (
                    <>
                      {/* COLUNA CENTRAL (A Linha do Tempo / Árvore de Habilidades) */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs relative">
                          {/* Indicadores do material */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-50">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#40C9AD] bg-[#40C9AD]/5 px-2.5 py-1 rounded-md">
                                {activePathway.category}
                              </span>
                              <h2 className="font-display font-extrabold text-sm text-slate-800 mt-2">
                                {activePathway.materialName}
                              </h2>
                            </div>
                            <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200/50">
                              Nível: {activePathway.complexity}
                            </span>
                          </div>

                          {/* Linha do tempo física da grade curricular com conexões neurais */}
                          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:bg-slate-100 before:w-0.5 before:pointer-events-none before:z-0">
                            {activePathway.topics.map((topic, idx) => {
                              const isSelected = selectedTopic?.id === topic.id;
                              return (
                                <div 
                                  key={topic.id}
                                  onClick={() => setSelectedTopic(topic)}
                                  className={`flex gap-4 relative z-10 p-4 rounded-2xl cursor-pointer transition-all border ${
                                    isSelected 
                                      ? "bg-[#40C9AD]/5 border-[#40C9AD]/20 shadow-xs" 
                                      : "bg-white hover:bg-slate-50/50 border-transparent hover:border-slate-200/30"
                                  }`}
                                >
                                  {/* Círculo do checklist do tema de RPG */}
                                  <button 
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleToggleTopic(topic.id, event);
                                    }}
                                    className="focus:outline-none flex-shrink-0 z-10 relative"
                                  >
                                    {topic.completed ? (
                                      <div className="w-10 h-10 rounded-full bg-[#40C9AD] border-2 border-white shadow-md shadow-[#40C9AD]/20 flex items-center justify-center text-white scale-105 transition-transform duration-350">
                                        <CheckCircle className="w-5 h-5" />
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-slate-55 bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#40C9AD] hover:text-[#40C9AD] transition-all font-mono text-sm font-bold">
                                        {idx + 1}
                                      </div>
                                    )}

                                    {/* Floating XP Gain indicators */}
                                    <AnimatePresence>
                                      {floats.map(f => (
                                        <motion.span
                                          key={f.id}
                                          initial={{ opacity: 1, y: f.y, x: f.x, scale: 0.8 }}
                                          animate={{ opacity: 0, y: f.y - 60, scale: 1.1 }}
                                          exit={{ opacity: 0 }}
                                          transition={{ duration: 1.1, ease: "easeOut" }}
                                          className="absolute text-[11px] font-mono font-bold text-[#40C9AD] whitespace-nowrap bg-[#0F172A] px-2 py-1 rounded-md shadow-md pointer-events-none z-50"
                                        >
                                          +{f.amount} XP! 🔥
                                        </motion.span>
                                      ))}
                                    </AnimatePresence>
                                  </button>

                                  {/* Informações do Assunto */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                      <h3 className={`font-display font-extrabold text-xs leading-snug transition-all ${
                                        topic.completed ? "text-slate-400 line-through" : "text-slate-800"
                                      }`}>
                                        {topic.name}
                                      </h3>
                                      <span className="font-mono text-[10px] font-bold text-[#40C9AD] bg-[#40C9AD]/10 px-2 rounded-md flex-shrink-0">
                                        +{topic.xpReward} XP
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{topic.summary}</p>
                                  </div>

                                  <ChevronRight className="w-4 h-4 self-center text-slate-300 flex-shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ROTEIRO ROADMAP PRAGMÁTICO */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
                          <h3 className="font-display font-extrabold text-xs text-slate-800 mb-4 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-rose-500 animate-spin-slow" />
                            Roteiro de Estudos (Roadmap)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            
                            {/* Primário */}
                            <div className="bg-rose-50/50 border border-rose-100/40 p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1.5 font-mono">1. Primário</span>
                              <ul className="space-y-1 text-[11px] text-slate-600">
                                {activePathway.roadmap.primary.map((item, i) => (
                                  <li key={i} className="flex gap-1.5 items-start">
                                    <span className="text-rose-450 font-extrabold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Secundário */}
                            <div className="bg-amber-50/50 border border-amber-100/40 p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1.5 font-mono">2. Secundário</span>
                              <ul className="space-y-1 text-[11px] text-slate-600">
                                {activePathway.roadmap.secondary.map((item, i) => (
                                  <li key={i} className="flex gap-1.5 items-start">
                                    <span className="text-amber-450 font-extrabold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Avançado */}
                            <div className="bg-indigo-50/50 border border-indigo-100/40 p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1.5 font-mono">3. Avançado</span>
                              <ul className="space-y-1 text-[11px] text-slate-600">
                                {activePathway.roadmap.advanced.map((item, i) => (
                                  <li key={i} className="flex gap-1.5 items-start">
                                    <span className="text-indigo-455 font-extrabold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* COLUNA DIREITA (FICHA TÉCNICA E MENTOR IA) */}
                      <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-[560px]">
                          
                          {/* Selector de Tabs da Ficha Técnica */}
                          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/60 z-10">
                            <button 
                              id="subtab-resumos"
                              onClick={() => setSelectedTopic(selectedTopic || activePathway.topics[0])}
                              className="py-3.5 text-xs font-bold transition-all border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2"
                              style={{ borderBottomColor: selectedTopic ? "#40C9AD" : "transparent" }}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Resumos
                            </button>

                            <button 
                              id="subtab-cores"
                              className="py-3.5 text-xs font-bold transition-all border-b-2 text-slate-400 hover:text-slate-800 flex items-center justify-center gap-2"
                              onClick={() => {
                                // Simulamos um foco para ver a paleta de cores
                                setSelectedTopic(null);
                              }}
                              style={{ borderBottomColor: !selectedTopic ? "#40C9AD" : "transparent" }}
                            >
                              <Palette className="w-3.5 h-3.5" />
                              Cores
                            </button>

                            <button 
                              id="subtab-mentor"
                              onClick={() => {
                                if (!selectedTopic) {
                                  setSelectedTopic(activePathway.topics[0]);
                                }
                              }}
                              className="py-3.5 text-xs font-bold text-slate-500 flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              IA Mentor
                            </button>
                          </div>

                          {/* Conteúdo Dinâmico Baseado no Tópico Selecionado */}
                          <div className="flex-1 p-5 overflow-y-auto flex flex-col h-full justify-between">
                            
                            {/* SE SELECIONOU UM ASSUNTO (Aba de Resumos/Mentor) */}
                            {selectedTopic ? (
                              <div className="flex flex-col h-full justify-between gap-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono tracking-widest uppercase bg-[#40C9AD]/10 text-[#40C9AD] px-2.5 py-1 rounded-md font-extrabold animate-pulse">
                                      Resumo do Tópico
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                      +{selectedTopic.xpReward} XP
                                    </span>
                                  </div>

                                  <h3 className="font-display font-extrabold text-xs text-slate-800">
                                    {selectedTopic.name}
                                  </h3>

                                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-650 leading-relaxed shadow-3xs">
                                    {selectedTopic.summary}
                                  </div>

                                  {/* Conversação / Live Chat com o Mentor IA do Tópico */}
                                  <div className="border-t border-slate-100 pt-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2 font-mono">
                                      <MessageSquare className="w-3 h-3 text-[#40C9AD]" />
                                      Dúvidas com o Mentor IA
                                    </h4>
                                    
                                    {/* Thread encapsulado */}
                                    <div className="bg-slate-50/50 border border-slate-200/40 rounded-xl p-3 h-48 overflow-y-auto space-y-2 mb-3">
                                      {messages.map((m, idx) => (
                                        <div 
                                          key={idx}
                                          className={`flex flex-col max-w-[85%] ${
                                            m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                          }`}
                                        >
                                          <span className="text-[8px] font-mono text-slate-400 mb-0.5 uppercase font-bold">
                                            {m.sender === "user" ? "Você" : "Mentor IA"}
                                          </span>
                                          <p className={`p-2 rounded-xl text-[11px] leading-relaxed ${
                                            m.sender === "user" 
                                              ? "bg-[#40C9AD] text-white rounded-tr-none" 
                                              : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-3xs"
                                          }`}>
                                            {m.text}
                                          </p>
                                        </div>
                                      ))}
                                      {sendingMessage && (
                                        <div className="text-[10px] text-slate-400 animate-pulse font-mono flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 animate-spin text-[#40C9AD]" />
                                          <span>Mentor IA arquitetando resposta...</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Input do Chat */}
                                <div className="flex gap-2 border-t border-slate-100 pt-3 mt-auto">
                                  <input 
                                    type="text"
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMentorMessage()}
                                    placeholder="Digite sua dúvida..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#40C9AD] transition-colors"
                                  />
                                  <button 
                                    onClick={handleSendMentorMessage}
                                    disabled={sendingMessage || !inputVal.trim()}
                                    className="bg-[#40C9AD] hover:bg-[#32b298] disabled:opacity-50 text-white p-2 text-center rounded-xl transition-all shadow-md shadow-[#40C9AD]/15 flex items-center justify-center shrink-0 w-9 h-9"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // EXIBIÇÃO DA PALETA DE CORES (Caso clique na aba de cores / selectedTopic === null)
                              <div className="space-y-4 h-full flex flex-col justify-between">
                                <div className="space-y-4">
                                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3">
                                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block mb-1">Psicologia de Design</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                      O escaneamento cromático detectou as seguintes tonalidades da referência:
                                    </p>
                                  </div>

                                  <div className="space-y-3">
                                    {activePathway.colors.map((c, i) => (
                                      <div key={i} className="flex gap-3 items-start bg-white p-2.5 border border-slate-100 rounded-xl shadow-3xs">
                                        <div 
                                          className="w-8 h-8 rounded-lg flex-shrink-0 border border-slate-200 shadow-sm"
                                          style={{ backgroundColor: c.hex }}
                                        />
                                        <div className="text-[11px] min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-display font-bold text-slate-800">{c.name}</span>
                                            <span className="font-mono text-[9px] text-slate-405">{c.hex}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                            {c.usage}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <button 
                                  onClick={() => setSelectedTopic(activePathway.topics[0])}
                                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <span>Voltar para Missões</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                          </div>
                        </div>

                      </div>
                    </>
                  ) : (
                    <div className="lg:col-span-9 text-center py-24 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl shadow-xs">
                      <AlertCircle className="w-12 h-12 text-[#40C9AD] animate-bounce mb-4" />
                      <h3 className="font-display font-extrabold text-base text-slate-800">Nenhum Material Ativo</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
                        Selecione um dos materiais de estudos na lista ao lado ou carregue um novo arquivo no Hub para começar!
                      </p>
                      <button 
                        onClick={() => setActiveTab("hub")}
                        className="bg-[#40C9AD] hover:bg-[#32b298] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#40C9AD]/15"
                      >
                        Ir Para o Hub de Upload
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* ABA 3: ARQUIVOS (Biblioteca de Conhecimento) */}
            {activeTab === "arquivos" && (
              <motion.div 
                key="arquivos"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="max-w-6xl mx-auto px-8 py-8"
              >
                <Biblioteca 
                  materials={materials}
                  activeMaterialId={activePathway?.materialId}
                  setActiveTab={setActiveTab}
                  onProcessFile={processSelectedFile}
                  onLoadStudies={(mId) => {
                    const matchedPw = pathways[mId] || SAMPLE_PATHWAYS[mId];
                    if (matchedPw) {
                      setActivePathway(matchedPw);
                    } else {
                      loadDemoMaterial("mat_01");
                    }
                  }}
                />
              </motion.div>
            )}

            {/* ABA 4: STATUS (Estatísticas e Medalhas) */}
            {activeTab === "status" && (
              <motion.div 
                key="status"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="max-w-6xl mx-auto px-8 py-8 space-y-8"
              >
                
                {/* Widgets de Progresso Estatísticos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">Assuntos Domados</span>
                      <span className="text-2xl font-display font-extrabold text-slate-800 block mt-1">2 / 8</span>
                      <span className="text-[10px] text-[#40C9AD] font-bold block mt-0.5">🔥 25% Concluído</span>
                    </div>
                    <div className="bg-emerald-50 text-[#40C9AD] p-3 rounded-xl">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">XP Acumulado</span>
                      <span className="text-2xl font-display font-extrabold text-slate-800 block mt-1">{game.xp + 3000}</span>
                      <span className="text-[10px] text-amber-500 font-bold block mt-0.5">🏆 +100 XP hoje</span>
                    </div>
                    <div className="bg-amber-50 text-amber-500 p-3 rounded-xl">
                      <Trophy className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">Ofensiva de Estudos</span>
                      <span className="text-2xl font-display font-extrabold text-slate-800 block mt-1">{game.streak} Dias</span>
                      <span className="text-[10px] text-rose-500 font-bold block mt-0.5">🔥 Ofensiva Suprema</span>
                    </div>
                    <div className="bg-rose-50 text-rose-500 p-3 rounded-xl">
                      <Flame className="w-6 h-6 animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* Grafico Minimalista de Horas de Estudo Semanais */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-3xs">
                  <h3 className="font-display font-bold text-sm text-slate-800 mb-4">Frequência Semanal de Aprendizado (Horas de Dedicação)</h3>
                  
                  {/* Inline Vector minimalist chart */}
                  <div className="relative h-48 w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-end justify-between px-8 pb-4 pt-8">
                    {/* Linha horizontal tracejada do grafico */}
                    <div className="absolute inset-x-0 top-12 border-t border-dashed border-slate-200/50"></div>
                    <div className="absolute inset-x-0 top-24 border-t border-dashed border-slate-200/50"></div>
                    <div className="absolute inset-x-0 top-36 border-t border-dashed border-slate-200/50"></div>

                    {/* Barras minimalistas */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-slate-200/50 h-10 rounded-t-lg transition-all hover:bg-[#40C9AD]/50"></div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">Seg</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-slate-200/50 h-24 rounded-t-lg transition-all hover:bg-[#40C9AD]/50"></div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">Ter</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-[#40C9AD] h-36 rounded-t-lg shadow-sm shadow-[#40C9AD]/20"></div>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">Qua</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-slate-200/50 h-16 rounded-t-lg transition-all hover:bg-[#40C9AD]/50"></div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">Qui</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-[#40C9AD] h-28 rounded-t-lg shadow-sm shadow-[#40C9AD]/20"></div>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">Sex</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-[#40C9AD]/30 h-12 rounded-t-lg"></div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">Sáb</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 md:w-12 bg-slate-200/50 h-4 rounded-t-lg"></div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">Dom</span>
                    </div>

                    {/* Legenda em hover flutuante */}
                    <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-400 bg-white px-2 py-1 border border-slate-100 rounded-md shadow-3xs">
                      Legenda: <span className="text-[#40C9AD] font-bold">● Dias Ativos</span>
                    </div>
                  </div>
                </div>

                {/* PRATELEIRA DE BADGES/CONQUISTAS DO SISTEMA */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-800">Prateleira de Medalhas (Conquistas)</h3>
                    <p className="text-xs text-slate-400">Objetivos gamificados para incentivar sua rotina técnica diária.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {game.badges.map(b => (
                      <div 
                        key={b.id}
                        className={`bg-white rounded-2xl border p-5 flex flex-col items-center text-center justify-between h-48 transition-all ${
                          b.unlocked 
                            ? "border-[#40C9AD]/30 bg-[#40C9AD]/5 shadow-sm" 
                            : "border-slate-100 opacity-60 bg-slate-50/50"
                        }`}
                      >
                        <div className={`p-4 rounded-full ${
                          b.unlocked ? "bg-[#40C9AD]/20 text-[#40C9AD]" : "bg-slate-200/80 text-slate-400"
                        }`}>
                          {b.unlocked ? (
                            <Award className="w-7 h-7" />
                          ) : (
                            <Lock className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <span className={`font-display font-bold text-xs block ${b.unlocked ? "text-slate-800" : "text-slate-500"}`}>
                            {b.name}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed px-1.5">{b.description}</span>
                        </div>

                        <span className={`text-[9px] uppercase font-mono font-extrabold px-2 py-0.5 rounded ${
                          b.unlocked ? "bg-[#40C9AD]/10 text-[#40C9AD]" : "bg-slate-200 text-slate-400"
                        }`}>
                          {b.unlocked ? "Desbloqueada" : "Bloqueada"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ABA de código removida */}

          </AnimatePresence>
        </div>

      </div>

      {/* 3. MODAL DE CONFIRMAÇÃO DE CATEGORIA DETECTADA */}
      <AnimatePresence>
        {confirmModal && confirmModal.visible && (
          <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#40C9AD]/10 p-2.5 rounded-xl text-[#40C9AD]">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800">IA Scanner: Triagem Completa</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">O arquivo foi descriptografado com sucesso pelo Copilot.</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-1 my-4 leading-relaxed">
                  <span className="font-bold text-slate-700 block">Diagnóstico de Imagem:</span>
                  <p className="text-slate-500">
                    Calculamos um indicador de complexidade <span className="font-bold text-[#40C9AD]">{confirmModal.pathwayData.complexity}</span> necessitando de aproximadamente <span className="font-bold text-[#40C9AD]">{confirmModal.pathwayData.estimatedTime}</span> de estudo prático para replicação.
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">Qual a principal disciplina?</span>
                  
                  {/* Grid de checkboxes de simulação de categoria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Design 3D", "Desenvolvimento Web", "Ilustração Vetorial", "Diagrama Técnico"].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => {
                          setConfirmModal(prev => prev ? { ...prev, categoryDetected: cat } : null);
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          confirmModal.categoryDetected === cat 
                            ? "border-[#40C9AD] bg-[#40C9AD]/5 font-bold text-slate-800 shadow-3xs" 
                            : "border-slate-150 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span>{cat}</span>
                        {confirmModal.categoryDetected === cat && (
                          <div className="bg-[#40C9AD] text-white p-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Ações do Modal */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold transition-all"
                >
                  Descartar
                </button>
                <button 
                  onClick={() => handleConfirmCategory(confirmModal.categoryDetected)}
                  className="flex-1 bg-[#40C9AD] hover:bg-[#32b298] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-[#40C9AD]/15 transition-all"
                >
                  Confirmar e Gerar Trilha!
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. TELA FANTASMA DE LOADING/SCANNING */}
      <AnimatePresence>
        {scanning && (
          <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center">
            
            {/* Radar circular pulsante */}
            <div className="relative w-28 h-28 mb-6">
              <div className="absolute inset-0 bg-[#40C9AD]/20 rounded-full animate-ping"></div>
              <div className="absolute inset-2 bg-[#40C9AD]/30 rounded-full animate-ping-slow"></div>
              <div className="absolute inset-4 border border-[#40C9AD]/40 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#40C9AD] animate-pulse" />
              </div>
            </div>

            <h3 className="font-display font-extrabold text-base text-white">Escanando Mídia Multimodal...</h3>
            
            {/* Mensagem dinâmica com fade */}
            <p className="text-xs text-slate-400 font-mono max-w-sm mt-2 tracking-wide leading-relaxed animate-pulse">
              {scanMessage}
            </p>

            <div className="w-48 bg-slate-800 h-1 rounded-full overflow-hidden mt-6">
              <div className="bg-[#40C9AD] h-full w-2/3 animate-progress-glow rounded-full"></div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
