/**
 * Utility per risposte API standardizzate
 */

class ApiResponse {
  /**
   * Risposta di successo
   * @param {Object} res - Express response object
   * @param {*} data - Dati da restituire
   * @param {string} message - Messaggio di successo
   * @param {number} statusCode - Codice di stato HTTP
   */
  static success(res, data = null, message = 'Operazione completata con successo', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Risposta di errore
   * @param {Object} res - Express response object
   * @param {string} message - Messaggio di errore
   * @param {number} statusCode - Codice di stato HTTP
   * @param {*} errors - Dettagli dell'errore
   */
  static error(res, message = 'Si è verificato un errore', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Risposta di validazione fallita
   * @param {Object} res - Express response object
   * @param {Array} validationErrors - Array di errori di validazione
   */
  static validationError(res, validationErrors) {
    return res.status(400).json({
      success: false,
      message: 'Errori di validazione',
      errors: validationErrors.map(err => ({
        field: err.param || err.path,
        message: err.msg || err.message,
        value: err.value
      })),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Risposta non autorizzato
   * @param {Object} res - Express response object
   * @param {string} message - Messaggio personalizzato
   */
  static unauthorized(res, message = 'Accesso non autorizzato') {
    return this.error(res, message, 401);
  }

  /**
   * Risposta vietato
   * @param {Object} res - Express response object
   * @param {string} message - Messaggio personalizzato
   */
  static forbidden(res, message = 'Operazione non permessa') {
    return this.error(res, message, 403);
  }

  /**
   * Risposta risorsa non trovata
   * @param {Object} res - Express response object
   * @param {string} resource - Nome della risorsa
   */
  static notFound(res, resource = 'Risorsa') {
    return this.error(res, `${resource} non trovata`, 404);
  }

  /**
   * Risposta conflitto
   * @param {Object} res - Express response object
   * @param {string} message - Messaggio personalizzato
   */
  static conflict(res, message = 'Risorsa già esistente') {
    return this.error(res, message, 409);
  }

  /**
   * Risposta con paginazione
   * @param {Object} res - Express response object
   * @param {Array} data - Array di dati
   * @param {Object} pagination - Informazioni di paginazione
   * @param {string} message - Messaggio di successo
   */
  static paginated(res, data, pagination, message = 'Dati recuperati con successo') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        current: pagination.current,
        pages: pagination.pages,
        total: pagination.total,
        limit: pagination.limit,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Risposta per operazioni asincrone
   * @param {Object} res - Express response object
   * @param {string} taskId - ID del task asincrono
   * @param {string} message - Messaggio informativo
   */
  static async(res, taskId, message = 'Operazione avviata') {
    return res.status(202).json({
      success: true,
      message,
      taskId,
      status: 'processing',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Risposta per rate limiting
   * @param {Object} res - Express response object
   * @param {number} retryAfter - Secondi prima di poter riprovare
   */
  static rateLimit(res, retryAfter = 60) {
    return res.status(429).json({
      success: false,
      message: 'Troppe richieste, riprova più tardi',
      retryAfter,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Middleware per gestire errori di MongoDB
 */
const handleMongoError = (error, res) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return ApiResponse.validationError(res, errors);
  }

  if (error.name === 'CastError') {
    return ApiResponse.error(res, 'ID non valido', 400);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return ApiResponse.conflict(res, `${field} già esistente`);
  }

  return ApiResponse.error(res, 'Errore del database', 500);
};

/**
 * Middleware per gestire errori JWT
 */
const handleJWTError = (error, res) => {
  if (error.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Token non valido');
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token scaduto');
  }

  return ApiResponse.unauthorized(res, 'Errore di autenticazione');
};

module.exports = {
  ApiResponse,
  handleMongoError,
  handleJWTError
};