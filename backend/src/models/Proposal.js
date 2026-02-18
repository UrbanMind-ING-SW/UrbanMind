const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
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
    maxlength: [5000, 'La descrizione non può superare i 5000 caratteri']
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
      'tecnologia',
      'altro'
    ]
  },
  estimatedCost: {
    type: Number,
    required: [true, 'Il costo stimato è obbligatorio'],
    min: [0, 'Il costo deve essere un valore positivo']
  },
  estimatedDuration: {
    value: {
      type: Number,
      required: true,
      min: [1, 'La durata deve essere almeno 1']
    },
    unit: {
      type: String,
      required: true,
      enum: ['giorni', 'settimane', 'mesi', 'anni']
    }
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitudine non valida'],
        max: [90, 'Latitudine non valida']
      },
      lng: {
        type: Number,
        min: [-180, 'Longitudine non valida'],
        max: [180, 'Longitudine non valida']
      }
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    affectedArea: {
      type: String,
      trim: true
    }
  },
  proposer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Il proponente è obbligatorio']
  },
  status: {
    type: String,
    enum: ['bozza', 'sottoposta', 'in-valutazione', 'approvata', 'rifiutata', 'in-sviluppo', 'completata'],
    default: 'bozza'
  },
  priority: {
    type: String,
    enum: ['bassa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  votes: {
    support: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    against: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Il commento non può superare i 1000 caratteri']
    },
    type: {
      type: String,
      enum: ['pubblico', 'interno'],
      default: 'pubblico'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
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
      enum: ['document', 'image', 'video', 'other'],
      default: 'other'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Le note di revisione non possono superare i 2000 caratteri']
  },
  implementationPlan: {
    phases: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      estimatedDuration: {
        value: Number,
        unit: {
          type: String,
          enum: ['giorni', 'settimane', 'mesi']
        }
      },
      estimatedCost: Number,
      order: {
        type: Number,
        required: true
      }
    }],
    totalEstimatedDuration: {
      value: Number,
      unit: String
    },
    risks: [{
      description: {
        type: String,
        required: true,
        trim: true
      },
      impact: {
        type: String,
        enum: ['basso', 'medio', 'alto'],
        required: true
      },
      probability: {
        type: String,
        enum: ['bassa', 'media', 'alta'],
        required: true
      },
      mitigation: {
        type: String,
        trim: true
      }
    }]
  },
  submittedAt: {
    type: Date,
    default: null
  },
  deadlineAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index per ricerche geografiche
proposalSchema.index({ 'location.coordinates': '2dsphere' });

// Index per ricerche per categoria e status
proposalSchema.index({ category: 1, status: 1 });

// Index per ricerche per città
proposalSchema.index({ 'location.city': 1 });

// Metodi virtuali
proposalSchema.virtual('supportVotes').get(function() {
  return this.votes.support.length;
});

proposalSchema.virtual('againstVotes').get(function() {
  return this.votes.against.length;
});

proposalSchema.virtual('totalVotes').get(function() {
  return this.votes.support.length + this.votes.against.length;
});

proposalSchema.virtual('supportPercentage').get(function() {
  const total = this.totalVotes;
  return total > 0 ? Math.round((this.supportVotes / total) * 100) : 0;
});

// Metodo per sottomettere la proposta
proposalSchema.methods.submit = function() {
  if (this.status !== 'bozza') {
    throw new Error('Solo le proposte in bozza possono essere sottomesse');
  }
  
  this.status = 'sottoposta';
  this.submittedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Proposal', proposalSchema);