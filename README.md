# UrbanMind
Progetto UrbanMind ingegneria del software

## 🚀 Avvio Veloce con Docker

### Prerequisiti
- Docker Desktop installato
- Docker Compose installato

### Avvio dell'applicazione

```bash
# 1. Clona il repository
git clone <repository-url>
cd UrbanMind

# 2. Avvia tutti i servizi
docker-compose up -d

# 3. Controlla lo stato dei servizi
docker-compose ps

# 4. Visualizza i log
docker-compose logs -f
```

### Accesso ai servizi

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

### Comandi utili

```bash
# Fermare i servizi
docker-compose down

# Fermare e rimuovere i volumi (dati database)
docker-compose down -v

# Riavviare un singolo servizio
docker-compose restart backend

# Rebuild delle immagini
docker-compose up -d --build

# Accedere alla shell di un container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🔧 Sviluppo Locale (senza Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### MongoDB
Assicurati di avere MongoDB in esecuzione localmente sulla porta 27017.

## 📁 Struttura del Progetto

```
UrbanMind/
├── backend/          # API Node.js/Express
├── frontend/         # App Vue.js
├── docs/            # Documentazione
├── docker-compose.yml
└── README.md
```

## 🗄️ Database Seed

Per popolare il database con dati di esempio:

```bash
cd backend
node scripts/seedHistoricalData.js
```

## 📚 Documentazione API

Le API sono documentate secondo lo standard OpenAPI 3.0:

**📖 [Documentazione API Completa](docs/API_DOCUMENTATION.md)**

**📋 [Specifica OpenAPI](docs/openapi.yaml)**

Endpoints principali:
- `POST /api/users/login` - Autenticazione
- `GET /api/budgets` - Lista budget con filtri
- `GET /api/budgets/report/{format}` - Download report CSV/JSON 
- `GET /api/budgets/compare/years` - Confronto multi-anno
- `GET /api/budgets/stats/{year}` - Statistiche aggregate
