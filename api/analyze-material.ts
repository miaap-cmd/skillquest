const COPILOT_API_URL = process.env.COPILOT_API_URL || "https://models.inference.ai.azure.com/chat/completions";
const COPILOT_MODEL = process.env.COPILOT_MODEL || "Meta-Llama-3.1-8B-Instruct";

function getCopilotApiKey() {
  return process.env.COPILOT_API_KEY || process.env.GITHUB_TOKEN || "";
}

function normalizeJsonPayload(raw: string) {
  const text = raw.trim();
  const withoutFence = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const first = withoutFence.indexOf("{");
  const last = withoutFence.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return withoutFence.slice(first, last + 1);
  }
  return withoutFence;
}

async function callCopilotAPI(messages: Array<{ role: string; content: any }>, temperature = 0.2) {
  const apiKey = getCopilotApiKey();
  if (!apiKey || apiKey.trim() === "") return null;
  const response = await fetch(COPILOT_API_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: COPILOT_MODEL, messages, temperature, max_tokens: 800 })
  });
  if (!response.ok) throw new Error(`Copilot API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function getMockWalkthrough(filename: string) {
  const norm = filename.toLowerCase();
  // Ajusta mocks baseado em nomes comuns sugeridos para ficar interativo e realístico
  const is3D = norm.includes("3d") || norm.includes("blender") || norm.includes("render");
  const isWeb = norm.includes("web") || norm.includes("code") || norm.includes("dev") || norm.includes("html") || norm.includes("js") || norm.includes("css") || norm.includes("react") || norm.includes("frontend");
  const isDB = norm.includes("sql") || norm.includes("banco") || norm.includes("database") || norm.includes("postgres") || norm.includes("prisma");
  const isDataAI = norm.includes("python") || norm.includes("data") || norm.includes("ciencia") || norm.includes("ai") || norm.includes("ia") || norm.includes("model");
  const isDesign = norm.includes("design") || norm.includes("figma") || norm.includes("ui") || norm.includes("ux") || norm.includes("layout");

  if (is3D) {
    return {
      complexity: "Intermediário",
      justifiedPedagogy: `A imagem carrega técnicas avançadas de renderização poligonal, iluminação de três pontos com fontes pontuais e modelagem de superfícies duras (hard-surface) isométricas. É ideal para estudantes que já conhecem o Blender básico e querem evoluir para acabamentos premium.`,
      estimatedTime: "5 semanas (total de 50h de estudos)",
      category: "Design 3D & Render",
      colors: [
        { hex: "#40C9AD", name: "Ciano SkillQuest", psychology: "Sensação de inovação futurista e tranquilidade criativa.", usage: "Utilizado nos glows de iluminação nas bodas externas dos hologramas tridimensionais." },
        { hex: "#E2E8F0", name: "Slate Claro", psychology: "Oferece clareza técnica e neutralidade estrutural impecável.", usage: "Cor dos painéis modulares e bases físicas dos fatiadores." },
        { hex: "#F59E0B", name: "Âmbar Energético", psychology: "Chama a atenção instantânea para pontos cruciais do design.", usage: "Aplicações nos eixos principais de vetorização e contatos." }
      ],
      topics: [
        { name: "Grid Ortogonal e Modelagem Isométrica", summary: "Como configurar câmeras ortográficas para obter perspectiva perfeita. Pratique modelagem modular respeitando subdivisões de grade.", xpReward: 100 },
        { name: "Principais Propriedades de Shading & Materiais", summary: "Estudo sobre canais de reflexo, microfaceting e rugosidade de shaders dielétricos (como plásticos industriais brilhantes) para refletir luz realisticamente.", xpReward: 100 },
        { name: "Esquema Isométrico de Luzes e Ambient Occlusion", summary: "Ajuste de luz de preenchimento, contraluz de bordas (rim light) e geração de sombras suaves com ambient occlusion para assentar o modelo volumétrico.", xpReward: 150 },
        { name: "Efeitos de Pós-Processamento e Glow shader", summary: "Aplicação técnica de bloom nas emissões de luz do renderizador. Configuração de filtros de nitidez e balanço cromático no editor de compositor final.", xpReward: 200 }
      ],
      roadmap: {
        primary: ["Grid Ortogonal e Modelagem Isométrica"],
        secondary: ["Principais Propriedades de Shading & Materiais", "Esquema Isométrico de Luzes e Ambient Occlusion"],
        advanced: ["Efeitos de Pós-Processamento e Glow shader"]
      }
    };
  }

  if (isWeb) {
    return {
      complexity: "Intermediário",
      justifiedPedagogy: `Trata-se de uma interface com bento grid responsiva, micro-interações de estado usando transições CSS/Framer Motion, e dados hidratados em tempo real de APIs REST. Requer proficiência em componentes lógicos do Ecossistema React.`,
      estimatedTime: "4 semanas (cerca de 40h de dedicação)",
      category: "Desenvolvimento Web",
      colors: [
        { hex: "#40C9AD", name: "Verde Água Líquido", psychology: "Promove bem-estar visual, legibilidade excelente e fluidez.", usage: "Utilizado em todos os badges de status ativos e interativos e botões primários." },
        { hex: "#0F172A", name: "Slate Deep Blue", psychology: "Reflete solidez técnica, robustez extrema e conforto para longos períodos de leitura de telas.", usage: "A base dominante do plano de fundo e sidebar fixa do sistema." }
      ],
      topics: [
        { name: "Arquitetura Modular em Bento-Grid", summary: "Aprenda a estruturar layouts de visualizadores elegantes usando sub-grades flexíveis do Tailwind (CSS grid-cols e grid-rows dinâmicos) ideais para dados modernos.", xpReward: 100 },
        { name: "Gerenciamento Reativo de Estados do Usuário", summary: "Estudo sobre hooks lógicos (useState, useEffect) direcionados a guardar o progresso sem gargalos, gerando re-renders controlados e polidos.", xpReward: 100 },
        { name: "Animações Fluídas de Entrada e Saída", summary: "Uso correto do motion lendo transições por mola (spring) para dar sensação física premium ao abrir modais e checklists.", xpReward: 100 },
        { name: "Configuração Full-Stack de Interfaces Seguras", summary: "Implementação de proxies para acionamento de APIs protegidas para preservar chaves sensíveis fora do escopo acessível do cliente.", xpReward: 200 }
      ],
      roadmap: {
        primary: ["Arquitetura Modular em Bento-Grid", "Gerenciamento Reativo de Estados do Usuário"],
        secondary: ["Animações Fluídas de Entrada e Saída"],
        advanced: ["Configuração Full-Stack de Interfaces Seguras"]
      }
    };
  }

  if (isDB) {
    return {
      complexity: "Iniciante",
      justifiedPedagogy: `Focado no armazenamento e estruturação de dados em tabelas relacionais. Essencial para criar aplicações corporativas eficientes com integridade referencial.`,
      estimatedTime: "3 semanas (cerca de 30h de dedicação)",
      category: "Banco de Dados & SQL",
      colors: [
        { hex: "#0284C7", name: "Sky Blue", psychology: "Inspira organização, clareza lógica e fluxo estrutural estável.", usage: "Cor predominante nos diagramas de Entidade-Relacionamento e chaves primárias." },
        { hex: "#10B981", name: "Esmeralda Ativa", psychology: "Transmite validação positiva de transações atômicas e sucesso.", usage: "Utilizado em commits, logs normais e índices otimizados." }
      ],
      topics: [
        { name: "Modelagem Relacional de Dados", summary: "Criação de diagramas entidade-relacionamento (DER). Aprenda como mapear entidades para tabelas com chaves primárias (PK) e estrangeiras (FK).", xpReward: 100 },
        { name: "Manipulação de Dados com DML", summary: "Fique craque nas instruções SELECT, INSERT, UPDATE, DELETE. Pratique projeções, junções (INNER/LEFT JOINS) e filtros complexos.", xpReward: 120 },
        { name: "Normalização e Chaves de Integridade", summary: "Aprenda as três primeiras formas normais (1FN, 2FN, 3FN) para mitigar redundâncias e anomalias de atualização.", xpReward: 130 },
        { name: "Indexação de Tabelas e Otimização de Consultas", summary: "Uso estratégico de indexes e análise de QUERY EXPLAIN para acelerar consultas e poupar recursos servidores.", xpReward: 200 }
      ],
      roadmap: {
        primary: ["Modelagem Relacional de Dados", "Manipulação de Dados com DML"],
        secondary: ["Normalização e Chaves de Integridade"],
        advanced: ["Indexação de Tabelas e Otimização de Consultas"]
      }
    };
  }

  if (isDataAI) {
    return {
      complexity: "Avançado",
      justifiedPedagogy: `Aplicações de Machine Learning, Engenharia de Dados e redes neurais. Requer base matemática e computacional para modelagem estatística robusta.`,
      estimatedTime: "6 semanas (cerca de 65h de dedicação)",
      category: "Inteligência Artificial & Ciência de Dados",
      colors: [
        { hex: "#8B5CF6", name: "Púrpura Cognitiva", psychology: "Associa-se a insights cerebrais, processamento neural e IA.", usage: "Utilizado nas conexões sinápticas da arquitetura do neurônio." },
        { hex: "#F43F5E", name: "Rosa Vetorizado", psychology: "Ativação visual de outliers e perdas estatísticas cruciais.", usage: "Badges de métricas de acurácia, recall e testes de validação." }
      ],
      topics: [
        { name: "Análise de Dados com Python & Pandas", summary: "Tratamento de dados tabulares, dataframes, agregações lógicas e limpeza estatística de dados ruidosos.", xpReward: 120 },
        { name: "Visualização e Estatística Descritiva", summary: "Geração de matrizes de correlação, histogramas, desvios padrão e identificação de outliers com matplotlib e seaborn.", xpReward: 100 },
        { name: "Modelos Predictivos Supervisonados", summary: "Conceitos de Regressão Linear/Logística e Árvores de Decisão. Treinamento de dados e avaliação com métricas MAE e RMSE.", xpReward: 180 },
        { name: "Fundamentos de Redes Neurais e LLMs", summary: "Introdução ao Deep Learning, arquitetura de Transformers, Embeddings vetoriais e engenharia de prompt para agentes autônomos.", xpReward: 200 }
      ],
      roadmap: {
        primary: ["Análise de Dados com Python & Pandas"],
        secondary: ["Visualização e Estatística Descritiva", "Modelos Predictivos Supervisonados"],
        advanced: ["Fundamentos de Redes Neurais e LLMs"]
      }
    };
  }

  if (isDesign) {
    return {
      complexity: "Iniciante",
      justifiedPedagogy: `Análise sobre a disposição visual de elementos, ergonomia de uso das interfaces digitais, grids e hierarquia de leitura para humanos.`,
      estimatedTime: "3 semanas (cerca de 25h de dedicação)",
      category: "Interface de Usuário & UX Design",
      colors: [
        { hex: "#EC4899", name: "Fuchsia criativo", psychology: "Expressa criatividade, contraste marcante e modernidade estética.", usage: "Pontos de clique ativos e bordas de foco ergonômicas no mockup." },
        { hex: "#64748B", name: "Slate Gray Neutral", psychology: "Oferece balanço visual e não interfere na escolha cromática da tela.", usage: "Linhas guias e tipografia secundária do Figma." }
      ],
      topics: [
        { name: "Fundamentos do Figma e Vetores", summary: "Operações básicas de frames, auto-layout responsivos, componentes reusáveis e variantes no editor vetorial Figma.", xpReward: 100 },
        { name: "Teoria das Cores e Tipografia Pareada", summary: "Aplicação prática de escalas harmônicas de cores e contraste legível conforme as regras de acessibilidade WCAG.", xpReward: 100 },
        { name: "Componentização e Design System", summary: "Como estruturar um kit básico de UI com botões, inputs, cards e estados reativos padronizados.", xpReward: 150 },
        { name: "Arquitetura de Informação e Usabilidade (UX)", summary: "Fluxogramas de navegação do usuário, testes de usabilidade, prototipagem dinâmica de alta fidelidade ligando as telas.", xpReward: 150 }
      ],
      roadmap: {
        primary: ["Fundamentos do Figma e Vetores"],
        secondary: ["Teoria das Cores e Tipografia Pareada", "Componentização e Design System"],
        advanced: ["Arquitetura de Informação e Usabilidade (UX)"]
      }
    };
  }

  // Fallback Geral para qualquer outro tipo de arquivo carregado
  return {
    complexity: "Iniciante",
    justifiedPedagogy: `A estrutura aborda os primeiros passos e fundamentos gerais sobre essa mídia técnica. Excelente para nivelamento teórico antes de operar softwares profissionais produtivos.`,
    estimatedTime: "3 dias (cerca de 12h de dedicação)",
    category: "Ilustração Vetorial",
    colors: [
      { hex: "#40C9AD", name: "Verde SkillQuest", psychology: "Aumenta o foco pedagógico de estudos e evoca inovação limpa.", usage: "Usado nos eixos de rotação e pontos vetoriais da malha plana." },
      { hex: "#1E293B", name: "Slate Dark", psychology: "Proporciona alto contraste profissional e reduz cansaço visual.", usage: "Cor das linhas demarcatórias técnicas." }
    ],
    topics: [
      { name: "Introdução à Vetorização Através de Curvas", summary: "Fundamentos teóricos de pontos de ancoragem e manipulação correta das alças de curvas Bézier para desenhar malhas perfeitamente limpas.", xpReward: 100 },
      { name: "Distribuição Simétrica e Teoria de Shapes", summary: "Uso correto de booleanos (união, subtração, interseção) para compor silhuetas limpas e rítmicas a partir de figuras geométricas básicas geométricas.", xpReward: 100 },
      { name: "Alinhamento e Hierarquia Visual de Elementos", summary: "Aprenda a guiar os olhos do leitor organizando espaçamentos de margem, pesos tipográficos diferenciados e eixos verticais consistentes.", xpReward: 150 }
    ],
    roadmap: {
      primary: ["Introdução à Vetorização Através de Curvas"],
      secondary: ["Distribuição Simétrica e Teoria de Shapes"],
      advanced: ["Alinhamento e Hierarquia Visual de Elementos"]
    }
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { fileBase64, mimeType, fileName } = req.body;
  if (!fileBase64) return res.status(400).json({ error: "O parâmetro 'fileBase64' é obrigatório." });

  const apiKey = getCopilotApiKey();
  if (!apiKey || apiKey.trim() === "") return res.json(getMockWalkthrough(fileName || "Imagem Carregada"));

  try {
    let cleanBase64 = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;

    const promptText = `
      Você é o Motor de IA Analítico do SkillQuest.
      Sua missão é identificar o assunto principal da imagem ou do material enviado e relacioná-lo com disciplinas de DESIGN, UI/UX, branding, tipografia, composição, cor, ilustração, layout, identidade visual, produto, motion design ou experiência visual.
      Analise atentamente o arquivo '${fileName || "referencia"}'.
      Extraia e estruture no JSON de resposta:
      1. Complexidade de Aprendizado (Iniciante, Intermediário ou Avançado com justificativa)
      2. Tempo Estimado para dominar aquele assunto do zero (ex: '4 semanas (40h)')
      3. Paleta cromática ou de estilos conceituais.
      4. Uma lista sequencial de até 4 tópicos chave para estudo.
      5. Um roadmap com primário, secundário e avançado.
      6. A categoria predominante de conhecimento.
      7. Uma descrição curta do que a imagem está mostrando.
    `;

    const resultText = await callCopilotAPI([
      { role: "system", content: "Você é o Motor de IA Analítico do SkillQuest. Responda estritamente com um JSON válido, sem markdown e sem texto extra." },
      { role: "user", content: [
        { type: "text", text: `${promptText}\n\nRetorne exatamente um objeto JSON com o esquema solicitado.` },
        { type: "image_url", image_url: { url: `data:${mimeType || "image/png"};base64,${cleanBase64}` } }
      ]}
    ], 0.2);

    const parsedData = JSON.parse(normalizeJsonPayload(resultText || "{}"));
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error analyzing material:", error);
    return res.json(getMockWalkthrough(fileName || "Documentação Técnica"));
  }
}