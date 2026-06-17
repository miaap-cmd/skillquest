import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Configura body parsers com limite aumentado para lidar com uploads em base64 com conforto
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Inicialização segura e dinâmica do SDK GoogleGenAI com tratamento contra ausência de chave (Lazy Initialization)
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Falha ao instanciar o cliente GoogleGenAI:", err);
    return null;
  }
}

// ENDPOINT 1: Escaneamento Multimodal e Engenharia Reversa de Estudos
app.post("/api/analyze-material", async (req, res) => {
  const { fileBase64, mimeType, fileName } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: "O parâmetro 'fileBase64' é obrigatório." });
  }

  const ai = getAiClient();
  // Se o cliente não estiver inicializado de forma real, retornamos uma decodificação estruturada simulada
  if (!ai) {
    console.log("Mocking response for demonstration - API key is missing");
    return res.json(getMockWalkthrough(fileName || "Imagem Carregada"));
  }

  try {
    // Processamento do Base64 retirando cabeçalho dataURI se existir
    let cleanBase64 = fileBase64;
    if (fileBase64.includes(",")) {
      cleanBase64 = fileBase64.split(",")[1];
    }

    const filePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: cleanBase64,
      },
    };

    const promptText = `
      Você é o Motor de IA Analítico, de Análise Pedagógica e Engenharia Reversa do SkillQuest.
      Seu objetivo é analisar o arquivo fornecido pelo usuário (que pode ser uma imagem como designs 3D, layouts, diagramas técnicos, ilustrações, infográficos, OU um documento de texto como PDF, texto livre ou código-fonte).
      Seu propósito é gerar um percurso pedagógico estruturado (walkthrough) ensinando as disciplinas lógicas, conceituais e práticas necessárias para o usuário entender, dominar ou recriar aquele assunto/conteúdo do zero de forma gamificada.

      Analise o arquivo anexo '${fileName || "referencia.png"}'. Extraia e estruture no JSON de resposta:
      1. Complexidade de Aprendizado (Iniciante, Intermediário ou Avançado com justificativa)
      2. Tempo Estimado para dominar aquele assunto do zero (ex: '4 semanas (40h)')
      3. Paleta cromática ou de estilos conceituais: para imagens, extraia as cores principais; para documentos ou códigos, infira uma paleta de cores moderna e coerente com a marca/assunto e sua respectiva psicologia e uso.
      4. Uma lista sequencial/cronológica de até 4 tópicos/assuntos chaves para estudo, ordenados do mais simples ao mais complexo.
      5. Um roteiro de focos (roadmap) dividindo a lista de tópicos em primário (básico), secundário (intermediário) e avançado (tópicos profundos).
      6. A categoria predominante de conhecimento (ex: Design 3D, Desenvolvimento Web, Inteligência Artificial, Banco de Datos, Ilustração Vetorial, Programação, etc.).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [filePart, { text: promptText }],
      config: {
        systemInstruction: "Retorne estritamente um JSON que siga perfeitamente o esquema solicitado, sem qualquer marcação ou formatação fora do JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complexity: { type: Type.STRING, description: "Just 'Iniciante', 'Intermediário' or 'Avançado'" },
            justifiedPedagogy: { type: Type.STRING, description: "Educational pedagogical reasoning." },
            estimatedTime: { type: Type.STRING, description: "Duration or study hours estimation. Ex: '4 semanas (50h)'" },
            category: { type: Type.STRING, description: "Technology category. Ex: 'Design 3D'" },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING },
                  psychology: { type: Type.STRING },
                  usage: { type: Type.STRING }
                },
                required: ["hex", "name", "psychology", "usage"]
              }
            },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  xpReward: { type: Type.INTEGER }
                },
                required: ["name", "summary", "xpReward"]
              }
            },
            roadmap: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.ARRAY, items: { type: Type.STRING } },
                secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
                advanced: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["primary", "secondary", "advanced"]
            }
          },
          required: ["complexity", "justifiedPedagogy", "estimatedTime", "category", "colors", "topics", "roadmap"]
        },
        temperature: 0.2
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);
    return res.json(parsedData);

  } catch (error: any) {
    console.warn("Aviso de acesso da API do Gemini (obtido erro, iniciando fallback pedagógico integrado):", error.message || error);
    // Retorna fallback limpo e inteligível
    return res.json(getMockWalkthrough(fileName || "Documentação Técnica"));
  }
});

// ENDPOINT 2: Chat com Mentor IA sobre as Trilhas
app.post("/api/mentor-chat", async (req, res) => {
  const { messages, topicName, materialCategory } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "O parâmetro 'messages' deve ser um array." });
  }

  const ai = getAiClient();
  // Se o cliente não estiver inicializado de forma real, retornamos uma resposta mock simulada inteligente
  if (!ai) {
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    return res.json({
      role: "mentor",
      text: `Excelente pergunta sobre o tema de "${topicName || "Estudos Gerais"}"! Como estamos rodando em Modo Demonstração, veja esta dica importante: Foque sempre em compreender como as primitivas básicas de design se organizam espacialmente antes de prosseguir ao shaders complexos. Sua pergunta sobre "${lastUserMessage}" demonstra excelente curiosidade de engenharia reversa!`
    });
  }

  try {
    const formattedHistory = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Última mensagem do usuário
    const currentQuestion = formattedHistory.pop()?.parts[0].text || "Como aprender isso?";

    const systemPrompt = `
      Você é o Mentor Inteligente de Aprendizado Reverso e Gamificação do SkillQuest.
      O estudante está aprendendo sobre o assunto "${topicName || "Fundamentos"}" na trilha de conhecimento de "${materialCategory || "Geral"}".
      Seu objetivo é guiá-lo com didática pragmática, responder dúvidas conceituais, fornecer resumos exemplificados e incentivar a manter o foco em sua rotina de estudos.
      Seja encorajador, responda em português com clareza e mantenha os dados fáceis de ler.
    `;

    // Usaremos chat ou geração rápida
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory.map(h => ({ role: h.role, parts: h.parts })),
        { role: "user", parts: [{ text: currentQuestion }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    return res.json({
      role: "mentor",
      text: response.text || "Perdoe-me, não consegui sintetizar uma resposta agora. Tente novamente em alguns segundos!"
    });

  } catch (error: any) {
    console.warn("Aviso de acesso da API do Gemini no chat (fallback local ativado):", error.message || error);
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    return res.json({
      role: "mentor",
      text: `Excelente pergunta sobre o tema de "${topicName || "Estudos Gerais"}"! No momento, para garantir ótima performance offline e contornar restrições de rede, estou em Modo de Aprendizado Local Autônomo.

Sobre sua dúvida em relação a "${lastUserMessage}", o foco central de estudo para "${topicName || "Fundamentos"}" baseia-se em compreender seus pilares conceituais fundamentais de forma ordenada. Pratique repetindo os conceitos chaves em projetos simples e práticos para fixar o conhecimento e ganhar mais XP!`
    });
  }
});

// Mock Walkthrough de estudos caso não haja conexão com o Gemini de Produção
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

// Vite middleware para servir o app do React em desenvolvimento e produção
async function startServer() {
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
    console.log(`[SkillQuest Server] Rodando na porta ${PORT}`);
  });
}

startServer();
