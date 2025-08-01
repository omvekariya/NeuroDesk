const { Skill } = require('../models');

// Get all skills without pagination (simple list)
const getAllSkillsSimple = async (req, res) => {
  try {
    const { is_active, sort_by = 'name', sort_order = 'ASC' } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    // Active status filter (default to active only)
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    } else {
      whereClause.is_active = true; // Default to active skills only
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'ASC';

    const skills = await Skill.findAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      attributes: ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
    });

    res.status(200).json({
      success: true,
      data: {
        skills: skills,
        total: skills.length,
        filters: {
          is_active: is_active !== undefined ? is_active : 'true',
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });
  } catch (error) {
    console.error('Get all skills simple error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
};

// Get all skills with comprehensive filtering and pagination
const getAllSkills = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      name, 
      description,
      is_active,
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by = 'created_at',
      sort_order = 'DESC',
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { Op } = require('sequelize');

    // Build where clause with comprehensive filters
    const whereClause = {};

    // Name filter (partial match)
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    // Description filter (partial match)
    if (description) {
      whereClause.description = { [Op.like]: `%${description}%` };
    }

    // Active status filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // Date range filters
    if (created_from || created_to) {
      whereClause.created_at = {};
      if (created_from) whereClause.created_at[Op.gte] = new Date(created_from);
      if (created_to) whereClause.created_at[Op.lte] = new Date(created_to);
    }

    if (updated_from || updated_to) {
      whereClause.updated_at = {};
      if (updated_from) whereClause.updated_at[Op.gte] = new Date(updated_from);
      if (updated_to) whereClause.updated_at[Op.lte] = new Date(updated_to);
    }

    // Global search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const { count, rows } = await Skill.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortField, sortDirection]],
      distinct: true
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        skills: rows,
        pagination: {
          total: count,
          page: currentPage,
          limit: parseInt(limit),
          totalPages: totalPages,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
          nextPage: hasNextPage ? currentPage + 1 : null,
          prevPage: hasPrevPage ? currentPage - 1 : null
        },
        filters: {
          name,
          description,
          is_active,
          created_from,
          created_to,
          updated_from,
          updated_to,
          search,
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });
  } catch (error) {
    console.error('Get all skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
};

// Get skill by ID
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Get skill by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skill',
      error: error.message
    });
  }
};

// Create new skill
const createSkill = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ where: { name } });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill with this name already exists'
      });
    }

    // Create skill
    const newSkill = await Skill.create({
      name,
      description,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: newSkill
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating skill',
      error: error.message
    });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== skill.name) {
      const existingSkill = await Skill.findOne({ where: { name } });
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'Skill with this name already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update skill
    await skill.update(updateData);

    // Get updated skill
    const updatedSkill = await Skill.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: updatedSkill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating skill',
      error: error.message
    });
  }
};

// Delete skill (soft delete by setting is_active to false)
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Soft delete by setting is_active to false
    await skill.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Skill deactivated successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting skill',
      error: error.message
    });
  }
};

// Permanently delete skill (hard delete)
const permanentDeleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.destroy();

    res.status(200).json({
      success: true,
      message: 'Skill permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting skill',
      error: error.message
    });
  }
};

// Reactivate skill
const reactivateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.update({ is_active: true });

    const reactivatedSkill = await Skill.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Skill reactivated successfully',
      data: reactivatedSkill
    });
  } catch (error) {
    console.error('Reactivate skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating skill',
      error: error.message
    });
  }
};

module.exports = {
  getAllSkills,
  getAllSkillsSimple,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  permanentDeleteSkill,
  reactivateSkill
};