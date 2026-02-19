const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/utils/db');

// Carica le variabili d'ambiente
dotenv.config();

// Connetti al database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://urbanmind-frontend.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./src/routes/users'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/budgets', require('./src/routes/budgets'));
app.use('/api/proposals', require('./src/routes/proposals'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'UrbanMind Backend API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Errore interno del server!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});