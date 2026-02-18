const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware per verificare il token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token di accesso richiesto' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Trova l'utente nel database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token non valido o utente non attivo' 
      });
    }
    
    // Aggiungi l'utente alla request
    req.user = user;
    next();
  } catch (error) {
    console.error('Errore nell\'autenticazione:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token non valido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token scaduto' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Errore del server' 
    });
  }
};

// Middleware per verificare il ruolo dell'utente
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Autenticazione richiesta' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Permessi insufficienti' 
      });
    }
    
    next();
  };
};

// Middleware per verificare che l'utente sia il proprietario della risorsa
const requireOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Autenticazione richiesta' 
      });
    }
    
    // Gli admin possono accedere a tutto
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Verifica ownership (implementato nelle route specifiche)
    req.requireOwnership = {
      userId: req.user._id,
      field: resourceUserField
    };
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership
};