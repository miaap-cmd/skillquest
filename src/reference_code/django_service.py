"""
SkillQuest - Serviço Django de Integração com Copilot
Este serviço utiliza a API compatível com o motor de IA do Copilot ou uma implementação REST equivalente.
para escanear materiais multimodais (imagens e diagramas) e retornar
um walkthrough detalhado de estudos na forma de JSON estruturado.
"""

import os
import json
import base64
from google import genai
from google.genai import types
from django.conf import settings

class CopilotReverseLearningService:
    @staticmethod
    def get_client():
        """
        Inicializa o cliente de IA utilizando a chave de API configurada para o Copilot.
        """
        api_key = getattr(settings, 'COPILOT_API_KEY', os.environ.get('COPILOT_API_KEY'))
        if not api_key:
            raise ValueError("COPILOT_API_KEY não foi configurada nas configurações do Django.")
        
        return genai.Client(api_key=api_key)

    @classmethod
    def analyze_material(cls, base64_image_data: str, mime_type: str, file_name: str) -> dict:
        """
        Envia uma imagem/diagrama base64 para o motor de IA do Copilot para gerar o Walkthrough de Estudos.
        Retorna um dicionário estruturado estritamente segundo as diretrizes de design do SkillQuest.
        """
        client = cls.get_client()
        
        # Decodifica base64 caso venha com prefixo dataURI
        if "," in base64_image_data:
            base64_image_data = base64_image_data.split(",")[1]

        # Configura a estrutura exata do JSON esperado (Response Schema)
        schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "complexity": types.Schema(
                    type=types.Type.STRING,
                    description="Grau de dificuldade pedagógica para replicar este projeto do zero. Ex: 'Iniciante', 'Intermediário', 'Avançado'."
                ),
                "justifiedPedagogy": types.Schema(
                    type=types.Type.STRING,
                    description="Uma justificativa pedagógica e contextual detalhando os desafios técnicos da imagem."
                ),
                "estimatedTime": types.Schema(
                    type=types.Type.STRING,
                    description="Tempo total estimado em horas ou semanas (ex: '45 horas', '4 semanas') para absorver as habilidades necessárias."
                ),
                "colors": types.Schema(
                    type=types.Type.ARRAY,
                    description="Principais cores detectadas na composição com seu significado psicológico ou utilidade prática.",
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "hex": types.Schema(type=types.Type.STRING, description="Formato hexadecimal. Ex: #40C9AD"),
                            "name": types.Schema(type=types.Type.STRING, description="Nome representativo da cor"),
                            "psychology": types.Schema(type=types.Type.STRING, description="Significado ou sensação no design."),
                            "usage": types.Schema(type=types.Type.STRING, description="Aplicação técnica vista na imagem (ex: iluminação de destaque, contraste de fundo).")
                        },
                        required=["hex", "name", "psychology", "usage"]
                    )
                ),
                "topics": types.Schema(
                    type=types.Type.ARRAY,
                    description="Assuntos acadêmicos ordenados cronologicamente do menor ao maior nível técnico.",
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "name": types.Schema(type=types.Type.STRING, description="Nome da disciplina técnica/conceito"),
                            "summary": types.Schema(type=types.Type.STRING, description="Resumo pedagógico e conceitos fundamentais para o estudante reter."),
                            "xpReward": types.Schema(type=types.Type.INTEGER, description="Pontos de XP a ganhar ao completar o estudo (Dica: Use 50, 100 ou 200).")
                        },
                        required=["name", "summary", "xpReward"]
                    )
                ),
                "roadmap": types.Schema(
                    type=types.Type.OBJECT,
                    description="Mapeamento ordenado por prioridade de estudos para focar o usuário.",
                    properties={
                        "primary": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="Fundamentos de alta prioridade"),
                        "secondary": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="Ferramentas e suporte secundários"),
                        "advanced": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="Técnicas complexas ou pós-processamento")
                    },
                    required=["primary", "secondary", "advanced"]
                ),
                "category": types.Schema(
                    type=types.Type.STRING,
                    description="Categoria de triagem da habilidade detectada (ex: 'Design 3D', 'Desenvolvimento Web', 'Ilustração Vetorial', 'Design de Produto')."
                )
            },
            required=["complexity", "justifiedPedagogy", "estimatedTime", "colors", "topics", "roadmap", "category"]
        )

        # Prepara a imagem para o Copilot
        image_part = types.Part.from_bytes(
            data=base64.b64decode(base64_image_data),
            mime_type=mime_type
        )

        system_instruction = (
            "Você é o Motor de IA Analítico e de Análise Pedagógica e Engenharia Reversa do SkillQuest. "
            "Seu objetivo é analisar visualmente o arquivo enviado pelo usuário (como designs, modelos, diagramas técnicos, ilustrações) "
            "e gerar um walkthrough definitivo e pedagógico, ensinando as disciplinas que ele precisa estudar para recriar o equivalente do zero."
        )

        prompt = (
            f"Analise detalhadamente o arquivo anexado '{file_name}'. "
            "Gere uma lista sequencial de tópicos para estudo que comece das bases teóricas até a modelagem, estilização e acabamento. "
            "Extraia também a paleta de cores predominante e sua psicologia, e crie um roadmap de prioridades dividindo os assuntos em primários, secundários e avançados."
        )

        try:
            # Utiliza o modelo configurado para o Copilot, com suporte a imagens e respostas estruturadas.
            response = client.models.generate_content(
                model=os.getenv('COPILOT_MODEL', 'copilot-default'),
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=schema,
                    temperature=0.2 # Baixa temperatura garante respostas analíticas precisas
                )
            )
            
            # Retorna o JSON convertido em dicionário Python
            return json.loads(response.text)
        except Exception as e:
            # Retorna estrutura de Fallback elegante em caso de falha de conexão na API
            return {
                "complexity": "Intermediário",
                "justifiedPedagogy": f"Ocorreu um erro ao processar o arquivo via IA. Entrando em modo simulado. Detalhe: {str(e)}",
                "estimatedTime": "12 semanas",
                "colors": [
                    {"hex": "#40C9AD", "name": "SkillQuest Mint", "psychology": "Foco e Estilo", "usage": "Cor do fallback corporativo"},
                    {"hex": "#1E293B", "name": "Slate Deep", "psychology": "Concentração e Tecnologia", "usage": "Cor base do design"}
                ],
                "topics": [
                    {"name": "Introdução Acadêmica", "summary": "Estudos conceituais iniciais e mapeamento teórico do objeto carregado.", "xpReward": 100},
                    {"name": "Reconstrução Visual", "summary": "Técnicas de engenharia reversa para replicar fatiamento e layouts.", "xpReward": 150}
                ],
                "roadmap": {
                    "primary": ["Introdução Acadêmica"],
                    "secondary": ["Reconstrução Visual"],
                    "advanced": []
                },
                "category": "Design 3D"
            }
