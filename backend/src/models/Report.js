const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'La categoria è obbligatoria'],
    enum: [
      'strade',
      'illuminazione',
      'rifiuti',
      'trasporti',
      'verde-pubblico',
      'sicurezza',
      'altro'
    ]
  },
  priority: {
    type: String,
    enum: ['bassa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  status: {
    type: String,
    enum: ['aperto', 'in-lavorazione', 'risolto', 'chiuso'],
    default: 'aperto'
  },
  location: {
    address: {
      type: String,
      required: [true, 'L\'indirizzo è obbligatorio'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: [-90, 'Latitudine non valida'],
        max: [90, 'Latitudine non valida']
      },
      lng: {
        type: Number,
        required: true,
        min: [-180, 'Longitudine non valida'],
        max: [180, 'Longitudine non valida']
      }
    },
    city: {
      type: String,
      required: true,
      trim: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Il segnalatore è obbligatorio']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
      maxlength: [500, 'Il commento non può superare i 500 caratteri']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: {
    type: Date,
    default: null
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Le note di risoluzione non possono superare i 1000 caratteri']
  }
}, {
  timestamps: true
});

// Index per ricerche geografiche
reportSchema.index({ 'location.coordinates': '2dsphere' });

// Index per ricerche per categoria e status
reportSchema.index({ category: 1, status: 1 });

// Index per ricerche per città
reportSchema.index({ 'location.city': 1 });

// Metodo virtuale per conteggio voti
reportSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

module.exports = mongoose.model('Report', reportSchema);