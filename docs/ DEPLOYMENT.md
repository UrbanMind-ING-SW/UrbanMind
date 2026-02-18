# 🚀 Deployment su Render

## Prerequisiti

1. Account Render gratuito: https://render.com
2. Account MongoDB Atlas gratuito: https://www.mongodb.com/cloud/atlas
3. Repository Git (GitHub, GitLab, ecc.)

## Passo 1: Configura MongoDB Atlas (Database)

1. Vai su https://www.mongodb.com/cloud/atlas
2. Crea un nuovo cluster gratuito (M0)
3. Configura un utente database (salva username e password)
4. Nella sezione "Network Access", aggiungi `0.0.0.0/0` per permettere connessioni da Render
5. Ottieni la stringa di connessione: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/urbanmind`

## Passo 2: Deploy con render.yaml (AUTOMATICO)

### Opzione A: Deploy automatico con file render.yaml

1. Push del codice su GitHub
2. Vai su Render Dashboard
3. Click su "New" → "Blueprint"
4. Connetti il tuo repository
5. Render leggerà automaticamente `render.yaml`
6. Configura la variabile d'ambiente `MONGODB_URI`:
   - Vai in backend service → Environment
   - Aggiungi `MONGODB_URI` = la tua connection string di MongoDB Atlas

### Opzione B: Deploy manuale (senza render.yaml)

Se Render da errori con `render.yaml`, configura i servizi manualmente:

#### Backend:
1. Dashboard Render → "New" → "Web Service"
2. Connetti repository
3. Configurazione:
   - **Name**: urbanmind-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Aggiungi variabili d'ambiente:
   - `NODE_ENV` = production
   - `MONGODB_URI` = (la tua stringa MongoDB Atlas)
   - `JWT_SECRET` = (genera una stringa casuale sicura)
   - `PORT` = 10000

#### Frontend:
1. Dashboard Render → "New" → "Static Site"
2. Connetti repository
3. Configurazione:
   - **Name**: urbanmind-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. Aggiungi variabile d'ambiente:
   - `VITE_API_URL` = https://urbanmind-backend.onrender.com/api
5. Opzionale - Aggiungi rewrite rule per SPA:
   - Source: `/*`
   - Destination: `/index.html`

## Passo 3: Seed del Database

Dopo il primo deploy del backend:

```bash
# Connettiti al backend da terminale locale
curl https://urbanmind-backend.onrender.com/

# Oppure esegui lo script di seed localmente puntando al DB remoto
MONGODB_URI="mongodb+srv://..." node backend/scripts/seedHistoricalData.js
```

## Passo 4: Test

1. Visita il tuo sito frontend: `https://urbanmind-frontend.onrender.com`
2. Verifica che il backend risponda: `https://urbanmind-backend.onrender.com/`

## Note Importanti

⚠️ **Limitazioni Piano Free Render:**
- Il servizio va in "sleep" dopo 15 minuti di inattività
- Primo caricamento dopo sleep può richiedere 30-60 secondi
- 750 ore/mese di runtime (sufficienti per 1 servizio sempre attivo)

⚠️ **CORS:**
Se hai problemi CORS, aggiungi il dominio frontend nel backend:
```javascript
// backend/server.js
app.use(cors({
  origin: ['https://urbanmind-frontend.onrender.com', 'http://localhost:5173']
}));
```

⚠️ **MongoDB Atlas:**
- Assicurati che la whitelist IP includa `0.0.0.0/0`
- Free tier: 512MB storage, sufficiente per sviluppo

## Troubleshooting

### Errore "Cannot connect to database"
- Verifica `MONGODB_URI` nelle env variables
- Controlla whitelist IP su MongoDB Atlas

### Frontend non carica dati
- Verifica `VITE_API_URL` nelle env variables
- Controlla i log del backend su Render Dashboard

### Build fallisce
- Verifica che `rootDir` sia impostato correttamente
- Controlla i log di build su Render Dashboard
