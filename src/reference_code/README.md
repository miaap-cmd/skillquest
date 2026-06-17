# SkillQuest - Guia de Deploy de Produção (Django & Next.js)

Este repositório contém a infraestrutura e arquitetura necessárias para inicializar a plataforma gamificada **SkillQuest** na sua máquina local ou em servidores de produção (PaaS/IaaS).

A estrutura está separada em:
1. **Backend**: API REST robusta construída em Python utilizando **Django & Django REST Framework (DRF)** integrado ao motor de IA do Copilot.
2. **Frontend**: Aplicação interativa de alta performance construída em TypeScript utilizando **Next.js & Tailwind CSS**.

---

## 🛠️ Requisitos de Infraestrutura

- **Python**: versão `3.10` ou superior.
- **Node.js**: versão `18.x` ou superior.
- **Banco de Dados**: PostgreSQL (padrão de produção do SkillQuest, recomendável) ou SQLite para testes rápidos locais.
- **Chave de API do Copilot**: Configure a credencial adequada no ambiente de deployment ou na plataforma de autenticação escolhida.

---

## 📦 1. Configurando o Backend (Django REST Framework)

### Passo 1.1: Instalação das Dependências Técnicas
Navegue até a pasta do backend no seu terminal de desenvolvimento, crie um ambiente virtual e ative-o:

```bash
# Criar o ambiente virtual
python -m venv venv

# Ativar no macOS ou Linux
source venv/bin/activate

# Ativar no Windows (Prompt de comando)
venv\Scripts\activate
```

Agora instale as dependências essenciais de produção:

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv pillow psycopg2-binary requests
```

### Passo 1.2: Configuração das Variáveis de Ambiente (`.env`)
No diretório raiz do seu projeto Django, crie um arquivo `.env` com os seguintes parâmetros secretos:

```env
# Configurações do Django
DEBUG=True
SECRET_KEY="sua_chave_secreta_django_aqui"

# Conexão com Banco de Dados (PostgreSQL de exemplo)
DATABASE_URL="postgres://usuario:senha@localhost:5432/db_skillquest"

# Conexão com a IA do Copilot (Obrigatória de Produção)
COPILOT_API_KEY="your-copilot-api-key"
COPILOT_MODEL="copilot-default"
```

### Passo 1.3: Conectar no `settings.py` do Django
Garanta que seu arquivo de configurações `settings.py` inclua cors headers e carregue as variáveis de ambiente:

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Instalar Apps
INSTALLED_APPS = [
    # ... Django internals
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'skillquest_app', # Seu app Django construído a partir dos modelos/views fornecidos
]

# Configurar Middlewares
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... outros middlewares
]

# Configurar CORS para permitir o Next.js
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:4000",
]

# Carrega Chave de API do Copilot para o Serviço
COPILOT_API_KEY = os.getenv("COPILOT_API_KEY")
COPILOT_MODEL = os.getenv("COPILOT_MODEL", "copilot-default")

# Configurar DRF com autenticação baseada em JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
```

### Passo 1.4: Migrações de Banco de Dados e Execução
Execute as migrações para inicializar os modelos estruturais de gamificação (Perfil, Medalhas, Históricos de Trilhas):

```bash
python manage.py makemigrations
python manage.py migrate

# (Opcional) Crie suas badges iniciais do sistema abrindo o shell do Django:
python manage.py shell
```

Dentro do shell, adicione as primeiras medalhas representadas:
```python
from skillquest_app.models import Badge
Badge.objects.get_or_create(id_name="analisador_multimodal", name="Analisador Multimodal", description="Subiu 5 mídias diferentes para o motor reverso.", icon_name="eye", category="Exploração")
Badge.objects.get_or_create(id_name="foco_total", name="Foco Total", description="Dominou o primeiro assunto conceitual na trilha ativa.", icon_name="target", category="Estudos")
```

Agora inicialize o servidor de desenvolvimento Django na porta `8000`:
```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 🎨 2. Configurando o Frontend (Next.js + Tailwind CSS)

### Passo 2.1: Instalar dependências de UI
Navegue até o diretório do frontend no terminal e execute a instalação de dependências:

```bash
npm install lucide-react classnames
# Se estiver usando Next 13/14 com Tailwind v4, insira as importações cromáticas no CSS global.
```

### Passo 2.2: Configurando Variáveis ambientais do Next.js (`.env.local`)
No diretório raiz do seu projeto Next.js, crie um arquivo `.env.local` definindo onde o frontend deve buscar as APIs seguras do Django:

```env
# URL da API do Servidor Django de Produção
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

### Passo 2.3: Compilando e Rodando o Servidor de Desenvolvimento Next.js
Rode o comando de inicialização local:

```bash
# Modo Desenvolvimento
npm run dev
```

O Next.js estará acessível no endereço http://localhost:3000.

---

## 🎮 Regras do Motor de Gamificação

O SkillQuest utiliza fórmulas precisas para manter o usuário imerso na aprendizagem reversa:
- **XP Progression**: O XP necessário para atingir o próximo nível evolui pela fórmula: `XP_NÉCESSÁRIO = NÍVEL_ATUAL * 1000`. E.g., para o Lvl 4 subir para Lvl 5, o usuário precisa de 4,000 XP acumulados.
- **Multimodal Scanning (+100 XP)**: Uploads de imagens iniciam um webhook na API do Copilot. Uma resposta detalhada cria um `StudyPathway` e atribui 100 XP por "descriptografar" o tema.
- **Topic Checked (+50 a +200 XP)**: O usuário valida que estudou, ganhando o XP demarcado (frequentemente 100 XP para tópicos secundários e 200 XP para tópicos avançados). Se desmarcado por engano, o XP é removido com reajuste automático de nível.
- **Streak de Ofensiva**: Monitorado no banco de dados. Caso o usuário complete ou crie trilhas em dias subsequentes, a ofensiva soma +1. Caso haja um intervalo maior que 24h a partir do último dia ativo, a ofensiva é reiniciada para 1.
- **Unlocking Badges**: Gatilhos automáticos dentro dos sinais de persistência (`post_save` do Django ou Views estruturadas) realizam verificações lógicas de conquistas para conferir medalhas com destaque visual em verde-água `#40C9AD`.
