const { body } = require('express-validator');

// Validatori per coordinate geografiche
const coordinatesValidator = [
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitudine deve essere tra -90 e 90'),
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitudine deve essere tra -180 e 180')
];

// Validatore per password sicura
const strongPasswordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('La password deve avere almeno 8 caratteri')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('La password deve contenere almeno una lettera minuscola, una maiuscola e un numero');

// Validatore per email aziendale
const businessEmailValidator = body('email')
  .isEmail()
  .normalizeEmail()
  .custom((value) => {
    const businessDomains = ['comune.', 'gov.', 'municipio.'];
    const isBusinessEmail = businessDomains.some(domain => value.includes(domain));
    
    if (!isBusinessEmail) {
      throw new Error('Richiesta email istituzionale per questo ruolo');
    }
    return true;
  });

// Validatore per date
const dateRangeValidator = [
  body('startDate')
    .isISO8601()
    .withMessage('Data di inizio non valida')
    .custom((value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error('La data di inizio non può essere nel passato');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('Data di fine non valida')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La data di fine deve essere successiva alla data di inizio');
      }
      return true;
    })
];

// Validatore per upload file
const fileUploadValidator = [
  body('attachments.*.name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome file deve essere tra 1 e 255 caratteri'),
  body('attachments.*.type')
    .isIn(['document', 'image', 'video', 'other'])
    .withMessage('Tipo file non supportato')
];

// Validatore per budget
const budgetValidator = [
  body('totalAmount')
    .isFloat({ min: 0, max: 999999999 })
    .withMessage('Budget deve essere tra 0 e 999.999.999'),
  body('allocatedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Importo allocato deve essere positivo')
    .custom((value, { req }) => {
      if (value > req.body.totalAmount) {
        throw new Error('L\'importo allocato non può superare il budget totale');
      }
      return true;
    })
];

// Validatore per priorità dinamica
const priorityValidator = body('priority')
  .optional()
  .isIn(['bassa', 'media', 'alta', 'urgente'])
  .withMessage('Priorità non valida');

// Validatore per categoria dinamica
const categoryValidator = (categories) => {
  return body('category')
    .isIn(categories)
    .withMessage(`Categoria deve essere una di: ${categories.join(', ')}`);
};

// Sanitizzazione HTML
const htmlSanitizer = [
  body('description')
    .trim()
    .escape()
    .withMessage('Descrizione contiene caratteri non validi'),
  body('title')
    .trim()
    .escape()
    .withMessage('Titolo contiene caratteri non validi')
];

module.exports = {
  coordinatesValidator,
  strongPasswordValidator,
  businessEmailValidator,
  dateRangeValidator,
  fileUploadValidator,
  budgetValidator,
  priorityValidator,
  categoryValidator,
  htmlSanitizer
};