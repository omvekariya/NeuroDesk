const express = require('express');
const { body, query, validationResult } = require('express-validator');
const {
  getAllTechnicians,
  getAllTechniciansSimple,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  permanentDeleteTechnician,
  reactivateTechnician,
  getTechniciansBySkills,
  debugTechniciansSkills,
  getAverageTechnicianPerformance
} = require('../controllers/technician.controller');

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

// Create technician validation rules
const createTechnicianValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((skills) => {
      if (skills && Array.isArray(skills)) {
        for (const skill of skills) {
          if (!skill.id || typeof skill.percentage !== 'number' || skill.percentage < 0 || skill.percentage > 100) {
            throw new Error('Each skill must have id and percentage (0-100)');
          }
        }
      }
      return true;
    }),
  
  body('availability_status')
    .optional()
    .isIn(['available', 'busy', 'in_meeting', 'on_break', 'end_of_shift', 'focus_mode'])
    .withMessage('Availability status must be valid'),
  
  body('skill_level')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'expert'])
    .withMessage('Skill level must be junior, mid, senior, or expert'),
  
  body('specialization')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Specialization must be less than 255 characters'),
  
  body('workload')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Workload must be between 0 and 100'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Update technician validation rules
const updateTechnicianValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((skills) => {
      if (skills && Array.isArray(skills)) {
        for (const skill of skills) {
          if (!skill.id || typeof skill.percentage !== 'number' || skill.percentage < 0 || skill.percentage > 100) {
            throw new Error('Each skill must have id and percentage (0-100)');
          }
        }
      }
      return true;
    }),
  
  body('assigned_tickets')
    .optional()
    .isArray()
    .withMessage('Assigned tickets must be an array'),
  
  body('availability_status')
    .optional()
    .isIn(['available', 'busy', 'in_meeting', 'on_break', 'end_of_shift', 'focus_mode'])
    .withMessage('Availability status must be valid'),
  
  body('skill_level')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'expert'])
    .withMessage('Skill level must be junior, mid, senior, or expert'),
  
  body('specialization')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Specialization must be less than 255 characters'),
  
  body('workload')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Workload must be between 0 and 100'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Query validation for getAllTechnicians
const getAllTechniciansValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  
  query('user_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  query('availability_status')
    .optional()
    .isIn(['available', 'busy', 'in_meeting', 'on_break', 'end_of_shift', 'focus_mode'])
    .withMessage('Availability status must be valid'),
  
  query('skill_level')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'expert'])
    .withMessage('Skill level must be valid'),
  
  query('specialization')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Specialization must be between 1 and 255 characters'),
  
  query('workload_min')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Workload min must be between 0 and 100'),
  
  query('workload_max')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Workload max must be between 0 and 100'),
  
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active must be true or false'),
  
  query('skills')
    .optional()
    .custom((value) => {
      if (value) {
        const skills = Array.isArray(value) ? value : [value];
        for (const skill of skills) {
          if (!Number.isInteger(parseInt(skill)) || parseInt(skill) < 1) {
            throw new Error('Skills must be positive integers');
          }
        }
      }
      return true;
    }),
  
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
  
  query('sort_by')
    .optional()
    .isIn(['id', 'name', 'workload', 'availability_status', 'skill_level', 'specialization', 'is_active', 'created_at', 'updated_at'])
    .withMessage('Sort by must be a valid field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search must be between 1 and 255 characters')
];

// Simple validation for getAllTechniciansSimple
const getAllTechniciansSimpleValidation = [
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active must be true or false'),
  
  query('availability_status')
    .optional()
    .isIn(['available', 'busy', 'in_meeting', 'on_break', 'end_of_shift', 'focus_mode'])
    .withMessage('Availability status must be valid'),
  
  query('skill_level')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'expert'])
    .withMessage('Skill level must be valid'),
  
  query('skills')
    .optional()
    .custom((value) => {
      if (value) {
        const skills = Array.isArray(value) ? value : [value];
        for (const skill of skills) {
          if (!Number.isInteger(parseInt(skill)) || parseInt(skill) < 1) {
            throw new Error('Skills must be positive integers');
          }
        }
      }
      return true;
    }),
  
  query('sort_by')
    .optional()
    .isIn(['id', 'name', 'workload', 'availability_status', 'skill_level', 'specialization', 'is_active', 'created_at', 'updated_at'])
    .withMessage('Sort by must be a valid field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC')
];

// Validation for getTechniciansBySkills
const getTechniciansBySkillsValidation = [
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
  
  query('debug')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Debug must be true or false')
];



// Routes
/**
 * @route   GET /api/v1/technicians/debug-skills
 * @desc    Debug endpoint to see all technicians and their skills structure
 * @access  Public (should be protected in real app)
 */
router.get('/debug-skills', debugTechniciansSkills);

/**
 * @route   GET /api/v1/technicians/all
 * @desc    Get all technicians without pagination (simple list)
 * @access  Public (should be protected in real app)
 * @query   is_active, availability_status, skill_level, skills, sort_by, sort_order
 */
router.get('/all', getAllTechniciansSimpleValidation, handleValidationErrors, getAllTechniciansSimple);

/**
 * @route   GET /api/v1/technicians/by-skills
 * @desc    Get technicians by skills (union filter)
 * @access  Public (should be protected in real app)
 * @query   skills (required), page, limit, debug
 */
router.get('/by-skills', getTechniciansBySkillsValidation, handleValidationErrors, getTechniciansBySkills);

/**
 * @route   GET /api/v1/technicians
 * @desc    Get all technicians with comprehensive filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 * @query   page, limit, name, user_id, availability_status, skill_level, specialization,
 *          workload_min, workload_max, is_active, skills, created_from, created_to, 
 *          updated_from, updated_to, sort_by, sort_order, search
 */
router.get('/', getAllTechniciansValidation, handleValidationErrors, getAllTechnicians);

/**
 * @route   GET /api/v1/technicians/:id
 * @desc    Get technician by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getTechnicianById);

/**
 * @route   POST /api/v1/technicians
 * @desc    Create new technician
 * @access  Public (should be protected - admin only)
 */
router.post('/', createTechnicianValidation, handleValidationErrors, createTechnician);

/**
 * @route   PUT /api/v1/technicians/:id
 * @desc    Update technician
 * @access  Public (should be protected)
 */
router.put('/:id', updateTechnicianValidation, handleValidationErrors, updateTechnician);

/**
 * @route   DELETE /api/v1/technicians/:id
 * @desc    Soft delete technician (deactivate)
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id', deleteTechnician);

/**
 * @route   DELETE /api/v1/technicians/:id/permanent
 * @desc    Permanently delete technician
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteTechnician);

/**
 * @route   PATCH /api/v1/technicians/:id/reactivate
 * @desc    Reactivate technician
 * @access  Public (should be protected - admin only)
 */
router.patch('/:id/reactivate', reactivateTechnician);

/**
 * @route   GET /api/v1/technicians/avg_performance/all_technician
 * @desc    Get average performance of all technicians based on solved tickets
 * @access  Public (should be protected in real app)
 */
router.get('/avg_performance/all_technician', getAverageTechnicianPerformance);

module.exports = router;