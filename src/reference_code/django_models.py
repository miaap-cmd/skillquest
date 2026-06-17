"""
SkillQuest - Modelos Django (models.py)
Estrutura de Banco de Dados Relacional para Gestão de Aprendizado Reverso,
Histórico de Uploads, Trilha Ativa e as Mecânicas de Gamificação (XP, Nível, Streak, Badges).
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    """
    Extensão do Usuário padrão do Django para armazenar os indicadores principais de gamificação.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    xp = models.PositiveIntegerField(default=0, help_text="Total de XP acumulado de todos os tempos")
    level = models.PositiveIntegerField(default=1, help_text="Nível intelectual do usuário")
    streak = models.PositiveIntegerField(default=0, help_text="Contador de dias seguidos progredindo")
    last_activity_date = models.DateField(null=True, blank=True, help_text="Data do último progresso para validação de Streak")

    def __str__(self):
        return f"{self.user.username} - Lvl {self.level} ({self.xp} XP)"

    def add_xp(self, amount: int):
        """
        Adiciona pontos de XP ao perfil e calcula automaticamente a evolução de nível (UP).
        Algoritmo clássico de RPG: XP para o próximo nível cresce como: nivel * 1000
        """
        self.xp += amount
        # Calcula evolução de nível
        while True:
            xp_needed_for_next = self.level * 1000
            if self.xp >= xp_needed_for_next:
                self.xp -= xp_needed_for_next
                self.level += 1
            else:
                break
        self.save()

    def update_streak(self):
        """
        Atualiza ou reseta o streak de ofensiva diária.
        """
        today = timezone.localdate()
        if self.last_activity_date == today:
            return  # Já progrediu hoje, streak mantido
        
        if self.last_activity_date == today - timezone.timedelta(days=1):
            self.streak += 1  # Ofensiva continuada
        elif self.last_activity_date is None or self.last_activity_date < today - timezone.timedelta(days=1):
            self.streak = 1   # Perdeu streak de dias anteriores, reseta para 1
            
        self.last_activity_date = today
        self.save()


class Badge(models.Model):
    """
    Representação das Conquistas (Badges) disponíveis na plataforma.
    """
    id_name = models.CharField(max_length=50, unique=True, help_text="Identificador técnico. Ex: analisador_multimodal")
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default="award", help_text="Nome do ícone da Lucide-react")
    category = models.CharField(max_length=50, default="Geral")

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """
    Tabela de relacionamento entre o Perfil do Usuário e as Conquistas Desbloqueadas.
    """
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile', 'badge')

    def __str__(self):
        return f"{self.profile.user.username} desbloqueou {self.badge.name}"


class StudyMaterial(models.Model):
    """
    Representa a mídia que o usuário enviou à IA para descriptografia técnica.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materials')
    name = models.CharField(max_length=255, help_text="Nome amigável do arquivo carregado")
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=100, blank=True, help_text="Classificação técnica confirmada pelo usuário")
    is_active_pathway = models.BooleanField(default=False, help_text="Se este material é a trilha atual em andamento")

    def __str__(self):
        return f"{self.name} ({self.category or 'Sem categoria'}) por {self.user.username}"


class StudyPathway(models.Model):
    """
    O Walkthrough de estudos gerado pelo Gemini correspondente a um material específico.
    """
    material = models.OneToOneField(StudyMaterial, on_delete=models.CASCADE, related_name='pathway')
    complexity = models.CharField(max_length=50, help_text="Iniciante, Intermediário, Avançado")
    justified_pedagogy = models.TextField()
    estimated_time = models.CharField(max_length=50, help_text="Ex: '3 semanas' ou '48 horas'")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trilha para: {self.material.name} ({self.complexity})"


class PathwayColor(models.Model):
    """
    Resultado técnico da extração multimodal de cores.
    """
    pathway = models.ForeignKey(StudyPathway, on_delete=models.CASCADE, related_name='colors')
    hex_code = models.CharField(max_length=7, help_text="Formato: #123456")
    color_name = models.CharField(max_length=50)
    psychology = models.TextField()
    usage = models.TextField()

    def __str__(self):
        return f"{self.color_name} ({self.hex_code}) em {self.pathway.material.name}"


class StudyTopic(models.Model):
    """
    Cada assunto individual integrante da grade curricular guiada do Walkthrough.
    """
    pathway = models.ForeignKey(StudyPathway, on_delete=models.CASCADE, related_name='topics')
    order = models.PositiveIntegerField(help_text="Ordem cronológica sugerida para estudos")
    name = models.CharField(max_length=150)
    summary = models.TextField(help_text="Explicação conceitual e pedagógica do conteúdo fornecida pelo mentor")
    xp_reward = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.order}. {self.name} ({self.xp_reward} XP)"


class UserTopicCompletion(models.Model):
    """
    Estado de conclusão do tópico por usuário. Usado para conceder XP e marcar progresso na UI.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(StudyTopic, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'topic')

    def __str__(self):
        return f"{self.user.username} dominou: {self.topic.name}"
