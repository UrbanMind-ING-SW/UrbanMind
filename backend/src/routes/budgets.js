const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { body, validationResult } = require('express-validator');

// @route   GET /api/budgets
// @desc    Ottieni tutti i budget con filtri
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      year,
      department,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Costruisci filtri
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (year) filters.year = parseInt(year);
    if (department) filters.department = new RegExp(department, 'i');
    
    // Configurazione paginazione
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Configurazione ordinamento
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const budgets = await Budget.find(filters)
      .populate('manager', 'name email')
      .populate('approvedBy', 'name email')
      .populate('allocations.allocatedBy', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    const total = await Budget.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        budgets,
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
    console.error('Errore nel recupero budget:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/budgets/:id
// @desc    Ottieni budget per ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('approvedBy', 'name email')
      .populate('allocations.allocatedBy', 'name email');
    
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget non trovato' });
    }
    
    res.json({ success: true, data: budget });
  } catch (error) {
    console.error('Errore nel recupero budget:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID budget non valido' });
    }
    
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   POST /api/budgets
// @desc    Crea nuovo budget
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Il titolo deve essere tra 5 e 200 caratteri'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descrizione deve essere tra 10 e 2000 caratteri'),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Il budget totale deve essere un valore positivo'),
  body('category')
    .isIn(['infrastrutture', 'trasporti', 'ambiente', 'sociale', 'cultura', 'sicurezza', 'istruzione', 'sanita', 'altro'])
    .withMessage('Categoria non valida'),
  body('year')
    .isInt({ min: 2020, max: 2050 })
    .withMessage('Anno non valido'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Il dipartimento è obbligatorio'),
  body('manager')
    .isMongoId()
    .withMessage('ID manager non valido'),
  body('startDate')
    .isISO8601()
    .withMessage('Data di inizio non valida'),
  body('endDate')
    .isISO8601()
    .withMessage('Data di fine non valida')
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
    
    // Verifica che la data di fine sia successiva a quella di inizio
    if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'La data di fine deve essere successiva alla data di inizio'
      });
    }
    
    const budget = new Budget(req.body);
    await budget.save();
    
    await budget.populate('manager', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Budget creato con successo',
      data: budget
    });
  } catch (error) {
    console.error('Errore nella creazione budget:', error);
    
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

// @route   PUT /api/budgets/:id
// @desc    Aggiorna budget
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'title', 'description', 'totalAmount', 'status', 
      'startDate', 'endDate', 'approvedBy', 'documents'
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    // Se il budget viene approvato, imposta approvedAt
    if (updates.status === 'approvato') {
      updates.approvedAt = new Date();
    }
    
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('manager', 'name email')
     .populate('approvedBy', 'name email');
    
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget non trovato' });
    }
    
    res.json({
      success: true,
      message: 'Budget aggiornato con successo',
      data: budget
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento budget:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID budget non valido' });
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

// @route   POST /api/budgets/:id/allocate
// @desc    Alloca budget a un progetto
// @access  Private
router.post('/:id/allocate', [
  body('project')
    .trim()
    .notEmpty()
    .withMessage('Il nome del progetto è obbligatorio'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('L\'importo deve essere un valore positivo'),
  body('description')
    .optional()
    .trim(),
  body('allocatedBy')
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
    
    const { project, amount, description, allocatedBy } = req.body;
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget non trovato' });
    }
    
    try {
      await budget.allocateBudget(amount, project, description, allocatedBy);
      
      await budget.populate('allocations.allocatedBy', 'name email');
      
      res.json({
        success: true,
        message: 'Budget allocato con successo',
        data: budget
      });
    } catch (allocationError) {
      return res.status(400).json({
        success: false,
        message: allocationError.message
      });
    }
  } catch (error) {
    console.error('Errore nell\'allocazione budget:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/budgets/stats/:year
// @desc    Ottieni statistiche budget per anno
// @access  Public
router.get('/stats/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    const stats = await Budget.aggregate([
      { $match: { year: year } },
      {
        $group: {
          _id: '$category',
          totalBudget: { $sum: '$totalAmount' },
          allocatedBudget: { $sum: '$allocatedAmount' },
          remainingBudget: { $sum: '$remainingAmount' },
          count: { $sum: 1 },
          avgBudget: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalBudget: -1 } }
    ]);
    
    const totalStats = await Budget.aggregate([
      { $match: { year: year } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$totalAmount' },
          allocatedBudget: { $sum: '$allocatedAmount' },
          remainingBudget: { $sum: '$remainingAmount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byCategory: stats,
        total: totalStats[0] || {
          totalBudget: 0,
          allocatedBudget: 0,
          remainingBudget: 0,
          count: 0
        }
      }
    });
  } catch (error) {
    console.error('Errore nel recupero statistiche:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/budgets/compare/years
// @desc    Confronta dati tra anni diversi
// @access  Public
router.get('/compare/years', async (req, res) => {
  try {
    const { years } = req.query;
    if (!years) {
      return res.status(400).json({ success: false, message: 'Specificare gli anni da confrontare (es: ?years=2022,2023,2024)' });
    }

    const yearsList = years.split(',').map(y => parseInt(y.trim()));
    
    const comparison = [];
    
    for (const year of yearsList) {
      const stats = await Budget.aggregate([
        { $match: { year: year } },
        {
          $group: {
            _id: '$category',
            totalBudget: { $sum: '$totalAmount' },
            allocatedBudget: { $sum: '$allocatedAmount' },
            remainingBudget: { $sum: '$remainingAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const totalStats = await Budget.aggregate([
        { $match: { year: year } },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$totalAmount' },
            allocatedBudget: { $sum: '$allocatedAmount' },
            remainingBudget: { $sum: '$remainingAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      comparison.push({
        year,
        byCategory: stats,
        total: totalStats[0] || {
          totalBudget: 0,
          allocatedBudget: 0,
          remainingBudget: 0,
          count: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        comparison,
        years: yearsList
      }
    });
  } catch (error) {
    console.error('Errore nel confronto anni:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/budgets/categories/list
// @desc    Ottieni l'elenco delle categorie (missioni) disponibili per filtri
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Budget.distinct('category');
    
    const categoriesWithCounts = await Budget.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBudget: { $sum: '$totalAmount' },
          years: { $addToSet: '$year' }
        }
      },
      { 
        $project: {
          category: '$_id',
          count: 1,
          totalBudget: 1,
          years: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        categories,
        details: categoriesWithCounts
      }
    });
  } catch (error) {
    console.error('Errore nel recupero categorie:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// @route   GET /api/budgets/report/:format
// @desc    Genera report in diversi formati
// @access  Public
router.get('/report/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { year = 2025, category } = req.query;  // Default 2025 (ultimo anno con dati)
    
    console.log('Report request - format:', format, 'year:', year, 'category:', category);
    
    const filters = { year: parseInt(year) };
    if (category) filters.category = category;
    
    const budgets = await Budget.find(filters)
      .populate('manager', 'name')
      .populate('approvedBy', 'name')
      .sort({ category: 1, totalAmount: -1 });
    
    console.log('Found budgets:', budgets.length);

    const stats = await Budget.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$category',
          totalBudget: { $sum: '$totalAmount' },
          allocatedBudget: { $sum: '$allocatedAmount' },
          remainingBudget: { $sum: '$remainingAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalStats = await Budget.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$totalAmount' },
          allocatedBudget: { $sum: '$allocatedAmount' },
          remainingBudget: { $sum: '$remainingAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (format === 'json') {
      res.json({
        success: true,
        data: {
          budgets,
          statistics: {
            byCategory: stats,
            total: totalStats[0]
          },
          generatedAt: new Date(),
          filters
        }
      });
    } else if (format === 'csv') {
      const csv = generateCSVReport(budgets, stats, totalStats[0], filters);
      console.log('Generated CSV with', csv.length, 'characters');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=bilancio_${year}.csv`);
      res.send(csv);
    } else {
      res.status(400).json({ success: false, message: 'Formato non supportato. Usa json o csv.' });
    }
  } catch (error) {
    console.error('Errore nella generazione report:', error);
    res.status(500).json({ success: false, message: 'Errore del server' });
  }
});

// Funzione helper per generare CSV
function generateCSVReport(budgets, stats, totalStats, filters) {
  let csv = `Report Bilancio Comunale - Anno ${filters.year}\n`;
  if (filters.category) {
    csv += `Categoria: ${filters.category}\n`;
  }
  csv += `Generato il: ${new Date().toLocaleString('it-IT')}\n\n`;
  
  // Check se ci sono dati
  if (budgets.length === 0) {
    csv += 'Nessun dato disponibile per i filtri selezionati.\n';
    return csv;
  }
  
  csv += 'Tipo,Categoria,Titolo,Budget Totale (€),Budget Allocato (€),Budget Rimanente (€),Dipartimento,Responsabile,Stato\n';
  
  // Aggiunge i budget individuali
  budgets.forEach(budget => {
    const title = (budget.title || '').replace(/"/g, '""');
    const department = (budget.department || 'N/A').replace(/"/g, '""');
    const managerName = (budget.manager?.name || 'N/A').replace(/"/g, '""');
    csv += `Budget,"${budget.category}","${title}",${budget.totalAmount},${budget.allocatedAmount},${budget.remainingAmount},"${department}","${managerName}","${budget.status}"\n`;
  });
  
  csv += '\nRiepilogo per Categoria\n';
  csv += 'Categoria,Budget Totale,Budget Allocato,Budget Rimanente,Numero Budget\n';
  
  stats.forEach(stat => {
    csv += `"${stat._id}",${stat.totalBudget},${stat.allocatedBudget},${stat.remainingBudget},${stat.count}\n`;
  });
  
  if (totalStats) {
    csv += '\nTotale Generale\n';
    csv += `Totale,${totalStats.totalBudget},${totalStats.allocatedBudget},${totalStats.remainingBudget},${totalStats.count}\n`;
  }
  
  return csv;
}
module.exports = router;