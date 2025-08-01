const express = require('express');
const { body, query, validationResult } = require('express-validator');
const {
  getAllTickets,
  getAllTicketsSimple,
  getTicketById,
  getTicketsByUserId,
  getTicketsByTechnicianId,
  createTicket,
  updateTicket,
  deleteTicket,
  permanentDeleteTicket,
  reactivateTicket,
  getTicketsBySkills
} = require('../controllers/ticket.controller');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Create ticket validation rules
const createTicketValidation = [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Subject must be between 5 and 500 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be low, normal, high, or critical'),
  
  body('impact')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Impact must be low, medium, high, or critical'),
  
  body('urgency')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Urgency must be low, normal, high, or critical'),
  
  body('requester_id')
    .notEmpty()
    .withMessage('Requester ID is required')
    .isInt({ min: 1 })
    .withMessage('Requester ID must be a positive integer'),
  
  body('assigned_technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned technician ID must be a positive integer'),
  
  body('required_skills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array')
    .custom((skills) => {
      if (skills && Array.isArray(skills)) {
        for (const skillId of skills) {
          if (!Number.isInteger(skillId) || skillId < 1) {
            throw new Error('Required skills must be an array of positive integers');
          }
        }
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('resolution_due')
    .optional()
    .isISO8601()
    .withMessage('Resolution due must be a valid date'),
  
  body('score')
    .optional()
    .isFloat({ min: 0.0, max: 10.0 })
    .withMessage('Score must be a number between 0.0 and 10.0'),
  
  body('justification')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Justification must be less than 1000 characters')
];

// Update ticket validation rules
const updateTicketValidation = [
  body('subject')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Subject must be between 5 and 500 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('status')
    .optional()
    .isIn(['new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'])
    .withMessage('Status must be a valid ticket status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be low, normal, high, or critical'),
  
  body('impact')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Impact must be low, medium, high, or critical'),
  
  body('urgency')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Urgency must be low, normal, high, or critical'),
  
  body('assigned_technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned technician ID must be a positive integer'),
  
  body('required_skills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array')
    .custom((skills) => {
      if (skills && Array.isArray(skills)) {
        for (const skillId of skills) {
          if (!Number.isInteger(skillId) || skillId < 1) {
            throw new Error('Required skills must be an array of positive integers');
          }
        }
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('resolution_due')
    .optional()
    .isISO8601()
    .withMessage('Resolution due must be a valid date'),
  
  body('tasks')
    .optional()
    .isArray()
    .withMessage('Tasks must be an array'),
  
  body('work_logs')
    .optional()
    .isArray()
    .withMessage('Work logs must be an array'),
  
  body('satisfaction_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating must be between 1 and 5'),
  
  body('score')
    .optional()
    .isFloat({ min: 0.0, max: 10.0 })
    .withMessage('Score must be a number between 0.0 and 10.0'),
  
  body('justification')
    .optional()
    .isLength({ max: 100000 })
    .withMessage('Justification must be less than 1000 characters'),
  
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback must be less than 1000 characters'),
  
  body('sla_violated')
    .optional()
    .isBoolean()
    .withMessage('SLA violated must be a boolean value')
];

// Query validation for getAllTickets
const getAllTicketsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('subject')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Subject must be between 1 and 500 characters'),
  
  query('description')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Description must be at least 1 character'),
  
  query('status')
    .optional()
    .isIn(['new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'])
    .withMessage('Status must be a valid ticket status'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be valid'),
  
  query('urgency')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Urgency must be valid'),
  
  query('impact')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Impact must be valid'),
  
  query('sla_violated')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('SLA violated must be true or false'),
  
  query('assigned_technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned technician ID must be a positive integer'),
  
  query('requester_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Requester ID must be a positive integer'),
  
  query('required_skills')
    .optional()
    .custom((value) => {
      if (value) {
        const skills = Array.isArray(value) ? value : [value];
        for (const skill of skills) {
          if (!Number.isInteger(parseInt(skill)) || parseInt(skill) < 1) {
            throw new Error('Required skills must be positive integers');
          }
        }
      }
      return true;
    }),
  
  query('escalation_count_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Escalation count min must be a non-negative integer'),
  
  query('escalation_count_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Escalation count max must be a non-negative integer'),
  
  query('satisfaction_rating_min')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating min must be between 1 and 5'),
  
  query('satisfaction_rating_max')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating max must be between 1 and 5'),
  
  query('score_min')
    .optional()
    .isFloat({ min: 0.0, max: 10.0 })
    .withMessage('Score min must be between 0.0 and 10.0'),
  
  query('score_max')
    .optional()
    .isFloat({ min: 0.0, max: 10.0 })
    .withMessage('Score max must be between 0.0 and 10.0'),
  
  query('created_from')
    .optional()
    .isISO8601()
    .withMessage('Created from must be a valid date'),
  
  query('created_to')
    .optional()
    .isISO8601()
    .withMessage('Created to must be a valid date'),
  
  query('updated_from')
    .optional()
    .isISO8601()
    .withMessage('Updated from must be a valid date'),
  
  query('updated_to')
    .optional()
    .isISO8601()
    .withMessage('Updated to must be a valid date'),
  
  query('resolution_due_from')
    .optional()
    .isISO8601()
    .withMessage('Resolution due from must be a valid date'),
  
  query('resolution_due_to')
    .optional()
    .isISO8601()
    .withMessage('Resolution due to must be a valid date'),
  
  query('sort_by')
    .optional()
    .isIn(['id', 'subject', 'status', 'priority', 'urgency', 'impact', 'sla_violated', 'escalation_count', 'satisfaction_rating', 'score', 'justification', 'created_at', 'updated_at', 'resolution_due'])
    .withMessage('Sort by must be a valid field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Search must be between 1 and 500 characters')
];

// Simple validation for getAllTicketsSimple
const getAllTicketsSimpleValidation = [
  query('status')
    .optional()
    .isIn(['new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'])
    .withMessage('Status must be a valid ticket status'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be valid'),
  
  query('urgency')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Urgency must be valid'),
  
  query('impact')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Impact must be valid'),
  
  query('sla_violated')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('SLA violated must be true or false'),
  
  query('assigned_technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned technician ID must be a positive integer'),
  
  query('requester_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Requester ID must be a positive integer'),
  
  query('required_skills')
    .optional()
    .custom((value) => {
      if (value) {
        const skills = Array.isArray(value) ? value : [value];
        for (const skill of skills) {
          if (!Number.isInteger(parseInt(skill)) || parseInt(skill) < 1) {
            throw new Error('Required skills must be positive integers');
          }
        }
      }
      return true;
    }),
  
  query('sort_by')
    .optional()
    .isIn(['id', 'subject', 'status', 'priority', 'urgency', 'impact', 'sla_violated', 'escalation_count', 'satisfaction_rating', 'score', 'justification', 'created_at', 'updated_at', 'resolution_due'])
    .withMessage('Sort by must be a valid field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC')
];

// Validation for getTicketsByUserId and getTicketsByTechnicianId
const getTicketsByUserValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'])
    .withMessage('Status must be a valid ticket status'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be valid')
];

// Validation for getTicketsBySkills
const getTicketsBySkillsValidation = [
  query('skills')
    .notEmpty()
    .withMessage('Skills parameter is required')
    .custom((value) => {
      const skills = Array.isArray(value) ? value : [value];
      for (const skill of skills) {
        if (!Number.isInteger(parseInt(skill)) || parseInt(skill) < 1) {
          throw new Error('Skills must be positive integers');
        }
      }
      return true;
    }),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'])
    .withMessage('Status must be a valid ticket status')
];

// Routes
/**
 * @route   GET /api/v1/tickets/all
 * @desc    Get all tickets without pagination (simple list)
 * @access  Public (should be protected in real app)
 * @query   status, priority, urgency, impact, sla_violated, assigned_technician_id, 
 *          requester_id, required_skills, sort_by, sort_order
 */
router.get('/all', getAllTicketsSimpleValidation, handleValidationErrors, getAllTicketsSimple);

/**
 * @route   GET /api/v1/tickets/by-skills
 * @desc    Get tickets by required skills (union filter)
 * @access  Public (should be protected in real app)
 * @query   skills (required), page, limit, status
 */
router.get('/by-skills', getTicketsBySkillsValidation, handleValidationErrors, getTicketsBySkills);

/**
 * @route   GET /api/v1/tickets/user/:userId
 * @desc    Get tickets by user ID (requester)
 * @access  Public (should be protected in real app)
 * @query   page, limit, status, priority
 */
router.get('/user/:userId', getTicketsByUserValidation, handleValidationErrors, getTicketsByUserId);

/**
 * @route   GET /api/v1/tickets/technician/:technicianId
 * @desc    Get tickets by technician ID (assigned)
 * @access  Public (should be protected in real app)
 * @query   page, limit, status, priority
 */
router.get('/technician/:technicianId', getTicketsByUserValidation, handleValidationErrors, getTicketsByTechnicianId);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets with comprehensive filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 * @query   page, limit, subject, description, status, priority, urgency, impact, sla_violated,
 *          assigned_technician_id, requester_id, required_skills, escalation_count_min,
 *          escalation_count_max, satisfaction_rating_min, satisfaction_rating_max,
 *          created_from, created_to, updated_from, updated_to, resolution_due_from,
 *          resolution_due_to, sort_by, sort_order, search
 */
router.get('/', getAllTicketsValidation, handleValidationErrors, getAllTickets);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get ticket by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getTicketById);

/**
 * @route   POST /api/v1/tickets
 * @desc    Create new ticket
 * @access  Public (should be protected)
 */
router.post('/', createTicketValidation, handleValidationErrors, createTicket);

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update ticket
 * @access  Public (should be protected)
 */
router.put('/:id', updateTicketValidation, handleValidationErrors, updateTicket);

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Soft delete ticket (cancel)
 * @access  Public (should be protected)
 */
router.delete('/:id', deleteTicket);

/**
 * @route   DELETE /api/v1/tickets/:id/permanent
 * @desc    Permanently delete ticket
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteTicket);

/**
 * @route   PATCH /api/v1/tickets/:id/reactivate
 * @desc    Reactivate ticket
 * @access  Public (should be protected)
 */
router.patch('/:id/reactivate', reactivateTicket);

module.exports = router;