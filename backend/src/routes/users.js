const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// @route   GET /api/users
// @desc    Ottieni tutti gli utenti (solo admin)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Errore nel recupero utenti:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/users/:id
// @desc    Ottieni utente per ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utente non trovato' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Errore nel recupero utente:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID utente non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/users/register
// @desc    Registra nuovo utente
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Il nome deve essere tra 2 e 50 caratteri'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Inserisci un email valida'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La password deve avere almeno 6 caratteri'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('L\'età deve essere tra 13 e 120 anni'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Il nome della città non può superare i 100 caratteri')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dati non validi',
        errors: errors.array() 
      });
    }
    
    const { name, email, password, role, age, city } = req.body;
    
    // Controlla se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un utente con questa email esiste già' 
      });
    }
    
    // Crea nuovo utente
    const user = new User({
      name,
      email,
      password,
      role: role || 'citizen',
      age,
      city
    });
    
    await user.save();
    
    // Genera token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Utente registrato con successo',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/users/login
// @desc    Login utente
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Inserisci un email valida'),
  body('password')
    .notEmpty()
    .withMessage('La password è obbligatoria')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dati non validi',
        errors: errors.array() 
      });
    }
    
    const { email, password } = req.body;
    
    // Trova utente e includi password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenziali non valide' 
      });
    }
    
    // Verifica password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenziali non valide' 
      });
    }
    
    // Aggiorna ultimo login
    user.lastLogin = new Date();
    await user.save();
    
    // Genera token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Errore nel login:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   PUT /api/users/:id
// @desc    Aggiorna utente
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Il nome deve essere tra 2 e 50 caratteri'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('L\'età deve essere tra 13 e 120 anni'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Il nome della città non può superare i 100 caratteri')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dati non validi',
        errors: errors.array() 
      });
    }
    
    const allowedUpdates = ['name', 'age', 'city', 'profileImage'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utente non trovato' });
    }
    
    res.json({
      success: true,
      message: 'Utente aggiornato con successo',
      data: user
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento utente:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID utente non valido' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Dati non validi',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Elimina utente (disattivazione)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utente non trovato' });
    }
    
    res.json({
      success: true,
      message: 'Utente disattivato con successo',
      data: user
    });
  } catch (error) {
    console.error('Errore nella disattivazione utente:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID utente non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

module.exports = router;