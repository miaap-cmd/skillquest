"""
SkillQuest - Views e Controladores (views.py)
Implementação de Endpoints REST em Django REST Framework (DRF)
para processamento de uploads, controle de XP e nível, e salvamento de caminhos de estudo.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import (
    UserProfile, StudyMaterial, StudyPathway, PathwayColor, 
    StudyTopic, UserTopicCompletion, Badge, UserBadge
)
from .django_service import GeminiReverseLearningService

class UserProfileStatusView(APIView):
    """
    GET /api/user/status/
    Retorna o perfil do usuário atual com XP, Nível, Streak de Ofensiva e Medalhas (Badges).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Serializa as badges conquistadas
        unlocked_badges = UserBadge.objects.filter(profile=profile)
        badges_data = [{
            "id": ub.badge.id_name,
            "name": ub.badge.name,
            "description": ub.badge.description,
            "icon": ub.badge.icon_name,
            "category": ub.badge.category,
            "unlocked": True,
            "unlocked_at": ub.unlocked_at.isoformat()
        } for ub in unlocked_badges]

        # Lista de todas as badges do sistema para exibir conquistadas/bloqueadas na UI
        all_system_badges = Badge.objects.all()
        completed_ids = [ub.badge.id_name for ub in unlocked_badges]
        
        full_badges_list = []
        for b in all_system_badges:
            full_badges_list.append({
                "id": b.id_name,
                "name": b.name,
                "description": b.description,
                "icon": b.icon_name,
                "category": b.category,
                "unlocked": b.id_name in completed_ids
            })

        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "xp": profile.xp,
            "level": profile.level,
            "streak": profile.streak,
            "badges": full_badges_list if all_system_badges.exists() else badges_data
        })


class MultimodalScanView(APIView):
    """
    POST /api/materials/upload/
    Recebe arquivo em base64 e aciona o motor do Gemini IA para decodificar pedagogicamente o assunto.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        file_data = request.data.get("file_base64")
        mime_type = request.data.get("mime_type", "image/png")
        file_name = request.data.get("file_name", "upload_material.png")

        if not file_data:
            return Response(
                {"error": "Arquivo base64 é altamente obrigatório."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Aciona o Serviço Inteligente do Gemini
        ai_data = GeminiReverseLearningService.analyze_material(
            base64_image_data=file_data,
            mime_type=mime_type,
            file_name=file_name
        )

        category_detected = ai_data.get("category", "Geral")

        # 2. Registra o material de estudos carregado
        material = StudyMaterial.objects.create(
            user=request.user,
            name=file_name,
            mime_type=mime_type,
            category=category_detected
        )

        # 3. Cria a Trilha de Estudos Decodificada (StudyPathway)
        pathway = StudyPathway.objects.create(
            material=material,
            complexity=ai_data.get("complexity", "Intermediário"),
            justified_pedagogy=ai_data.get("justifiedPedagogy", ""),
            estimated_time=ai_data.get("estimatedTime", "3 semanas")
        )

        # 4. Registra as cores predominantes e psicológica (Ficha Técnica)
        for i, color_info in enumerate(ai_data.get("colors", [])):
            PathwayColor.objects.create(
                pathway=pathway,
                hex_code=color_info.get("hex", "#40C9AD"),
                color_name=color_info.get("name", f"Tom {i+1}"),
                psychology=color_info.get("psychology", ""),
                usage=color_info.get("usage", "")
            )

        # 5. Registra a lista de disciplinas e assuntos recomendados
        for idx, topic_info in enumerate(ai_data.get("topics", [])):
            StudyTopic.objects.create(
                pathway=pathway,
                order=idx + 1,
                name=topic_info.get("name", "Assunto técnico"),
                summary=topic_info.get("summary", ""),
                xp_reward=topic_info.get("xpReward", 100)
            )

        # 6. Recompensa o usuário por enviar dados (+100 XP)
        profile = request.user.profile
        profile.add_xp(100)
        profile.update_streak()

        # Mecânica de Gamificação: Checa se deve desbloquear a conquista "Analisador Multimodal"
        # Regra: Enviou 5 mídias para descriptografar
        total_uploads = StudyMaterial.objects.filter(user=request.user).count()
        if total_uploads >= 5:
            badge, _ = Badge.objects.get_or_create(
                id_name="analisador_multimodal",
                defaults={
                    "name": "Analisador Multimodal",
                    "description": "Desbloqueado ao subir 5 mídias diferentes para o motor reverso.",
                    "icon_name": "eye",
                    "category": "Exploração"
                }
            )
            UserBadge.objects.get_or_create(profile=profile, badge=badge)

        return Response({
            "message": "Caminho didático gerado com primor tecnológico pelo Gemini!",
            "material_id": material.id,
            "category_detected": category_detected,
            "pathway": {
                "id": pathway.id,
                "complexity": pathway.complexity,
                "justifiedPedagogy": pathway.justified_pedagogy,
                "estimatedTime": pathway.estimated_time,
                "colors": [{"hex": c.hex_code, "name": c.color_name, "psychology": c.psychology, "usage": c.usage} for c in pathway.colors.all()],
                "topics": [{"id": t.id, "name": t.name, "summary": t.summary, "xpReward": t.xp_reward, "completed": False} for t in pathway.topics.all()],
                "roadmap": ai_data.get("roadmap", {"primary": [], "secondary": [], "advanced": []})
            }
        }, status=status.HTTP_201_CREATED)


class ToggleTopicCompletionView(APIView):
    """
    POST /api/topics/toggle-complete/
    Marca ou desmarca um assunto de estudos como concluído. 
    Adiciona XP e verifica evolução do perfil em tempo real.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        topic_id = request.data.get("topic_id")
        topic = get_object_or_404(StudyTopic, id=topic_id)
        profile = request.user.profile

        # Verifica se já está concluído
        completion = UserTopicCompletion.objects.filter(user=request.user, topic=topic)
        
        if completion.exists():
            # Desmarca: Retira XP respeitando as dinâmicas de regras
            completion.delete()
            # Reduz do XP total com limite de 0
            profile.xp = max(0, profile.xp - topic.xp_reward)
            profile.save()
            completed = False
            msg = f"Assunto '{topic.name}' desmarcado. Perdeu {topic.xp_reward} XP."
        else:
            # Conclui: Adiciona XP
            UserTopicCompletion.objects.create(user=request.user, topic=topic)
            profile.add_xp(topic.xp_reward)
            profile.update_streak()
            completed = True
            msg = f"Assunto condecorado com maestria! Ganhou {topic.xp_reward} XP!"

            # Gamificação de Medalha: Se completou o primeiro assunto da trilha de estudos
            first_completion = UserTopicCompletion.objects.filter(user=request.user).count() == 1
            if first_completion:
                badge, _ = Badge.objects.get_or_create(
                    id_name="foco_total",
                    defaults={
                        "name": "Foco Total",
                        "description": "Domine o primeiro assunto de alta prioridade na sua trilha.",
                        "icon_name": "target",
                        "category": "Estudos"
                    }
                )
                UserBadge.objects.get_or_create(profile=profile, badge=badge)

        return Response({
            "message": msg,
            "completed": completed,
            "xp_rewarded": topic.xp_reward if completed else -topic.xp_reward,
            "xp_total": profile.xp,
            "level": profile.level,
            "streak": profile.streak
        })


class ConfirmCategoryView(APIView):
    """
    POST /api/materials/confirm-category/
    Permite ao usuário confirmar quais disciplinas foram detectadas ou alterar manualmente.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        material_id = request.data.get("material_id")
        confirmed_category = request.data.get("category")

        material = get_object_or_404(StudyMaterial, id=material_id, user=request.user)
        material.category = confirmed_category
        material.save()

        return Response({
            "message": f"Categoria '{confirmed_category}' confirmada pelo usuário com sucesso!",
            "material_id": material.id,
            "category": material.category
        })
