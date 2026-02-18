const mongoose = require('mongoose');
const Budget = require('../src/models/Budget');
const User = require('../src/models/User');
require('dotenv').config();

// Dati di esempio per la generazione
const categories = [
  'infrastrutture', 'trasporti', 'ambiente', 'sociale', 
  'cultura', 'sicurezza', 'istruzione', 'sanita', 'altro'
];

const departments = [
  'Lavori Pubblici', 'Trasporti e Mobilità', 'Ambiente e Verde',
  'Servizi Sociali', 'Cultura e Turismo', 'Polizia Locale',
  'Istruzione', 'Sanità Pubblica', 'Amministrazione Generale'
];

const projectTitles = {
  infrastrutture: [
    'Manutenzione stradale', 'Ammodernamento ponti', 'Rifacimento marciapiedi',
    'Installazione illuminazione stradale', 'Riqualificazione piazze'
  ],
  trasporti: [
    'Potenziamento trasporto pubblico', 'Piste ciclabili', 'Parcheggi pubblici',
    'Zona a traffico limitato', 'Stazione autobus'
  ],
  ambiente: [
    'Gestione rifiuti urbani', 'Parco cittadino', 'Efficientamento energetico',
    'Raccolta differenziata', 'Verde urbano'
  ],
  sociale: [
    'Centro anziani', 'Assistenza domiciliare', 'Servizi per famiglie',
    'Housing sociale', 'Mensa scolastica'
  ],
  cultura: [
    'Biblioteca comunale', 'Eventi culturali', 'Museo cittadino',
    'Teatro comunale', 'Festival estivo'
  ],
  sicurezza: [
    'Videosorveglianza', 'Vigili urbani', 'Protezione civile',
    'Sicurezza stradale', 'Prevenzione criminalità'
  ],
  istruzione: [
    'Scuole primarie', 'Scuole secondarie', 'Asili nido',
    'Formazione professionale', 'Attrezzature scolastiche'
  ],
  sanita: [
    'Centro sanitario', 'Prevenzione sanitaria', 'Pronto soccorso',
    'Ambulatori specialistici', 'Medicina territoriale'
  ],
  altro: [
    'Progetti speciali', 'Emergenze', 'Innovazione digitale',
    'Partecipazione cittadina', 'Progetti europei'
  ]
};

// Funzione per generare importi realistici per categoria
function generateAmount(category) {
  const baseAmounts = {
    infrastrutture: [50000, 500000],
    trasporti: [30000, 300000],
    ambiente: [20000, 150000],
    sociale: [15000, 100000],
    cultura: [10000, 80000],
    sicurezza: [25000, 200000],
    istruzione: [40000, 400000],
    sanita: [35000, 250000],
    altro: [5000, 100000]
  };

  const [min, max] = baseAmounts[category];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Funzione per generare data casuale nell'anno
function generateDateInYear(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Funzione per generare budget storico
async function generateHistoricalBudgets(year, count = 50) {
  const budgets = [];
  
  // Ottieni un utente manager casuale (o crea uno fittizio)
  let defaultManager;
  try {
    defaultManager = await User.findOne({ role: 'operator' });
    if (!defaultManager) {
      // Crea un utente manager fittizio se non esiste
      defaultManager = new User({
        name: 'Manager Sistema',
        email: 'manager@sistema.com',
        password: 'hashedpassword',
        role: 'operator'
      });
      await defaultManager.save();
    }
  } catch (error) {
    console.log('Creando manager fittizio...');
    defaultManager = new mongoose.Types.ObjectId();
  }
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const titles = projectTitles[category];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    
    const totalAmount = generateAmount(category);
    const allocatedAmount = Math.floor(totalAmount * (Math.random() * 0.8)); // 0-80% allocato
    
    const startDate = generateDateInYear(year);
    const endDate = new Date(startDate.getTime() + (Math.random() * 365 * 24 * 60 * 60 * 1000));
    
    const statuses = ['proposto', 'approvato', 'in-corso', 'completato'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const budget = {
      title: `${title} ${year}`,
      description: `Progetto ${title.toLowerCase()} per l'anno ${year}. Budget allocato per il miglioramento dei servizi cittadini.`,
      totalAmount,
      allocatedAmount,
      remainingAmount: totalAmount - allocatedAmount,
      category,
      year,
      status,
      department,
      manager: defaultManager._id,
      startDate,
      endDate,
      allocations: []
    };
    
    // Aggiunge alcune allocazioni casuali se il budget è allocato
    if (allocatedAmount > 0) {
      const numberOfAllocations = Math.floor(Math.random() * 3) + 1;
      let remainingToAllocate = allocatedAmount;
      
      for (let j = 0; j < numberOfAllocations && remainingToAllocate > 0; j++) {
        const allocationAmount = Math.min(
          Math.floor(remainingToAllocate * (0.3 + Math.random() * 0.7)),
          remainingToAllocate
        );
        
        budget.allocations.push({
          project: `Fase ${j + 1} - ${title}`,
          amount: allocationAmount,
          description: `Allocazione per fase ${j + 1} del progetto`,
          allocatedAt: new Date(startDate.getTime() + j * 30 * 24 * 60 * 60 * 1000),
          allocatedBy: defaultManager._id
        });
        
        remainingToAllocate -= allocationAmount;
      }
    }
    
    // Approva alcuni budget
    if (status !== 'proposto' && Math.random() > 0.3) {
      budget.approvedBy = defaultManager._id;
      budget.approvedAt = new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    }
    
    budgets.push(budget);
  }
  
  return budgets;
}

async function seedHistoricalData() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanmind');
    console.log('Connesso al database MongoDB');
    
    const currentYear = new Date().getFullYear();
    const yearsToSeed = [currentYear - 3, currentYear - 2, currentYear - 1]; // Ultimi 3 anni
    
    for (const year of yearsToSeed) {
      console.log(`\nGenerando dati per l'anno ${year}...`);
      
      // Controlla se ci sono già dati per questo anno
      const existingCount = await Budget.countDocuments({ year });
      if (existingCount > 0) {
        console.log(`Trovati ${existingCount} budget esistenti per il ${year}. Saltando...`);
        continue;
      }
      
      const budgets = await generateHistoricalBudgets(year, 30 + Math.floor(Math.random() * 20)); // 30-50 budget per anno
      
      try {
        await Budget.insertMany(budgets);
        console.log(`✅ Inseriti ${budgets.length} budget per l'anno ${year}`);
        
        // Statistiche per anno
        const stats = await Budget.aggregate([
          { $match: { year } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalBudget: { $sum: '$totalAmount' }
            }
          },
          { $sort: { totalBudget: -1 } }
        ]);
        
        console.log(`📊 Statistiche ${year}:`);
        stats.forEach(stat => {
          console.log(`  ${stat._id}: ${stat.count} progetti, €${(stat.totalBudget / 1000).toFixed(0)}K`);
        });
        
      } catch (insertError) {
        console.error(`Errore durante l'inserimento per ${year}:`, insertError.message);
      }
    }
    
    const totalBudgets = await Budget.countDocuments();
    console.log(`\n🎉 Seed completato! Totale budget in database: ${totalBudgets}`);
    
  } catch (error) {
    console.error('Errore durante il seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnesso dal database');
  }
}

// Esegue lo script se chiamato direttamente
if (require.main === module) {
  seedHistoricalData().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });
}

module.exports = seedHistoricalData;