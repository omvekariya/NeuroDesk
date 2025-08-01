const { Technician, User, Ticket } = require('../models');

// Get all technicians without pagination (simple list)
const getAllTechniciansSimple = async (req, res) => {
  try {
    const { 
      is_active, 
      availability_status, 
      skill_level,
      skills,
      sort_by = 'name', 
      sort_order = 'ASC' 
    } = req.query;
    
    // Build where clause
    const whereClause = {};
    const { Op } = require('sequelize');
    
    // Active status filter (default to active only)
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    } else {
      whereClause.is_active = true; // Default to active technicians only
    }

    // Availability status filter
    if (availability_status) {
      if (Array.isArray(availability_status)) {
        whereClause.availability_status = { [Op.in]: availability_status };
      } else {
        whereClause.availability_status = availability_status;
      }
    }

    // Skill level filter
    if (skill_level) {
      if (Array.isArray(skill_level)) {
        whereClause.skill_level = { [Op.in]: skill_level };
      } else {
        whereClause.skill_level = skill_level;
      }
    }

    // Skills filter - check if technician has any of the provided skills
    if (skills) {
      const skillIds = Array.isArray(skills) ? skills : [skills];
      const skillConditions = skillIds.map(skillId => 
        `JSON_SEARCH(skills, 'one', '${skillId}', null, '$[*].id') IS NOT NULL`
      );
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        { [Op.or]: skillConditions.map(condition => ({ [Op.and]: [condition] })) }
      ];
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'name', 'workload', 'availability_status', 'skill_level', 'specialization', 'is_active', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'ASC';

    const technicians = await Technician.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        }
      ],
      order: [[sortField, sortDirection]],
      attributes: { exclude: [] }
    });

    res.status(200).json({
      success: true,
      data: {
        technicians: technicians,
        total: technicians.length,
        filters: {
          is_active: is_active !== undefined ? is_active : 'true',
          availability_status,
          skill_level,
          skills,
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });
  } catch (error) {
    console.error('Get all technicians simple error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message
    });
  }
};

// Get all technicians with comprehensive filtering and pagination
const getAllTechnicians = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      name,
      user_id,
      availability_status,
      skill_level,
      specialization,
      workload_min,
      workload_max,
      is_active,
      skills,
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

    // User ID filter
    if (user_id) {
      whereClause.user_id = user_id;
    }

    // Availability status filter
    if (availability_status) {
      if (Array.isArray(availability_status)) {
        whereClause.availability_status = { [Op.in]: availability_status };
      } else {
        whereClause.availability_status = availability_status;
      }
    }

    // Skill level filter
    if (skill_level) {
      if (Array.isArray(skill_level)) {
        whereClause.skill_level = { [Op.in]: skill_level };
      } else {
        whereClause.skill_level = skill_level;
      }
    }

    // Specialization filter (partial match)
    if (specialization) {
      whereClause.specialization = { [Op.like]: `%${specialization}%` };
    }

    // Workload range filter
    if (workload_min !== undefined || workload_max !== undefined) {
      whereClause.workload = {};
      if (workload_min !== undefined) whereClause.workload[Op.gte] = parseInt(workload_min);
      if (workload_max !== undefined) whereClause.workload[Op.lte] = parseInt(workload_max);
    }

    // Active status filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // Skills filter - check if technician has any of the provided skills
    if (skills) {
      const skillIds = Array.isArray(skills) ? skills : [skills];
      const skillConditions = skillIds.map(skillId => 
        `JSON_SEARCH(skills, 'one', '${skillId}', null, '$[*].id') IS NOT NULL`
      );
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        { [Op.or]: skillConditions.map(condition => ({ [Op.and]: [condition] })) }
      ];
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
        { specialization: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'name', 'workload', 'availability_status', 'skill_level', 'specialization', 'is_active', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const { count, rows } = await Technician.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        }
      ],
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
        technicians: rows,
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
          user_id,
          availability_status,
          skill_level,
          specialization,
          workload_min,
          workload_max,
          is_active,
          skills,
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
    console.error('Get all technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message
    });
  }
};

// Get technician by ID
const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        },
        {
          model: Ticket,
          as: 'tickets',
          attributes: ['id', 'subject', 'status', 'priority', 'created_at'],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    res.status(200).json({
      success: true,
      data: technician
    });
  } catch (error) {
    console.error('Get technician by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technician',
      error: error.message
    });
  }
};

// Create new technician
const createTechnician = async (req, res) => {
  try {
    const { 
      name, 
      user_id, 
      skills, 
      availability_status, 
      skill_level, 
      specialization,
      workload,
      is_active 
    } = req.body;

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if technician already exists for this user
    const existingTechnician = await Technician.findOne({ where: { user_id } });
    if (existingTechnician) {
      return res.status(400).json({
        success: false,
        message: 'Technician profile already exists for this user'
      });
    }

    // Validate skills format if provided
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        if (!skill.id || typeof skill.percentage !== 'number' || skill.percentage < 0 || skill.percentage > 100) {
          return res.status(400).json({
            success: false,
            message: 'Skills must be in format [{id: number, percentage: number}] with percentage 0-100'
          });
        }
      }
    }

    // Create technician
    const newTechnician = await Technician.create({
      name,
      user_id,
      skills: skills || [],
      assigned_tickets: [],
      assigned_tickets_total: 0,
      availability_status: availability_status || 'available',
      skill_level: skill_level || 'junior',
      specialization,
      workload: workload || 0,
      is_active: is_active !== undefined ? is_active : true
    });

    // Get created technician with user info
    const createdTechnician = await Technician.findByPk(newTechnician.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      data: createdTechnician
    });
  } catch (error) {
    console.error('Create technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating technician',
      error: error.message
    });
  }
};

// Update technician
const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      skills, 
      assigned_tickets,
      availability_status, 
      skill_level, 
      specialization,
      workload,
      is_active 
    } = req.body;

    const technician = await Technician.findByPk(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Validate skills format if provided
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        if (!skill.id || typeof skill.percentage !== 'number' || skill.percentage < 0 || skill.percentage > 100) {
          return res.status(400).json({
            success: false,
            message: 'Skills must be in format [{id: number, percentage: number}] with percentage 0-100'
          });
        }
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (skills !== undefined) updateData.skills = skills;
    if (assigned_tickets !== undefined) {
      updateData.assigned_tickets = assigned_tickets;
      updateData.assigned_tickets_total = Array.isArray(assigned_tickets) ? assigned_tickets.length : 0;
    }
    if (availability_status) updateData.availability_status = availability_status;
    if (skill_level) updateData.skill_level = skill_level;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (workload !== undefined) updateData.workload = workload;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update technician
    await technician.update(updateData);

    // Get updated technician with user info
    const updatedTechnician = await Technician.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Technician updated successfully',
      data: updatedTechnician
    });
  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating technician',
      error: error.message
    });
  }
};

// Delete technician (soft delete by setting is_active to false)
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findByPk(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Soft delete by setting is_active to false
    await technician.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Technician deactivated successfully'
    });
  } catch (error) {
    console.error('Delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting technician',
      error: error.message
    });
  }
};

// Permanently delete technician (hard delete)
const permanentDeleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findByPk(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    await technician.destroy();

    res.status(200).json({
      success: true,
      message: 'Technician permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting technician',
      error: error.message
    });
  }
};

// Reactivate technician
const reactivateTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findByPk(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    await technician.update({ is_active: true });

    const reactivatedTechnician = await Technician.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Technician reactivated successfully',
      data: reactivatedTechnician
    });
  } catch (error) {
    console.error('Reactivate technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating technician',
      error: error.message
    });
  }
};

// Get technicians by skills (union filter)
const getTechniciansBySkills = async (req, res) => {
  try {
    const { skills, page = 1, limit = 10 } = req.query;

    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Skills parameter is required'
      });
    }

    const skillIds = Array.isArray(skills) ? skills : [skills];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { Op } = require('sequelize');

    // Build skill filter conditions
    const skillConditions = skillIds.map(skillId => 
      `JSON_SEARCH(skills, 'one', '${skillId}', null, '$[*].id') IS NOT NULL`
    );

    const whereClause = {
      is_active: true,
      [Op.and]: [
        { [Op.or]: skillConditions.map(condition => ({ [Op.and]: [condition] })) }
      ]
    };

    const { count, rows } = await Technician.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'department']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['workload', 'ASC'], ['name', 'ASC']]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        technicians: rows,
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
          skills: skillIds
        }
      }
    });
  } catch (error) {
    console.error('Get technicians by skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians by skills',
      error: error.message
    });
  }
};

module.exports = {
  getAllTechnicians,
  getAllTechniciansSimple,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  permanentDeleteTechnician,
  reactivateTechnician,
  getTechniciansBySkills
};