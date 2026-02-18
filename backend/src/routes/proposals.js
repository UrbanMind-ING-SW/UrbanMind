const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/proposals
// @desc    Ottieni tutte le proposte con filtri
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
    
    const proposals = await Proposal.find(filters)
      .populate('proposer', 'name email')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('comments.user', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    const total = await Proposal.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        proposals,
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
    console.error('Errore nel recupero proposte:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/proposals/:id
// @desc    Ottieni proposta per ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('proposer', 'name email')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('comments.user', 'name')
      .populate('votes.support.user', 'name')
      .populate('votes.against.user', 'name');
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta non trovata' });
    }
    
    res.json({ success: true, data: proposal });
  } catch (error) {
    console.error('Errore nel recupero proposta:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID proposta non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/proposals
// @desc    Crea nuova proposta
// @access  Private
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Il titolo deve essere tra 5 e 200 caratteri'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('La descrizione deve essere tra 20 e 5000 caratteri'),
  body('category')
    .isIn(['infrastrutture', 'trasporti', 'ambiente', 'sociale', 'cultura', 'sicurezza', 'istruzione', 'sanita', 'tecnologia', 'altro'])
    .withMessage('Categoria non valida'),
  body('estimatedCost')
    .isFloat({ min: 0 })
    .withMessage('Il costo stimato deve essere un valore positivo'),
  body('estimatedDuration.value')
    .isInt({ min: 1 })
    .withMessage('La durata deve essere almeno 1'),
  body('estimatedDuration.unit')
    .isIn(['giorni', 'settimane', 'mesi', 'anni'])
    .withMessage('Unità di durata non valida'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('La città è obbligatoria'),
  body('proposer')
    .isMongoId()
    .withMessage('ID proponente non valido')
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
    
    const proposal = new Proposal(req.body);
    await proposal.save();
    
    await proposal.populate('proposer', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Proposta creata con successo',
      data: proposal
    });
  } catch (error) {
    console.error('Errore nella creazione proposta:', error);
    
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

// @route   PUT /api/proposals/:id
// @desc    Aggiorna proposta
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'title', 'description', 'estimatedCost', 'estimatedDuration',
      'status', 'priority', 'assignedTo', 'reviewedBy', 'reviewNotes',
      'implementationPlan', 'deadlineAt'
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    // Se la proposta viene revisionata, imposta reviewedAt
    if (updates.reviewedBy || updates.reviewNotes) {
      updates.reviewedAt = new Date();
    }
    
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('proposer', 'name email')
     .populate('assignedTo', 'name email')
     .populate('reviewedBy', 'name email');
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta non trovata' });
    }
    
    res.json({
      success: true,
      message: 'Proposta aggiornata con successo',
      data: proposal
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento proposta:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID proposta non valido' });
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

// @route   POST /api/proposals/:id/submit
// @desc    Sottometti proposta per revisione
// @access  Private
router.post('/:id/submit', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta non trovata' });
    }
    
    try {
      await proposal.submit();
      
      res.json({
        success: true,
        message: 'Proposta sottomessa con successo',
        data: proposal
      });
    } catch (submitError) {
      return res.status(400).json({
        success: false,
        message: submitError.message
      });
    }
  } catch (error) {
    console.error('Errore nella sottomissione proposta:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/proposals/:id/vote
// @desc    Vota una proposta
// @access  Private
router.post('/:id/vote', [
  body('type')
    .isIn(['support', 'against'])
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
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta non trovata' });
    }
    
    // Rimuovi voti precedenti dell'utente
    proposal.votes.support = proposal.votes.support.filter(vote => vote.user.toString() !== userId);
    proposal.votes.against = proposal.votes.against.filter(vote => vote.user.toString() !== userId);
    
    // Aggiungi nuovo voto
    if (type === 'support') {
      proposal.votes.support.push({ user: userId });
    } else {
      proposal.votes.against.push({ user: userId });
    }
    
    await proposal.save();
    
    res.json({
      success: true,
      message: 'Voto registrato con successo',
      data: {
        support: proposal.votes.support.length,
        against: proposal.votes.against.length,
        total: proposal.votes.support.length + proposal.votes.against.length
      }
    });
  } catch (error) {
    console.error('Errore nella votazione:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/proposals/:id/comments
// @desc    Aggiungi commento a proposta
// @access  Private
router.post('/:id/comments', [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Il commento deve essere tra 1 e 1000 caratteri'),
  body('user')
    .isMongoId()
    .withMessage('ID utente non valido'),
  body('type')
    .optional()
    .isIn(['pubblico', 'interno'])
    .withMessage('Tipo di commento non valido')
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
    
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta non trovata' });
    }
    
    proposal.comments.push({
      user: req.body.user,
      text: req.body.text,
      type: req.body.type || 'pubblico'
    });
    
    await proposal.save();
    
    await proposal.populate('comments.user', 'name');
    const newComment = proposal.comments[proposal.comments.length - 1];
    
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

// @route   GET /api/proposals/stats/overview
// @desc    Ottieni statistiche generali proposte
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Proposal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimatedCost: { $sum: '$estimatedCost' },
          avgEstimatedCost: { $avg: '$estimatedCost' }
        }
      }
    ]);
    
    const categoryStats = await Proposal.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalEstimatedCost: { $sum: '$estimatedCost' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: stats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Errore nel recupero statistiche:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   DELETE /api/proposals/:id
// @desc    Elimina proposta
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta non trovata' });
    }
    
    res.json({
      success: true,
      message: 'Proposta eliminata con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione proposta:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID proposta non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

module.exports = router;