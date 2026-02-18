const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/reports
// @desc    Ottieni tutte le segnalazioni con filtri
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      priority,
      city,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Costruisci filtri
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (city) filters['location.city'] = new RegExp(city, 'i');
    
    // Configurazione paginazione
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Configurazione ordinamento
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Query con populate per i riferimenti
    const reports = await Report.find(filters)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    // Conta totale per paginazione
    const total = await Report.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: pageNumber,
          pages: Math.ceil(total / limitNumber),
          total,
          hasNext: pageNumber * limitNumber < total,
          hasPrev: pageNumber > 1
        }
      }
    });
  } catch (error) {
    console.error('Errore nel recupero segnalazioni:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/reports/:id
// @desc    Ottieni segnalazione per ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name')
      .populate('votes.upvotes', 'name')
      .populate('votes.downvotes', 'name');
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Segnalazione non trovata' });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Errore nel recupero segnalazione:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID segnalazione non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/reports
// @desc    Crea nuova segnalazione
// @access  Private
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Il titolo deve essere tra 5 e 200 caratteri'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descrizione deve essere tra 10 e 2000 caratteri'),
  body('category')
    .isIn(['strade', 'illuminazione', 'rifiuti', 'trasporti', 'verde-pubblico', 'sicurezza', 'altro'])
    .withMessage('Categoria non valida'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('L\'indirizzo è obbligatorio'),
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitudine non valida'),
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitudine non valida'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('La città è obbligatoria'),
  body('reporter')
    .isMongoId()
    .withMessage('ID reporter non valido')
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
    
    const report = new Report(req.body);
    await report.save();
    
    // Popola i campi per la risposta
    await report.populate('reporter', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Segnalazione creata con successo',
      data: report
    });
  } catch (error) {
    console.error('Errore nella creazione segnalazione:', error);
    
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

// @route   PUT /api/reports/:id
// @desc    Aggiorna segnalazione
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const allowedUpdates = ['title', 'description', 'priority', 'status', 'assignedTo', 'resolutionNotes'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    // Se lo status diventa 'risolto', imposta resolvedAt
    if (updates.status === 'risolto') {
      updates.resolvedAt = new Date();
    }
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('reporter', 'name email')
     .populate('assignedTo', 'name email');
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Segnalazione non trovata' });
    }
    
    res.json({
      success: true,
      message: 'Segnalazione aggiornata con successo',
      data: report
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento segnalazione:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID segnalazione non valido' });
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

// @route   POST /api/reports/:id/vote
// @desc    Vota una segnalazione
// @access  Private
router.post('/:id/vote', [
  body('type')
    .isIn(['upvote', 'downvote'])
    .withMessage('Tipo di voto non valido'),
  body('userId')
    .isMongoId()
    .withMessage('ID utente non valido')
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
    
    const { type, userId } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Segnalazione non trovata' });
    }
    
    // Rimuovi voti precedenti dell'utente
    report.votes.upvotes = report.votes.upvotes.filter(id => id.toString() !== userId);
    report.votes.downvotes = report.votes.downvotes.filter(id => id.toString() !== userId);
    
    // Aggiungi nuovo voto
    if (type === 'upvote') {
      report.votes.upvotes.push(userId);
    } else {
      report.votes.downvotes.push(userId);
    }
    
    await report.save();
    
    res.json({
      success: true,
      message: 'Voto registrato con successo',
      data: {
        upvotes: report.votes.upvotes.length,
        downvotes: report.votes.downvotes.length
      }
    });
  } catch (error) {
    console.error('Errore nella votazione:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/reports/:id/comments
// @desc    Aggiungi commento a segnalazione
// @access  Private
router.post('/:id/comments', [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Il commento deve essere tra 1 e 500 caratteri'),
  body('user')
    .isMongoId()
    .withMessage('ID utente non valido')
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
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Segnalazione non trovata' });
    }
    
    report.comments.push({
      user: req.body.user,
      text: req.body.text
    });
    
    await report.save();
    
    // Popola l'ultimo commento aggiunto
    await report.populate('comments.user', 'name');
    const newComment = report.comments[report.comments.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Commento aggiunto con successo',
      data: newComment
    });
  } catch (error) {
    console.error('Errore nell\'aggiunta commento:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Elimina segnalazione
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Segnalazione non trovata' });
    }
    
    res.json({
      success: true,
      message: 'Segnalazione eliminata con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione segnalazione:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID segnalazione non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

module.exports = router;