# Setup Database MongoDB per UrbanMind

Questa guida ti aiuterà a configurare MongoDB per l'applicazione UrbanMind.

## Prerequisiti

- Node.js (versione 16 o superiore)
- MongoDB installato localmente o accesso a MongoDB Atlas

## Opzione 1: MongoDB Locale

### Installazione MongoDB

#### macOS (con Homebrew)
```bash
# Installa MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Avvia il servizio MongoDB
brew services start mongodb/brew/mongodb-community
```

#### Windows
1. Scarica MongoDB Community Server da: https://www.mongodb.com/try/download/community
2. Esegui l'installer e segui le istruzioni
3. Avvia MongoDB come servizio Windows

#### Linux (Ubuntu/Debian)
```bash
# Importa la chiave pubblica
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Aggiungi il repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Aggiorna e installa
sudo apt-get update
sudo apt-get install -y mongodb-org

# Avvia il servizio
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Verifica dell'installazione
```bash
# Connettiti a MongoDB
mongosh

# Se funziona, dovresti vedere il prompt di MongoDB
# Esci con: exit
```

## Opzione 2: MongoDB Atlas (Cloud)

1. **Crea un account gratuito** su [MongoDB Atlas](https://cloud.mongodb.com/)

2. **Crea un cluster**:
   - Scegli "Build a Database"
   - Seleziona "M0 Sandbox" (gratuito)
   - Scegli una regione vicina

3. **Configura sicurezza**:
   - Crea un utente database con username e password
   - Aggiungi il tuo IP alle IP Access List (0.0.0.0/0 per sviluppo)

4. **Ottieni la stringa di connessione**:
   - Clicca "Connect" sul tuo cluster
   - Scegli "Connect your application"
   - Copia la connection string

## Configurazione dell'Applicazione

### 1. Installa le dipendenze
```bash
cd backend
npm install
```

### 2. Configura le variabili d'ambiente

Crea un file `.env` nella cartella `backend`:

```bash
cp .env.example .env
```

Modifica il file `.env`:

#### Per MongoDB Locale:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/urbanmind

# Server
PORT=3000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Ambiente
NODE_ENV=development
```

#### Per MongoDB Atlas:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/urbanmind?retryWrites=true&w=majority

# Server
PORT=3000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Ambiente
NODE_ENV=development
```

> **⚠️ IMPORTANTE**: Sostituisci `username`, `password` e l'URL con i tuoi dati reali di MongoDB Atlas.

### 3. Avvia il server
```bash
# Modalità sviluppo (con auto-restart)
npm run dev

# Modalità produzione
npm start
```

Se tutto è configurato correttamente, dovresti vedere:
```
Server in esecuzione sulla porta 3000
MongoDB Connected: [host del tuo database]
```

## Struttura del Database

Il database `urbanmind` conterrà le seguenti collezioni:

### Users (Utenti)
- Cittadini, operatori e amministratori
- Autenticazione con password hash
- Profili con informazioni demografiche

### Reports (Segnalazioni)
- Segnalazioni di problemi urbani
- Geolocalizzazione, immagini, commenti
- Sistema di voti e assegnazioni

### Budgets (Budget)
- Gestione budget comunali
- Allocazioni a progetti
- Tracking spese e rimanenze

### Proposals (Proposte)
- Proposte di miglioramento cittadino
- Votazioni pubbliche
- Piani di implementazione

## Test delle API

### 1. Verifica connessione
```bash
curl http://localhost:3000
```

### 2. Test registrazione utente
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "password": "password123",
    "city": "Roma",
    "age": 30
  }'
```

### 3. Test login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mario@example.com",
    "password": "password123"
  }'
```

## Dati di Test

Per popolare il database con dati di test, puoi utilizzare questi comandi MongoDB:

```javascript
// Connettiti con mongosh al database
use urbanmind

// Crea utenti di test
db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@urbanmind.com",
    password: "$2a$10$...", // password: admin123
    role: "admin",
    city: "Roma",
    age: 35,
    isActive: true
  },
  {
    name: "Operatore Comunale",
    email: "operatore@comune.roma.it",
    password: "$2a$10$...", // password: operatore123
    role: "operator", 
    city: "Roma",
    age: 40,
    isActive: true
  }
])
```

## Troubleshooting

### Errore: "MongoNetworkError"
- Verifica che MongoDB sia in esecuzione
- Controlla la connection string in `.env`
- Per Atlas, verifica IP whitelist e credenziali

### Errore: "Authentication failed"
- Verifica username/password per MongoDB Atlas
- Assicurati che l'utente abbia i permessi necessari

### Errore: "Cannot connect to MongoDB"
- Per installazione locale: `brew services restart mongodb/brew/mongodb-community`
- Verifica che la porta 27017 non sia bloccata

### Errore: "ValidationError"
- Controlla che i dati inseriti rispettino i vincoli del modello
- Verifica i campi obbligatori nelle API

## Strumenti Consigliati

1. **MongoDB Compass** - GUI per esplorare il database
   - Download: https://www.mongodb.com/products/compass

2. **Postman** - Per testare le API
   - Download: https://www.postman.com/

3. **Studio 3T** - IDE avanzato per MongoDB
   - Download: https://studio3t.com/

## Sicurezza

### In Produzione:
1. Cambia `JWT_SECRET` con una chiave robusta
2. Usa `NODE_ENV=production`
3. Limita IP access list in MongoDB Atlas
4. Abilita SSL/TLS
5. Implementa rate limiting
6. Aggiungi validazione aggiuntiva

### Best Practices:
- Non committare mai il file `.env`
- Usa password complesse per il database
- Fai backup regolari del database
- Monitora i log per tentativi di accesso non autorizzati

## Script Utili

Aggiungi questi script al `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed": "node scripts/seed.js",
    "reset-db": "node scripts/reset-database.js"
  }
}
```

Il setup è ora completo! Il tuo backend UrbanMind dovrebbe essere pronto per la connessione con il frontend Vue.js.