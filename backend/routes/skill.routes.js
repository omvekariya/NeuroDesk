const express = require('express');
const { body, query, validationResult } = require('express-validator');
const {
  getAllSkills,
  getAllSkillsSimple,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  permanentDeleteSkill,
  reactivateSkill
} = require('../controllers/skill.controller');

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

// Create skill validation rules
const createSkillValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Update skill validation rules
const updateSkillValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Query validation for getAllSkills
const getAllSkillsValidation = [
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
  
  query('description')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active must be true or false'),
  
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
    .isIn(['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'])
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

// Simple validation for getAllSkillsSimple
const getAllSkillsSimpleValidation = [
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active must be true or false'),
  
  query('sort_by')
    .optional()
    .isIn(['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'])
    .withMessage('Sort by must be a valid field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC')
];

// Routes
/**
 * @route   GET /api/v1/skills/all
 * @desc    Get all skills without pagination (simple list)
 * @access  Public (should be protected in real app)
 * @query   is_active, sort_by, sort_order
 */
router.get('/all', getAllSkillsSimpleValidation, handleValidationErrors, getAllSkillsSimple);

/**
 * @route   GET /api/v1/skills
 * @desc    Get all skills with comprehensive filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 * @query   page, limit, name, description, is_active, 
 *          created_from, created_to, updated_from, updated_to, sort_by, sort_order, search
 */
router.get('/', getAllSkillsValidation, handleValidationErrors, getAllSkills);

/**
 * @route   GET /api/v1/skills/:id
 * @desc    Get skill by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getSkillById);

/**
 * @route   POST /api/v1/skills
 * @desc    Create new skill
 * @access  Public (should be protected - admin only)
 */
router.post('/', createSkillValidation, handleValidationErrors, createSkill);

/**
 * @route   PUT /api/v1/skills/:id
 * @desc    Update skill
 * @access  Public (should be protected)
 */
router.put('/:id', updateSkillValidation, handleValidationErrors, updateSkill);

/**
 * @route   DELETE /api/v1/skills/:id
 * @desc    Soft delete skill (deactivate)
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id', deleteSkill);

/**
 * @route   DELETE /api/v1/skills/:id/permanent
 * @desc    Permanently delete skill
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteSkill);

/**
 * @route   PATCH /api/v1/skills/:id/reactivate
 * @desc    Reactivate skill
 * @access  Public (should be protected - admin only)
 */
router.patch('/:id/reactivate', reactivateSkill);

module.exports = router;