export interface ReferenceCodeFile {
  name: string;
  language: string;
  path: string;
  content: string;
}

export const REFERENCE_FILES: ReferenceCodeFile[] = [
  {
    name: "Django Copilot Service",
    language: "python",
    path: "django_service.py",
    content: `"""
SkillQuest - Serviço Django de Integração com Copilot
Envia imagens/diagramas para o motor de IA do Copilot para gerar o Walkthrough de Estudos.
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
        api_key = getattr(settings, 'COPILOT_API_KEY', os.environ.get('COPILOT_API_KEY'))
        if not api_key:
            raise ValueError("COPILOT_API_KEY não foi configurada.")
        return genai.Client(api_key=api_key)

    @classmethod
    def analyze_material(cls, base64_image_data: str, mime_type: str, file_name: str) -> dict:
        client = cls.get_client()
        if "," in base64_image_data:
            base64_image_data = base64_image_data.split(",")[1]

        schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "complexity": types.Schema(type=types.Type.STRING, description="Iniciante, Intermediário, Avançado"),
                "justifiedPedagogy": types.Schema(type=types.Type.STRING, description="Razão pedagógica"),
                "estimatedTime": types.Schema(type=types.Type.STRING, description="Horas/semanas estimadas"),
                "colors": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "hex": types.Schema(type=types.Type.STRING),
                            "name": types.Schema(type=types.Type.STRING),
                            "psychology": types.Schema(type=types.Type.STRING),
                            "usage": types.Schema(type=types.Type.STRING)
                        },
                        required=["hex", "name", "psychology", "usage"]
                    )
                ),
                "topics": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "name": types.Schema(type=types.Type.STRING),
                            "summary": types.Schema(type=types.Type.STRING),
                            "xpReward": types.Schema(type=types.Type.INTEGER)
                        },
                        required=["name", "summary", "xpReward"]
                    )
                ),
                "roadmap": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "primary": types.Schema(type=types.Type.ARRAY, items=types.Schema(types.Type.STRING)),
                        "secondary": types.Schema(type=types.Type.ARRAY, items=types.Schema(types.Type.STRING)),
                        "advanced": types.Schema(type=types.Type.ARRAY, items=types.Schema(types.Type.STRING))
                    },
                    required=["primary", "secondary", "advanced"]
                ),
                "category": types.Schema(type=types.Type.STRING)
            },
            required=["complexity", "justifiedPedagogy", "estimatedTime", "colors", "topics", "roadmap", "category"]
        )

        image_part = types.Part.from_bytes(
            data=base64.b64decode(base64_image_data),
            mime_type=mime_type
        )

        system_instruction = "Você é o Motor de IA Analítico do SkillQuest..."
        prompt = f"Analise o arquivo '{file_name}' e gere a trilha de estudos."

        try:
            response = client.models.generate_content(
                model=os.getenv('COPILOT_MODEL', 'copilot-default'),
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=schema,
                    temperature=0.2
                )
            )
            return json.loads(response.text)
        except Exception as e:
            return {"error": str(e)}`
  },
  {
    name: "Django Models",
    language: "python",
    path: "models.py",
    content: `"""
SkillQuest - Modelos Django (models.py)
Estrutura Relacional de Gamificação, Perfis, Trilhas e Tópicos.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def add_xp(self, amount: int):
        self.xp += amount
        while True:
            xp_needed = self.level * 1000
            if self.xp >= xp_needed:
                self.xp -= xp_needed
                self.level += 1
            else:
                break
        self.save()

class Badge(models.Model):
    id_name = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default="award")
    category = models.CharField(max_length=50, default="Geral")

class StudyMaterial(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=100, blank=True)

class StudyPathway(models.Model):
    material = models.OneToOneField(StudyMaterial, on_delete=models.CASCADE)
    complexity = models.CharField(max_length=50)
    justified_pedagogy = models.TextField()
    estimated_time = models.CharField(max_length=50)

class PathwayColor(models.Model):
    pathway = models.ForeignKey(StudyPathway, on_delete=models.CASCADE, related_name='colors')
    hex_code = models.CharField(max_length=7)
    color_name = models.CharField(max_length=50)
    psychology = models.TextField()
    usage = models.TextField()

class StudyTopic(models.Model):
    pathway = models.ForeignKey(StudyPathway, on_delete=models.CASCADE, related_name='topics')
    order = models.PositiveIntegerField()
    name = models.CharField(max_length=150)
    summary = models.TextField()
    xp_reward = models.PositiveIntegerField(default=100)`
  },
  {
    name: "Django Views",
    language: "python",
    path: "views.py",
    content: `"""
SkillQuest - Django REST Framework API views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import UserProfile, StudyMaterial, StudyPathway, PathwayColor, StudyTopic

class MultimodalScanView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        file_data = request.data.get("file_base64")
        mime_type = request.data.get("mime_type", "image/png")
        file_name = request.data.get("file_name", "upload.png")

        # Aciona o serviço da IA do Copilot
        ai_data = CopilotReverseLearningService.analyze_material(file_data, mime_type, file_name)

        material = StudyMaterial.objects.create(
            user=request.user, name=file_name, mime_type=mime_type, category=ai_data.get("category", "Geral")
        )
        pathway = StudyPathway.objects.create(
            material=material, complexity=ai_data.get("complexity", "Intermediário"),
            justified_pedagogy=ai_data.get("justifiedPedagogy", ""), estimated_time=ai_data.get("estimatedTime", "3 semanas")
        )
        # Salva cores e tópicos...
        profile = request.user.profile
        profile.add_xp(100) # Recompensa de envio
        return Response({"status": "Criado com sucesso!", "material_id": material.id})`
  },
  {
    name: "Next.js page.tsx",
    language: "typescript",
    path: "page.tsx",
    content: `"use client";
import React, { useState } from "react";
import { Compass, Palette, MessageSquare, Trophy, Flame } from "lucide-react";

export default function TrilhasPage() {
  const [activeTab, setActiveTab] = useState("resumos");
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100">
        <h1 className="text-xl font-bold text-slate-800">Minha Trilha de Aprendizado</h1>
        <div className="flex gap-4">
          <span className="bg-amber-50 text-amber-700 px-3 py-1 bg-amber-50 rounded-full font-bold">5 🔥 Dias</span>
          <span className="bg-emerald-50 text-[#40C9AD] px-3 py-1 rounded-full font-bold">Nível 4 🏆</span>
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100">
          <h2 className="font-bold text-lg mb-4">Árvore de Habilidades</h2>
        </section>
        <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 h-[500px]">
          <h2 className="font-bold text-lg mb-4">Ficha Técnica</h2>
        </section>
      </main>
    </div>
  );
}`
  },
  {
    name: "README Config",
    language: "markdown",
    path: "README.md",
    content: `# SkillQuest Production Setup Guide
Como rodar o ecossistema Django REST + Next.js do SkillQuest de forma local ou Cloud.

### Dependências Backend (Python):
\`\`\`bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv
\`\`\`

### Dependências Frontend (Node/Next):
\`\`\`bash
npm install lucide-react classnames motion
\`\`\`

### Comandos de Start:
- Backend: \`python manage.py runserver\`
- Frontend: \`npm run dev\``
  }
];
