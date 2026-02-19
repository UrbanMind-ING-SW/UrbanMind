# Web APIs

Le API sono state documentate secondo le specifiche OpenAPI 3.0 e la documentazione è consultabile nel file `docs/openapi.yaml` del repository. Le API seguono i principi REST e utilizzano autenticazione JWT per gli endpoint protetti.

## Scelte di Design delle API

- **Autenticazione**: JWT Bearer token per proteggere gli endpoint sensibili (creazione/modifica budget)
- **Paginazione**: Implementata per tutte le liste con parametri `page` e `limit` 
- **Filtri**: Supporto per filtri multipli su categorie, anni, stato e dipartimento
- **Formati di Output**: JSON per dati strutturati, CSV per report scaricabili
- **Aggregazioni**: Endpoint dedicati per statistiche e confronti tra anni
- **Validazione**: Validazione completa dei dati in input con express-validator
- **Error Handling**: Risposte strutturate con `success: boolean` e messaggi descrittivi

## Endpoints Principali

### Autenticazione
- `POST /api/users/login` - Login utente
- `POST /api/users/register` - Registrazione nuovo utente

### Gestione Budget
- `GET /api/budgets` - Lista budget con filtri e paginazione
- `POST /api/budgets` - Creazione nuovo budget (richiede auth)
- `GET /api/budgets/{id}` - Dettagli budget specifico
- `GET /api/budgets/stats/{year}` - Statistiche aggregate per anno
- `GET /api/budgets/compare/years?years=2023,2024,2025` - Confronto multi-anno
- `GET /api/budgets/categories/list` - Liste categorie con conteggi
- `GET /api/budgets/report/{format}?year=2025&category=trasporti` - Generazione report

### Caratteristiche Tecniche
- **Base URL Development**: `http://localhost:3000/api`
- **Base URL Production**: `https://urbanmind-backend.onrender.com/api`
- **Content-Type**: `application/json` per la maggior parte degli endpoint
- **Autenticazione**: `Authorization: Bearer <token>` negli header
- **CORS**: Configurato per permettere richieste dal frontend

La specifica completa delle API è disponibile nel repository al link [docs/openapi.yaml](docs/openapi.yaml). Il contenuto del file .yaml fornisce la documentazione completa di tutti gli endpoint, parametri, request/response schema e codici di stato.

## Esempi di Utilizzo

### Login e Ottenimento Token
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "operatore@comune.it", "password": "operatore123"}'
```

### Download Report CSV
```bash
curl -X GET "http://localhost:3000/api/budgets/report/csv?year=2025" \
  -H "Authorization: Bearer <token>" \
  -o bilancio_2025.csv
```

### Confronto Multi-Anno
```bash
curl -X GET "http://localhost:3000/api/budgets/compare/years?years=2023,2024,2025" \
  -H "Authorization: Bearer <token>"
```