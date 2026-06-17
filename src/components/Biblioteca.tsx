import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Upload, 
  FileText, 
  Clock, 
  ArrowUpRight, 
  Palette, 
  Search, 
  Library,
  ArrowLeft,
  CheckCircle2,
  Award,
  Sparkles,
  Play,
  MessageSquare
} from "lucide-react";
import { LibraryMaterial } from "../types";

interface BibliotecaProps {
  // Lista de materiais que vem do aplicativo principal
  materials: LibraryMaterial[];
  // Callback para quando quiser carregar no aplicativo o percurso de estudos do material
  onLoadStudies: (materialId: string) => void;
  // Material ativo no momento nas trilhas
  activeMaterialId?: string;
  // Callback opcional do pai para processamento real de arquivos
  onProcessFile?: (file: File) => void;
  // Callback para trocar a aba ativa para "trilhas" e visualizar os estudos carregados
  setActiveTab: (tab: "hub" | "trilhas" | "arquivos" | "status") => void;
}

// Item de tópico de estudo com conclusão reativa
export interface StudyTopicItem {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
  description: string;
}

// Assunto de estudo estruturado para visualização na biblioteca
interface SubjectStudy {
  id: string;
  name: string;
  category: string; // Ex: "Design UI/UX", "Design 3D", "Identidade Visual", "Outros Assuntos"
  progress: number; // Porcentagem (0-100)
  lastAccessed: string; // Ex: "Último acesso: ontem"
  estimatedHours: string;
  materialId?: string; // Ligação opcional com upload de material
  topicsCount: number;
  topics: StudyTopicItem[]; // Lista detalhada de estudos associados
}

export default function Biblioteca({
  materials,
  onLoadStudies,
  activeMaterialId,
  onProcessFile,
  setActiveTab
}: BibliotecaProps) {
  // 1. Estados Locais de Gerenciamento de Arquivos, Filtros e Aba de Detalhes
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDesignTags, setActiveDesignTags] = useState<string[]>([
    "Design UI/UX", 
    "Design 3D", 
    "Identidade Visual"
  ]);
  
  // Estado para armazenar o ID do assunto atualmente aberto no redirecionamento/tela de detalhes
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Referência para o File Input invisível de Upload do topo
  const topFileInputRef = useRef<HTMLInputElement>(null);

  // Lista de assuntos pré-cadastrados recalibrada para incluir os tópicos e status
  const [subjects, setSubjects] = useState<SubjectStudy[]>([
    {
      id: "sub_01",
      name: "Modelagem Isométrica de Cenários no Blender",
      category: "Design 3D",
      progress: 75,
      lastAccessed: "Último acesso: ontem",
      estimatedHours: "12 horas restantes",
      materialId: "mat_01",
      topicsCount: 4,
      topics: [
        { id: "t1_1", title: "Introdução à interface e navegação 3D no Blender", completed: true, xpReward: 100, description: "Aprenda a rotacionar, transladar e escalar objetos usando atalhos de alta produtividade." },
        { id: "t1_2", title: "Configuração de câmera isométrica estrita (escala orthographic)", completed: true, xpReward: 120, description: "Configure as proporções perfeitas de câmera para obter visualizações isométricas limpas." },
        { id: "t1_3", title: "Modelagem poligonal básica das paredes e mobília do cômodo", completed: true, xpReward: 130, description: "Criação de armários, mesas e cadeiras de estilo low-poly a partir de cubos simples." },
        { id: "t1_4", title: "Iluminação básica de três pontos e filtros de Render no Cycles", completed: false, xpReward: 200, description: "Adicione luzes pontuais de destaque e configure oclusão de ambiente e sombras suaves." }
      ]
    },
    {
      id: "sub_02",
      name: "Arquitetura e Contraste Sutil no BentoGrid UI",
      category: "Design UI/UX",
      progress: 50,
      lastAccessed: "Acessado há 2 dias",
      estimatedHours: "8 horas restantes",
      materialId: "mat_02",
      topicsCount: 4,
      topics: [
        { id: "t2_1", title: "O que é Grid Layout e o conceito de Bento Box moderno", completed: true, xpReward: 100, description: "Análise visual sobre a divisão assimétrica ordenada e fluxo em blocos." },
        { id: "t2_2", title: "Definição de gaps proporcionais e paddings com regra de 8px", completed: true, xpReward: 120, description: "Organize as margens internas de acordo com escalas de grids harmoniosos." },
        { id: "t2_3", title: "Contraste tipográfico e hierarquia visual de leitura humana", completed: false, xpReward: 110, description: "Combinação correta de títulos pretos display e textos secundários de apoio." },
        { id: "t2_4", title: "Uso inteligente de sombras internas suaves e bordas de 1px", completed: false, xpReward: 150, description: "Criação de relevos minimalistas com bordas semi-transparentes de design." }
      ]
    },
    {
      id: "sub_03",
      name: "Escala Cromática Harmônica e Leituras de Acessibilidade",
      category: "Design UI/UX",
      progress: 66,
      lastAccessed: "Acessado há 3 dias",
      estimatedHours: "1 hora restante",
      topicsCount: 3,
      topics: [
        { id: "t3_1", title: "Teoria das cores: cores análogas, complementares e tríades", completed: true, xpReward: 100, description: "Definição matemática de esquemas cromáticos que encantam o olho do usuário." },
        { id: "t3_2", title: "Cálculos de taxas de contraste da WCAG para tipografia", completed: true, xpReward: 150, description: "Use algoritmos de acessibilidade para garantir conformidade AA e AAA." },
        { id: "t3_3", title: "Criação de paletas acessíveis e tokens de design no Figma", completed: false, xpReward: 120, description: "Configuração de biblioteca reativa de cores prontas para transição ao código." }
      ]
    },
    {
      id: "sub_04",
      name: "Sistemas de Design: Componentes Reutilizáveis e Variantes",
      category: "Design UI/UX",
      progress: 20,
      lastAccessed: "Acessado há 1 semana",
      estimatedHours: "15 horas restantes",
      topicsCount: 5,
      topics: [
        { id: "t4_1", title: "Arquitetura atômica de design: átomos até organismos complexos", completed: true, xpReward: 100, description: "Desmonte uma interface em componentes mínimos funcionais e reutilizáveis." },
        { id: "t4_2", title: "Componentização e estados interativos (hover, active e disabled)", completed: false, xpReward: 120, description: "Desenhe botões mestre dinâmicos com todas as suas variantes de uso." },
        { id: "t4_3", title: "Configuração de campos de formulário e inputs responsivos", completed: false, xpReward: 130, description: "Mapeamento de caixas de entrada robustas que respondem a erros de digitação." },
        { id: "t4_4", title: "Gerenciamento e publicação de bibliotecas compartilhadas", completed: false, xpReward: 150, description: "Publique pacotes de design facilitando revisões iterativas da equipe." },
        { id: "t4_5", title: "Documentação técnica de tokens de design em JSON", completed: false, xpReward: 200, description: "Conecte as medidas do Figma diretamente com variáveis CSS em produção." }
      ]
    },
    {
      id: "sub_05",
      name: "Composição de Shaders Holográficos e Texturas de Vidro",
      category: "Design 3D",
      progress: 66,
      lastAccessed: "Último acesso: anteontem",
      estimatedHours: "6 horas restantes",
      topicsCount: 3,
      topics: [
        { id: "t5_1", title: "Fundamentos físicos de reflexão, refração e canal Alpha", completed: true, xpReward: 120, description: "Comportamento da refração da luz sobre superfícies curvas transparentes de alta fidelidade." },
        { id: "t5_2", title: "Conexões matemáticas no Node Editor do Blender para specular", completed: true, xpReward: 150, description: "Mescle Shaders difusos e brilhantes usando mapas de relevo sutil." },
        { id: "t5_3", title: "Configuração do efeito Fresnel e brilho de neon inclinado", completed: false, xpReward: 180, description: "Aplique o clássico brilho holográfico fluorescente nas arestas visíveis." }
      ]
    },
    {
      id: "sub_06",
      name: "Manual de Branding: Logotipos Responsivos e Diretrizes",
      category: "Identidade Visual",
      progress: 25,
      lastAccessed: "Acessado há 4 dias",
      estimatedHours: "10 horas restantes",
      topicsCount: 4,
      topics: [
        { id: "t6_1", title: "Uso estratégico de grades construtivas de proporção áurea", completed: true, xpReward: 100, description: "Regulação matemática para alinhar curvaturas de logotipos abstratos." },
        { id: "t6_2", title: "Redução de ruído e adaptação de favicon para tamanhos mínimos", completed: false, xpReward: 120, description: "Desenhe variações minimalistas visíveis em resoluções de 16x16px." },
        { id: "t6_3", title: "Combinação ergonômica de fontes corporativas e suporte", completed: false, xpReward: 130, description: "Escolha pesos de leitura consistentes para mídias impressas e digitais." },
        { id: "t6_4", title: "Regras rígidas de áreas de proteção e aplicação em fundos", completed: false, xpReward: 160, description: "Defina margens de segurança para evitar poluição visual de marcas parceiras." }
      ]
    },
    {
      id: "sub_07",
      name: "Banco de Dados Relacionais e Engenharia SQL",
      category: "Outros Assuntos",
      progress: 20,
      lastAccessed: "Acessado há 12 dias",
      estimatedHours: "18 horas restantes",
      topicsCount: 5,
      topics: [
        { id: "t7_1", title: "Modelagem de relacionamentos entidade-atributo (DER)", completed: false, xpReward: 100, description: "Desenho estrutural de chaves primárias (PK) e estrangeiras (FK)." },
        { id: "t7_2", title: "Consultas de seleção complexas utilizando junções JOIN", completed: false, xpReward: 125, description: "Filtros avançados e combinatórias de tabelas com JOIN, GROUP BY e HAVING." },
        { id: "t7_3", title: "Normalização estrutural: as três primeiras Formas Normais", completed: false, xpReward: 130, description: "Mapeamento rigoroso para evitar duplicidades críticas e anomalias de escrita." },
        { id: "t7_4", title: "Otimização de consultas lentas usando EXPLAIN e índices", completed: false, xpReward: 190, description: "Identifique gargalos de varredura mecânica de dados em tabelas volumosas." },
        { id: "t7_5", title: "Uso correto de integridade transacional e rollback", completed: true, xpReward: 150, description: "Proteja os dados em lotes revertendo alterações parciais em caso de falhas." }
      ]
    },
    {
      id: "sub_08",
      name: "Python Pandas e Tratamento Científico de Dados",
      category: "Outros Assuntos",
      progress: 16,
      lastAccessed: "Acessado há 2 semanas",
      estimatedHours: "30 horas restantes",
      topicsCount: 6,
      topics: [
        { id: "t8_1", title: "Instalação do ecossistema Anaconda e Jupyter Notebooks", completed: true, xpReward: 100, description: "Setup completo de ambientes virtuais python para análise de dados." },
        { id: "t8_2", title: "Conexão e carregamento de planilhas e grandes arquivos", completed: false, xpReward: 110, description: "Manipule volumes densos de planilhas Excel, CSVs e bancos corporativos." },
        { id: "t8_3", title: "Técnicas estatísticas para tratamento de dados vazios", completed: false, xpReward: 130, description: "Utilize preenchimentos de médias móveis ou remoção segura de dados corrompidos." },
        { id: "t8_4", title: "Agrupamento de informações categóricas e tabelas dinâmicas", completed: false, xpReward: 150, description: "Aprenda a rotacionar tabelas, calcular desvios padrões e consolidar somas." },
        { id: "t8_5", title: "Análise visual de correlações estatísticas com Seaborn", completed: false, xpReward: 170, description: "Desenhe mapas de calor cromáticos e gráficos de dispersão multivariados." },
        { id: "t8_6", title: "Exportação de relatórios finais consolidados em formatos limpos", completed: false, xpReward: 190, description: "Entregue dados saneados prontos para alimentar pipelines de BI de produção." }
      ]
    }
  ]);

  // Sincroniza dinamicamente os novos uploads da IA no App principal estruturando temas/tópicos reativos
  useEffect(() => {
    const existingMaterialIds = subjects.map(s => s.materialId).filter(Boolean);
    
    const newSubjectsToAppend: SubjectStudy[] = [];
    materials.forEach(m => {
      if (m.id && !existingMaterialIds.includes(m.id)) {
        let resolvedCategory = "Outros Assuntos";
        const catLower = (m.category || "").toLowerCase();
        
        if (catLower.includes("ui") || catLower.includes("ux") || catLower.includes("interface")) {
          resolvedCategory = "Design UI/UX";
        } else if (catLower.includes("3d") || catLower.includes("blender") || catLower.includes("render")) {
          resolvedCategory = "Design 3D";
        } else if (catLower.includes("identidade") || catLower.includes("branding") || catLower.includes("visual") || catLower.includes("ilustração")) {
          resolvedCategory = "Identidade Visual";
        } else if (catLower.includes("design") || catLower.includes("designer")) {
          resolvedCategory = "Design UI/UX";
        }

        const nameClean = m.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

        newSubjectsToAppend.push({
          id: `sub_dyn_${m.id}`,
          name: nameClean,
          category: resolvedCategory,
          progress: 25, // Começa com um tema inicial conceitual concluído para incentivar
          lastAccessed: "Adicionado recentemente",
          estimatedHours: "4 semanas (Trilha Ativa)",
          materialId: m.id,
          topicsCount: 4,
          topics: [
            { id: `dyn_t_${m.id}_1`, title: `Conceitos elementares e visão estrutural de ${nameClean}`, completed: true, xpReward: 100, description: "Exploração conceitual detalhada extraída pela IA para dar base teórica de estudos." },
            { id: `dyn_t_${m.id}_2`, title: `Decomposição dos temas essenciais e design system`, completed: false, xpReward: 120, description: "Estudo analítico focado na organização lógica das variantes e componentes do material." },
            { id: `dyn_t_${m.id}_3`, title: `Laboratório prático de reprodução e exercícios assistidos`, completed: false, xpReward: 150, description: "Pratique ativamente modelando ou codificando o protótipo correspondente do zero." },
            { id: `dyn_t_${m.id}_4`, title: `Saneamento de dúvidas técnica com Mentor Gamificado`, completed: false, xpReward: 200, description: "Bate-papo contextualizado no chat para responder dúvidas e consolidar seu progresso." }
          ]
        });
      }
    });

    if (newSubjectsToAppend.length > 0) {
      setSubjects(prev => [...newSubjectsToAppend, ...prev]);
    }
  }, [materials]);

  // Função para alternar a conclusão de um tópico e atualizar a barra de progresso em tempo real
  const handleToggleTopic = (subjectId: string, topicId: string) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === subjectId) {
        const updatedTopics = sub.topics.map(topic => {
          if (topic.id === topicId) {
            return { ...topic, completed: !topic.completed };
          }
          return topic;
        });

        // Calcula a nova porcentagem baseada em tópicos completados
        const completedCount = updatedTopics.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / updatedTopics.length) * 100);

        return {
          ...sub,
          progress: newProgress,
          topics: updatedTopics
        };
      }
      return sub;
    }));
  };

  // Gatilho para abrir o file upload nativo do topo
  const handleTopUploadButtonClick = () => {
    if (topFileInputRef.current) {
      topFileInputRef.current.click();
    }
  };

  // Trata arquivo carregado do topo gerando tópicos completos instantaneamente para interatividade
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (onProcessFile) {
        onProcessFile(files[0]);
      } else {
        const file = files[0];
        const newSubId = `sub_loc_${Date.now()}`;
        const nameClean = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        const isDesignFile = file.name.toLowerCase().includes("design") || file.name.toLowerCase().includes("figma") || file.name.toLowerCase().includes("ui") || file.name.toLowerCase().includes("ux");
        
        const newSubject: SubjectStudy = {
          id: newSubId,
          name: nameClean,
          category: isDesignFile ? "Design UI/UX" : "Outros Assuntos",
          progress: 25,
          lastAccessed: "Acessado agora mesmo",
          estimatedHours: "Estimando carga horária...",
          topicsCount: 4,
          topics: [
            { id: `${newSubId}_1`, title: "Engenharia Reversa conceitual do arquivo", completed: true, xpReward: 100, description: "Extração automatizada de paletas cromáticas e mapeamento de componentes de interface." },
            { id: `${newSubId}_2`, title: "Estudo analítico do layout e grid proporcional", completed: false, xpReward: 120, description: "Explicação prática abordando paddings, gaps e proporções simétricas de render." },
            { id: `${newSubId}_3`, title: "Recriação experimental assistida por IA", completed: false, xpReward: 140, description: "Mão na massa: replique passo a passo o conteúdo deste arquivo de demonstração." },
            { id: `${newSubId}_4`, title: "Testes conceituais e quiz de aprendizado ativo", completed: false, xpReward: 180, description: "Valide seu conhecimento resolvendo desafios do Mentor de Chat gamificado." }
          ]
        };
        setSubjects(prev => [newSubject, ...prev]);
        setSelectedSubjectId(newSubId); // Redireciona diretamente para o novo assunto carregado!
      }
    }
  };

  // Alterna as tags ativas de design
  const toggleDesignTag = (tag: string) => {
    if (activeDesignTags.includes(tag)) {
      setActiveDesignTags(prev => prev.filter(t => t !== tag));
    } else {
      setActiveDesignTags(prev => [...prev, tag]);
    }
  };

  // Filtra assuntos pelo Search Term
  const searchedSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Classificação dos assuntos nas suas devidas Categorias Reativas de Design
  const designGroupedSubjects: { [key: string]: SubjectStudy[] } = {};
  const otherGroupedSubjects: SubjectStudy[] = [];

  activeDesignTags.forEach(tag => {
    designGroupedSubjects[tag] = [];
  });

  searchedSubjects.forEach(sub => {
    if (activeDesignTags.includes(sub.category)) {
      designGroupedSubjects[sub.category].push(sub);
    } else {
      otherGroupedSubjects.push(sub);
    }
  });

  // =========================================================================
  // TELA DESIGNADA DE DETALHES DO ASSUNTO (REDirecionamento de Card Clicado)
  // =========================================================================
  if (selectedSubjectId) {
    const activeSubject = subjects.find(s => s.id === selectedSubjectId);
    
    // Fallback de segurança se o assunto não existir em memória
    if (!activeSubject) {
      setSelectedSubjectId(null);
      return null;
    }

    const completedTopicsCount = activeSubject.topics.filter(t => t.completed).length;
    const totalTopicsCount = activeSubject.topics.length;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
        id={`subject-details-${activeSubject.id}`}
      >
        {/* Barra Superior de Navegação / Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <button 
            id="btn-back-to-library"
            onClick={() => setSelectedSubjectId(null)}
            className="flex items-center gap-2 group text-slate-500 hover:text-slate-800 text-xs font-bold transition-all bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#40C9AD]" />
            <span>Voltar para Biblioteca</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Última interação:</span>
            <span className="text-slate-600 font-semibold">{activeSubject.lastAccessed}</span>
          </div>
        </div>

        {/* Header e Foco do Assunto Selecionado */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#40C9AD]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 max-w-3xl relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[#40C9AD] bg-[#40C9AD]/10 border border-[#40C9AD]/20 px-3 py-1 rounded-full text-[10px] uppercase font-mono font-black tracking-wider">
              <Sparkles className="w-3 h-3 animate-pulse" />
              {activeSubject.category}
            </span>

            <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight leading-tight">
              {activeSubject.name}
            </h1>

            <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
              Trilha de estudos estruturada em tópicos progressivos elaborados pelo motor de IA do SkillQuest. Complete cada módulo abaixo para acumular experiência e dominar os conceitos práticos do assunto.
            </p>

            {/* Dashboard / Mini Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 mt-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Progresso Geral</span>
                <span className="font-display font-black text-lg text-white flex items-center gap-1.5">
                  <span className="text-[#40C9AD]">{activeSubject.progress}%</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Status dos Módulos</span>
                <span className="font-display font-bold text-sm text-slate-200">
                  {completedTopicsCount} de {totalTopicsCount} concluídos
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tempo Recomendado</span>
                <span className="font-display font-bold text-sm text-slate-200">
                  {activeSubject.estimatedHours}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">XP Total Disponível</span>
                <span className="font-display font-bold text-sm text-[#40C9AD] flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  +{activeSubject.topics.reduce((acc, curr) => acc + curr.xpReward, 0)} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Corpo: Grade de Tópicos (Esquerda) e Painel de Conclusão Visual (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Listagem de Tópicos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-sm uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <span>Roteiro de Missões e Tópicos</span>
              </h2>
              <span className="text-[10px] text-slate-450 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                Clique em qualquer módulo para alternar o progresso
              </span>
            </div>

            <div className="space-y-3">
              {activeSubject.topics.map((topic, idx) => {
                return (
                  <div 
                    key={topic.id}
                    onClick={() => handleToggleTopic(activeSubject.id, topic.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none group flex items-start justify-between gap-4 ${
                      topic.completed 
                        ? "bg-[#40C9AD]/5 border-[#40C9AD]/25" 
                        : "bg-white border-slate-100 hover:border-slate-250/70 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox Reativo */}
                      <button 
                        type="button"
                        className="mt-0.5 focus:outline-hidden"
                      >
                        {topic.completed ? (
                          <div className="bg-[#40C9AD] text-white p-0.5 rounded-full shadow-md shadow-[#40C9AD]/30 transition-transform hover:scale-110">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-5.5 h-5.5 rounded-full border-2 border-slate-350 transition-colors group-hover:border-[#40C9AD] hover:scale-105" />
                        )}
                      </button>

                      {/* Conteúdo Informativo */}
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-mono text-[10px] font-extrabold text-[#40C9AD] uppercase tracking-wider">
                            Passo {idx + 1}
                          </span>
                          
                          {/* Feedback de conclusão visual direto */}
                          {topic.completed ? (
                            <span className="bg-[#40C9AD]/15 text-teal-800 font-extrabold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#40C9AD]/15">
                              Concluído
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 font-extrabold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-md">
                              Pendente
                            </span>
                          )}
                        </div>

                        <h4 className={`font-display font-bold text-xs md:text-sm text-slate-800 group-hover:text-[#40C9AD] transition-colors ${
                          topic.completed ? "line-through text-slate-450" : ""
                        }`}>
                          {topic.title}
                        </h4>

                        <p className={`text-xs text-slate-400 leading-relaxed ${
                          topic.completed ? "text-slate-350" : ""
                        }`}>
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    {/* Recompensa XP Visual */}
                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] font-mono font-black inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                        topic.completed 
                          ? "bg-[#40C9AD]/10 text-teal-800" 
                          : "bg-slate-50 text-slate-450 border border-slate-100"
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        +{topic.xpReward} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Card de Resumo de Conclusão / CTA */}
          <div className="space-y-6">
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-6 text-slate-800">
              <h3 className="font-display font-extrabold text-sm text-slate-800 tracking-tight uppercase border-b border-slate-200 pb-3">
                Progresso Visual
              </h3>

              {/* Progress Gauges e Feedbacks */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Conclusão da Trilha</span>
                  <span className="text-slate-800 font-bold">{activeSubject.progress}%</span>
                </div>
                
                {/* Barra de Progresso Horizontal Ampliada em Tailwind CSS */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    style={{ width: `${activeSubject.progress}%` }}
                    className="h-full bg-[#40C9AD] rounded-full transition-all duration-500 shadow-xs shadow-[#40C9AD]/50"
                  />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Todos os tópicos são monitorados em tempo real. Ao concluir os desafios práticos, marque o progresso para ver a porcentagem crescer e sua barra se iluminar!
                </p>
              </div>

              {/* Integração Ativa no Aplicativo */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => {
                    if (activeSubject.materialId) {
                      onLoadStudies(activeSubject.materialId);
                    } else {
                      onLoadStudies("mat_01");
                    }
                    setActiveTab("trilhas");
                  }}
                  className="w-full bg-[#40C9AD] hover:bg-[#32b298] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                  <span>Integrar à trilha</span>
                </button>

                <button
                  onClick={() => {
                    if (activeSubject.materialId) {
                      onLoadStudies(activeSubject.materialId);
                    } else {
                      onLoadStudies("mat_01");
                    }
                    setActiveTab("trilhas");
                  }}
                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-slate-100 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#40C9AD]" />
                  <span>Interagir com IA Tutora</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Conecte o assunto à sua trilha principal de aprendizagem ou envie perguntas em tempo real para a IA Tutora especializada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // CORPO PADRÃO DA PLATAFORMA (TELA PRINCIPAL DA BIBLIOTECA)
  // =========================================================================
  return (
    <div className="space-y-8" id="biblioteca-root">
      {/* 1. SEÇÃO DO CABEÇALHO (Header com Título e Botão de Upload Minimalista) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-[#40C9AD]" />
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight">Biblioteca</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Consulte seus assuntos de estudos categorizados por tags de design e acompanhe o progresso das suas trilhas e percursos.
          </p>
        </div>

        {/* Botão de Upload Minimalista estritamente no topo */}
        <div className="relative">
          <input 
            type="file" 
            ref={topFileInputRef}
            onChange={handleLocalFileChange}
            accept="image/*,application/pdf,text/plain"
            className="hidden"
          />
          <button 
            id="btn-upload-biblioteca"
            onClick={handleTopUploadButtonClick}
            className="flex items-center gap-2 bg-[#40C9AD] hover:bg-[#32b298] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#40C9AD]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span>Fazer Upload Técnico</span>
          </button>
        </div>
      </div>

      {/* 2. ÁREA DE PESQUISA & SELETORES DE CAPACIDADES / TAGS */}
      <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Barra de Pesquisa */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Pesquisar por assunto ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-250/60 bg-white text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#40C9AD]/20 focus:border-[#40C9AD] transition-all"
          />
        </div>

        {/* Categorização por Tag de Design Reativas */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mr-1">
            <Palette className="w-3.5 h-3.5" />
            Tags de Design:
          </span>
          {["Design UI/UX", "Design 3D", "Identidade Visual"].map(tag => {
            const isSelected = activeDesignTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleDesignTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                  isSelected 
                    ? "bg-slate-900 border-slate-900 text-[#40C9AD]" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GRID E CATEGORIZAÇÃO CRONOLÓGICA */}
      <div className="space-y-10">
        {/* Renderiza Categorias de Design */}
        {activeDesignTags.map(tag => {
          const catSubjects = designGroupedSubjects[tag] || [];
          if (catSubjects.length === 0) return null;

          return (
            <div key={tag} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-[#40C9AD]"></div>
                <h2 className="font-display font-extrabold text-sm text-slate-800 tracking-tight uppercase">
                  {tag}
                </h2>
                <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {catSubjects.length} {catSubjects.length === 1 ? "assunto" : "assuntos"}
                </span>
              </div>

              {/* Grid de Cards da Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catSubjects.map(sub => (
                  <SubjectCard 
                    key={sub.id} 
                    subject={sub} 
                    onSelectSubject={setSelectedSubjectId}
                    isActive={activeMaterialId === sub.materialId}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Seção Secundária: Outros Assuntos (Não relacionados às tags de design ativas) */}
        {otherGroupedSubjects.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-slate-300"></div>
              <h2 className="font-display font-extrabold text-sm text-slate-400 tracking-tight uppercase">
                Outros Assuntos de Referência
              </h2>
              <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                {otherGroupedSubjects.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherGroupedSubjects.map(sub => (
                <SubjectCard 
                  key={sub.id} 
                  subject={sub} 
                  onSelectSubject={setSelectedSubjectId}
                  isActive={activeMaterialId === sub.materialId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Estado Reativo Vazio */}
        {searchedSubjects.length === 0 && (
          <div className="py-20 text-center bg-white border border-dashed border-slate-250/70 rounded-2xl flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-display font-extrabold text-base text-slate-800">Nenhum assunto encontrado</h3>
            <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto leading-relaxed">
              Tente redefinir o termo de pesquisa ou ativar as tags de design acima para mostrar os tópicos de estudos mapeados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ANATOMIA DO CARD DE ASSUNTO (COMPONENTE INTERNO REUTILIZÁVEL)
   ========================================================= */
interface SubjectCardProps {
  key?: string;
  subject: SubjectStudy;
  onSelectSubject: (id: string | null) => void;
  isActive: boolean;
}

function SubjectCard({ subject, onSelectSubject, isActive }: SubjectCardProps) {
  return (
    <div 
      className={`bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between h-[184px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${
        isActive 
          ? "border-[#40C9AD] bg-[#40C9AD]/5 ring-2 ring-[#40C9AD]/10" 
          : "border-slate-100 hover:border-slate-200/80"
      }`}
      onClick={() => {
        onSelectSubject(subject.id); // Redireciona para a tela designada e detalhada do assunto clicado!
      }}
    >
      <div className="space-y-3">
        {/* Categoria Badge & Ícone Sutil */}
        <div className="flex justify-between items-center">
          <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
            subject.category.includes("Design") 
              ? "bg-[#40C9AD]/10 text-teal-800 border border-[#40C9AD]/15" 
              : "bg-slate-100 text-slate-500"
          }`}>
            {subject.category}
          </span>
          
          <div className="text-slate-350 group-hover:text-[#40C9AD] transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Nome do Assunto em Destaque */}
        <h3 className="font-display font-extrabold text-sm text-slate-800 group-hover:text-[#40C9AD] transition-colors leading-snug line-clamp-2">
          {subject.name}
        </h3>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-50">
        {/* Barra de Progresso Horizontal Minimalista */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
            <span>Progresso da Trilha</span>
            <span className="font-bold text-slate-800">{subject.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${subject.progress}%` }}
              className="h-full bg-[#40C9AD] rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Timestamp de Acesso e contagem de tópicos */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-350" />
            <span>{subject.lastAccessed}</span>
          </div>
          <span className="bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-mono">
            {subject.topics.length} tópicos
          </span>
        </div>
      </div>
    </div>
  );
}
