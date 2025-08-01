const express = require('express');
const { body, query, validationResult } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  reactivateUser
} = require('../controllers/user.controller');

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

// Create user validation rules
const createUserValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('contact_no')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Contact number must be between 10 and 20 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'technician', 'user'])
    .withMessage('Role must be admin, technician, or user'),
  
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters')
];

// Update user validation rules
const updateUserValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('contact_no')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Contact number must be between 10 and 20 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'technician', 'user'])
    .withMessage('Role must be admin, technician, or user'),
  
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Query validation for getAllUsers
const getAllUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('role')
    .optional()
    .isIn(['admin', 'technician', 'user'])
    .withMessage('Role must be admin, technician, or user'),
  
  query('status')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Status must be true or false'),
  
  query('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  
  query('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  
  query('contact_no')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Contact number must be between 1 and 20 characters'),
  
  query('department')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department must be between 1 and 100 characters'),
  
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
    .isIn(['id', 'name', 'email', 'role', 'department', 'status', 'created_at', 'updated_at'])
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

// Routes
/**
 * @route   GET /api/v1/users
 * @desc    Get all users with comprehensive filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 * @query   page, limit, role, status, name, email, contact_no, department, 
 *          created_from, created_to, updated_from, updated_to, sort_by, sort_order, search
 */
router.get('/', getAllUsersValidation, handleValidationErrors, getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getUserById);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Public (should be protected - admin only)
 */
router.post('/', createUserValidation, handleValidationErrors, createUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Public (should be protected)
 */
router.put('/:id', updateUserValidation, handleValidationErrors, updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Soft delete user (deactivate)
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id', deleteUser);

/**
 * @route   DELETE /api/v1/users/:id/permanent
 * @desc    Permanently delete user
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteUser);

/**
 * @route   PATCH /api/v1/users/:id/reactivate
 * @desc    Reactivate user
 * @access  Public (should be protected - admin only)
 */
router.patch('/:id/reactivate', reactivateUser);

module.exports = router;