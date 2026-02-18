# Dockerfile per Backend UrbanMind
FROM node:20-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file package
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto del codice
COPY . .

# Esponi la porta
EXPOSE 3000

# Comando di avvio (sarà sovrascritto da docker-compose)
CMD ["npm", "run", "dev"]
