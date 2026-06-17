"use client";

/**
 * SkillQuest - Next.js "Trilhas" Tab Screen (page.tsx)
 * Renders the primary learning walkthrough playground.
 * 
 * Features:
 * - Interactive multi-column dashboard.
 * - Left pane: Chronological skill progression tree with gamification checkboxes.
 * - Right pane: Technical specs, including item categorization, extracted colors, and Live IA mentor.
 */

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, PlayCircle, BookOpen, Compass, 
  Palette, MessageSquare, Send, Trophy, Flame, 
  ChevronRight, ArrowRight, Sparkles, HelpCircle 
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  summary: string;
  completed: boolean;
  xpReward: number;
}

interface ColorPalette {
  hex: string;
  name: string;
  psychology: string;
  usage: string;
}

interface Pathway {
  id: string;
  materialName: string;
  category: string;
  complexity: string;
  estimatedTime: string;
  justifiedPedagogy: string;
  colors: ColorPalette[];
  topics: Topic[];
  roadmap: {
    primary: string[];
    secondary: string[];
    advanced: string[];
  };
}

export default function TrilhasNextJSPage() {
  // Mock data for initial hydration representation - replaces with Fetch / Django API calls
  const [activePathway, setActivePathway] = useState<Pathway | null>({
    id: "pw_9921",
    materialName: "Infográfico - Arquitetura de Microsserviços 3D.png",
    category: "Engenharia de Software & Design 3D",
    complexity: "Intermediário",
    estimatedTime: "5 semanas (60h dedicação)",
    justifiedPedagogy: "Exige conhecimentos conceituais de modelagem poligonal 3D, distribuição espacial de cena, iluminação isométrica com shaders e noções sólidas de backend orientadas a microsserviços para mapear as conexões visuais de forma coerente.",
    colors: [
      { hex: "#40C9AD", name: "Verde SkillQuest", psychology: "Representa frescor, saúde pedagógica e incentivo de progresso rápido.", usage: "Utilizado em todas as conexões neurais e cabos de dados virtuais entre os contêineres 3D." },
      { hex: "#1A202C", name: "Slate Dark", psychology: "Proporciona profundidade, estabilidade extrema e ótimo contraste profissional.", usage: "Cor predominante do espaço de fundo (vazio estelar) do infográfico." },
      { hex: "#F59E0B", name: "Amarelo Alerta", psychology: "Chama a atenção do observador de forma precisa sem poluir a cena.", usage: "Usado para destacar os microsserviços que estão com barramento de fila elevado." }
    ],
    topics: [
      { id: "tp_1", name: "Fundamentos de Modelagem Isométrica", summary: "Estude o posicionamento de câmeras ortográficas em softwares como Blender ou Spline 3D. Crie blocos simétricos alinhados à grade.", completed: true, xpReward: 100 },
      { id: "tp_2", name: "Teoria de Materiais Shaders de Vidro e Plástico", summary: "Configuração de materiais no motor físico de renderização. Aprenda canais difusos, rugosidade de superfície e taxas de refração de luz.", completed: false, xpReward: 100 },
      { id: "tp_3", name: "Mapeamento Topológico de Serviços Web", summary: "Como fatiar conceitualmente um sistema: gateways, servidores do domínio, bancos federados e filas. Entenda como ligar fluxos lógicos.", completed: false, xpReward: 100 },
      { id: "tp_4", name: "Exportação Multimídia e Pós-Processamento", summary: "Configuração de renderizador Cycles ou WebGL. Ajuste do brilho de pixels, aplicação técnica de Bloom nas luzes e compressão otimizada sem perdas.", completed: false, xpReward: 200 }
    ],
    roadmap: {
      primary: ["Fundamentos de Modelagem Isométrica", "Mapeamento Topológico de Serviços Web"],
      secondary: ["Teoria de Materiais Shaders de Vidro e Plástico"],
      advanced: ["Exportação Multimídia e Pós-Processamento"]
    }
  });

  // Gamificação encapsulada da página
  const [xp, setXp] = useState(1450);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(5);
  
  // Abas do menu lateral direito de especificações
  const [activeRightTab, setActiveRightTab] = useState<"resumos" | "cores" | "mentor">("resumos");
  const [selectedTopicInDetail, setSelectedTopicInDetail] = useState<Topic | null>(null);

  // Chat do Mentor
  const [messages, setMessages] = useState([
    { role: "mentor", text: "Olá! Sou seu Mentor IA de Engenharia Reversa. Analisei o infográfico de microsserviços 3D e organizei a melhor ordem pedagógica de estudos para você ser capaz de criar um igual do zero no Blender/Spline! Qual sua primeira dúvida conceitual?" }
  ]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (activePathway && activePathway.topics.length > 0) {
      setSelectedTopicInDetail(activePathway.topics[0]);
    }
  }, [activePathway]);

  // Função para completar tarefas (adiciona XP em tempo real)
  const handleToggleTopic = (topicId: string) => {
    if (!activePathway) return;

    const updatedTopics = activePathway.topics.map(t => {
      if (t.id === topicId) {
        const nextCompletedState = !t.completed;
        // Ajusta XP
        if (nextCompletedState) {
          setXp(prev => {
            const nextXp = prev + t.xpReward;
            if (nextXp >= level * 1000) {
              setLevel(l => l + 1);
              return nextXp - (level * 1000);
            }
            return nextXp;
          });
        } else {
          setXp(prev => Math.max(0, prev - t.xpReward));
        }
        return { ...t, completed: nextCompletedState };
      }
      return t;
    });

    setActivePathway({ ...activePathway, topics: updatedTopics });
    
    // Atualiza o tópico em foco caso seja o mesmo
    const modified = updatedTopics.find(t => t.id === topicId);
    if (modified && selectedTopicInDetail?.id === topicId) {
      setSelectedTopicInDetail(modified);
    }
  };

  const handleSendMessage = () => {
    if (!newMsg.trim()) return;
    const userMsg = { role: "user", text: newMsg };
    setMessages(prev => [...prev, userMsg]);
    setNewMsg("");

    // Resposta Simulada Científica do Mentor baseada no contexto do Walkthrough
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "mentor",
        text: `Com certeza! Levando em consideração que sua trilha de prioridade atual envolve os '${selectedTopicInDetail?.name || "Fundamentos"}', recomendo fortemente verificar a documentação oficial sobre iluminação isométrica. No Blender, você pode obter efeitos de destaque volumétricos adicionando Spotlights com canais de cores específicos à cena para acentuar a direção física dos barramentos.`
      }]);
    }, 1200);
  };

  if (!activePathway) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 min-h-screen bg-slate-50 font-sans">
        <Sparkles className="animate-spin w-12 h-12 text-[#40C9AD] mb-4" />
        <p className="text-lg">Carregue um arquivo no Hub para inicializar sua arena de estudos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Header dos Indicadores de Gamificação */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-100 px-8 py-4 z-10 flex flex-wrap justify-between items-center gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#40C9AD]">SkillQuest Arena</span>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Trilha Ativa: <span className="text-slate-600 font-medium text-lg">{activePathway.materialName}</span>
          </h1>
        </div>

        {/* Widgets Compactos */}
        <div className="flex items-center gap-6">
          {/* Streak de Ofensiva */}
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100 text-sm font-bold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak} Dias Seguidos</span>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-2 bg-[#40C9AD]/10 text-[#40C9AD] px-3.5 py-1.5 rounded-lg border border-[#40C9AD]/20 font-bold text-sm">
            <Trophy className="w-4 h-4" />
            <span>Nível {level}</span>
          </div>

          {/* XP Progress Bar */}
          <div className="w-56 flex flex-col gap-1">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>XP do Nível</span>
              <span>{xp} / {level * 1000} XP</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#40C9AD] h-full transition-all duration-500 ease-out"
                style={{ width: `${(xp / (level * 1000)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Central em 2 Colunas */}
      <main className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA - ÁRVORE DE HABILIDADES & ROADMAP (7/12 de largura) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#40C9AD]/10 p-2.5 rounded-xl">
                  <Compass className="w-5 h-5 text-[#40C9AD]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Caminho Digital de Estudos</h2>
                  <p className="text-xs text-slate-400">Clique nas missões para dominar tópicos e ganhar XP</p>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1 rounded-full">
                Estágio {activePathway.complexity}
              </span>
            </div>

            {/* Linha do Tempo / Timeline Interativa */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:bg-slate-100 before:w-0.5 before:pointer-events-none before:z-0">
              {activePathway.topics.map((topic, index) => {
                const isSelected = selectedTopicInDetail?.id === topic.id;
                return (
                  <div 
                    key={topic.id} 
                    className={`flex gap-4 relative z-10 p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected ? "bg-slate-50/80 border border-slate-200/50" : "hover:bg-slate-50/50"
                    }`}
                    onClick={() => setSelectedTopicInDetail(topic)}
                  >
                    {/* Checkbox em formato de círculo RPG */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTopic(topic.id);
                      }}
                      className="focus:outline-none flex-shrink-0 z-10"
                    >
                      {topic.completed ? (
                        <div className="w-10 h-10 rounded-full bg-[#40C9AD] border-2 border-white shadow-md shadow-[#40C9AD]/20 flex items-center justify-center text-white scale-105 transition-transform">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#40C9AD] hover:text-[#40C9AD] transition-all">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                      )}
                    </button>

                    {/* Dados da Lição */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className={`font-bold text-sm md:text-base leading-snug transition-colors ${
                          topic.completed ? "text-slate-400 line-through" : "text-slate-800"
                        }`}>
                          {topic.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-[#40C9AD] bg-[#40C9AD]/5 px-2 py-0.5 rounded flex-shrink-0">
                          +{topic.xpReward} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{topic.summary}</p>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 self-center text-slate-300 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROADMAP ORDENADO DE PRIORIDADES */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Roteiro de Foco Técnico (Roadmap)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Prioridade Primária */}
              <div className="bg-rose-50/40 border border-rose-100/30 p-4 rounded-xl">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block mb-2">1. Primário</span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activePathway.roadmap.primary.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prioridade Secundária */}
              <div className="bg-amber-50/40 border border-amber-100/30 p-4 rounded-xl">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-2">2. Secundário</span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activePathway.roadmap.secondary.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prioridade Avançada */}
              <div className="bg-indigo-50/40 border border-indigo-100/30 p-4 rounded-xl">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-2">3. Avançado</span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activePathway.roadmap.advanced.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* COLUNA DIREITA - ABAS DE SUPORTE COGNITIVO (5/12 de largura) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col h-[520px]">
            
            {/* Headers das abas de detalhes */}
            <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setActiveRightTab("resumos")}
                className={`py-3.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeRightTab === "resumos" 
                    ? "border-[#40C9AD] text-[#40C9AD] bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Resumos
              </button>

              <button 
                onClick={() => setActiveRightTab("cores")}
                className={`py-3.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeRightTab === "cores" 
                    ? "border-[#40C9AD] text-[#40C9AD] bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Cores Ext.
              </button>

              <button 
                onClick={() => setActiveRightTab("mentor")}
                className={`py-3.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeRightTab === "mentor" 
                    ? "border-[#40C9AD] text-[#40C9AD] bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Mentor IA
              </button>
            </div>

            {/* Conteúdo Ativo da Aba */}
            <div className="flex-1 p-5 overflow-y-auto">
              
              {/* ABA 1: RESUMO DO ASSUNTO SELECIONADO */}
              {activeRightTab === "resumos" && (
                <div className="flex flex-col h-full">
                  {selectedTopicInDetail ? (
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#40C9AD]/90 bg-[#40C9AD]/5 px-2.5 py-1 rounded-md">
                            Ficha Conceitual
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Recompensa: {selectedTopicInDetail.xpReward} XP
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-2">
                          {selectedTopicInDetail.name}
                        </h3>
                        <div className="bg-slate-50 rounded-xl p-4 text-xs md:text-sm text-slate-600 leading-relaxed border border-slate-100">
                          {selectedTopicInDetail.summary}
                        </div>
                        
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Justificativa Pedagógica para a Trilha</h4>
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                            &ldquo;{activePathway.justifiedPedagogy}&rdquo;
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleToggleTopic(selectedTopicInDetail.id)}
                        className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                          selectedTopicInDetail.completed 
                            ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                            : "bg-[#40C9AD] hover:bg-[#34b096] text-white shadow-md shadow-[#40C9AD]/15"
                        }`}
                      >
                        <PlayCircle className="w-4 h-4" />
                        {selectedTopicInDetail.completed ? "Desmarcar do Histórico" : "Marcar como Estudado!"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <HelpCircle className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="text-xs">Selecione um assunto na árvore à esquerda para ver os detalhes conceituais.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 2: PALETA DE CORES EXTRAÍDA */}
              {activeRightTab === "cores" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500">
                      Nosso motor multimodal analisou as propriedades cromáticas do arquivo enviado e mapeou como elas interagem psicologicamente com o design da peça.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {activePathway.colors.map((color, index) => (
                      <div key={index} className="flex gap-4 items-start bg-white p-3 rounded-xl border border-slate-100 hover:shadow-xs transition-shadow">
                        <div 
                          className="w-10 h-10 rounded-lg flex-shrink-0 border border-slate-200 shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{color.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{color.hex}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            <span className="font-bold text-slate-600">Aplicação:</span> {color.usage}
                          </p>
                          <p className="text-[11px] text-slate-400 italic mt-0.5">
                            {color.psychology}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 3: CHAT COM MENTOR IA */}
              {activeRightTab === "mentor" && (
                <div className="flex flex-col h-full justify-between gap-4">
                  {/* Lista de mensagens */}
                  <div className="flex-1 space-y-3 p-1 overflow-y-auto max-h-[340px]">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${
                          m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">
                          {m.role === "user" ? "Você" : "Mentor IA"}
                        </span>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          m.role === "user" 
                            ? "bg-[#40C9AD] text-white rounded-tr-none" 
                            : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input do Chat */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Diga: 'Como funciona render isométrica?'..."
                      className="flex-1 bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#40C9AD] transition-colors"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-[#40C9AD] hover:bg-[#34b096] text-white p-2.5 rounded-xl transition-all shadow-md shadow-[#40C9AD]/10 flex items-center justify-center flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
