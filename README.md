# SkillQuest

**Domine o que te domina**

SkillQuest é um aplicativo web local que transforma referências visuais em trilhas de estudo personalizadas, com apoio de IA, gamificação e um mentor virtual. A ideia central é usar aquilo que chama a atenção do usuário como ponto de partida para aprender de forma organizada, prática e contextualizada.

## User Story

Como usuário curioso e motivado a aprender, quero enviar materiais que me chamam atenção — como imagens, referências visuais ou arquivos de estudo — e receber um roteiro organizado com tópicos, sugestões de aprendizado e acompanhamento de progresso, para transformar interesse em conhecimento de forma clara e envolvente.

## O que é o SkillQuest

O SkillQuest é uma plataforma que funciona como uma IA tutora e “espelho pedagógico reativo”. Em vez de apenas gerar conteúdo automaticamente, ela tenta compreender o material enviado pelo usuário e estruturar caminhos de estudo com base nesse material.

Seu objetivo é:

- transformar referências em objetos de estudo;
- criar roteiros personalizados com ordem de aprendizagem;
- apoiar o usuário na compreensão de temas e conceitos;
- estimular o hábito de estudo por meio de gamificação;
- ajudar o usuário a aprender com aquilo que realmente o inspirou.

Como o projeto destaca, a ferramenta busca reacender o desejo de aprender, especialmente quando o usuário encontra algo que desperta curiosidade.

## Ferramentas usadas

- **AI Studio** para prototipação e desenvolvimento da experiência com IA;
- **GitHub Codespaces** como ambiente de desenvolvimento compartilhado;
- **React + TypeScript** para a interface do aplicativo;
- **Vite** como ferramenta de build e desenvolvimento;
- **Express** para a API backend;
- **Tailwind CSS** para estilização;
- **Motion** para animações;
- **Supabase** para integração com dados e persistência;
- **Vercel** para deploy e hospedagem da aplicação;
- **IA Copilot/Azure** para análise de materiais e chat com o mentor.

## Como rodar

### Pré-requisitos

- Node.js instalado;
- npm;
- um arquivo `.env.local` com as variáveis necessárias para a API de IA (quando quiser ativar a análise completa).

### Passos

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env.local` com sua chave da IA, por exemplo:
   ```env
   COPILOT_API_KEY=sua_chave
   ```

3. Inicie o projeto localmente:
   ```bash
   npm run dev
   ```

4. Abra o aplicativo no navegador:
   ```text
   http://localhost:3000
   ```

### Observações importantes

- O projeto foi pensado como um aplicativo local e web;
- os dados ficam seguros no dispositivo do usuário;
- como não foi implementado um sistema completo de login, a experiência pode ser usada sem autenticação.

## Próximos passos

- melhorar a leitura visual das imagens para que a IA consiga identificar corretamente o conteúdo e gerar trilhas mais precisas;
- integrar autenticação real de usuários;
- salvar progresso e trilhas com persistência mais robusta no Supabase;
- aprimorar o mentor IA para respostas mais contextualizadas e úteis;
- expandir suporte a mais tipos de arquivos e referências;
- adicionar testes automatizados e métricas de uso;
- melhorar a experiência web e a usabilidade geral da plataforma.

> Importante: a falha da IA em identificar corretamente o conteúdo das imagens foi um ponto limitante do projeto, e isso deve ser tratado como um dos principais próximos passos.

