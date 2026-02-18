const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true,
    maxlength: [200, 'Il titolo non può superare i 200 caratteri']
  },
  description: {
    type: String,
    required: [true, 'La descrizione è obbligatoria'],
    trim: true,
    maxlength: [2000, 'La descrizione non può superare i 2000 caratteri']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Il budget totale è obbligatorio'],
    min: [0, 'Il budget deve essere un valore positivo']
  },
  allocatedAmount: {
    type: Number,
    default: 0,
    min: [0, 'L\'importo allocato deve essere un valore positivo']
  },
  remainingAmount: {
    type: Number,
    default: function() { return this.totalAmount; }
  },
  category: {
    type: String,
    required: [true, 'La categoria è obbligatoria'],
    enum: [
      'infrastrutture',
      'trasporti',
      'ambiente',
      'sociale',
      'cultura',
      'sicurezza',
      'istruzione',
      'sanita',
      'altro'
    ]
  },
  year: {
    type: Number,
    required: [true, 'L\'anno di riferimento è obbligatorio'],
    min: [2020, 'Anno non valido'],
    max: [2050, 'Anno non valido']
  },
  status: {
    type: String,
    enum: ['proposto', 'approvato', 'in-corso', 'completato', 'annullato'],
    default: 'proposto'
  },
  department: {
    type: String,
    required: [true, 'Il dipartimento è obbligatorio'],
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Il responsabile è obbligatorio']
  },
  allocations: [{
    project: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'L\'importo deve essere positivo']
    },
    description: {
      type: String,
      trim: true
    },
    allocatedAt: {
      type: Date,
      default: Date.now
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  startDate: {
    type: Date,
    required: [true, 'La data di inizio è obbligatoria']
  },
  endDate: {
    type: Date,
    required: [true, 'La data di fine è obbligatoria']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'xlsx', 'image', 'other'],
      default: 'other'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Middleware per aggiornare automaticamente il remainingAmount
budgetSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.allocatedAmount;
  next();
});

// Index per ricerche per anno e categoria
budgetSchema.index({ year: 1, category: 1 });

// Index per ricerche per dipartimento
budgetSchema.index({ department: 1 });

// Metodo per allocare budget
budgetSchema.methods.allocateBudget = function(amount, project, description, userId) {
  if (this.remainingAmount < amount) {
    throw new Error('Budget insufficiente');
  }
  
  this.allocations.push({
    project,
    amount,
    description,
    allocatedBy: userId
  });
  
  this.allocatedAmount += amount;
  this.remainingAmount = this.totalAmount - this.allocatedAmount;
  
  return this.save();
};

module.exports = mongoose.model('Budget', budgetSchema);