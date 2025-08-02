const { Ticket, User, Technician } = require('../models');
const axios = require('axios');

// Get all tickets without pagination (simple list)
const getAllTicketsSimple = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      urgency,
      impact,
      sla_violated,
      assigned_technician_id,
      requester_id,
      required_skills,
      sort_by = 'created_at', 
      sort_order = 'DESC' 
    } = req.query;
    
    // Build where clause
    const whereClause = {};
    const { Op } = require('sequelize');
    
    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    }

    // Priority filter
    if (priority) {
      if (Array.isArray(priority)) {
        whereClause.priority = { [Op.in]: priority };
      } else {
        whereClause.priority = priority;
      }
    }

    // Urgency filter
    if (urgency) {
      if (Array.isArray(urgency)) {
        whereClause.urgency = { [Op.in]: urgency };
      } else {
        whereClause.urgency = urgency;
      }
    }

    // Impact filter
    if (impact) {
      if (Array.isArray(impact)) {
        whereClause.impact = { [Op.in]: impact };
      } else {
        whereClause.impact = impact;
      }
    }

    // SLA violated filter
    if (sla_violated !== undefined) {
      whereClause.sla_violated = sla_violated === 'true';
    }

    // Assigned technician filter
    if (assigned_technician_id) {
      whereClause.assigned_technician_id = assigned_technician_id;
    }

    // Requester filter
    if (requester_id) {
      whereClause.requester_id = requester_id;
    }

    // Required skills filter - check if ticket requires any of the provided skills
    if (required_skills) {
      const skillIds = Array.isArray(required_skills) ? required_skills : [required_skills];
      const skillConditions = skillIds.map(skillId => 
        `JSON_SEARCH(required_skills, 'one', '${skillId}') IS NOT NULL`
      );
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        { [Op.or]: skillConditions.map(condition => ({ [Op.and]: [condition] })) }
      ];
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'subject', 'status', 'priority', 'urgency', 'impact', 'sla_violated', 'escalation_count', 'satisfaction_rating', 'score', 'justification', 'created_at', 'updated_at', 'resolution_due'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level', 'availability_status'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      attributes: { exclude: ['work_logs', 'audit_trail'] } // Exclude large JSON fields for simple list
    });

    res.status(200).json({
      success: true,
      data: {
        tickets: tickets,
        total: tickets.length,
        filters: {
          status,
          priority,
          urgency,
          impact,
          sla_violated,
          assigned_technician_id,
          requester_id,
          required_skills,
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });
  } catch (error) {
    console.error('Get all tickets simple error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// Get all tickets with comprehensive filtering and pagination
const getAllTickets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      subject,
      description,
      status,
      priority,
      urgency,
      impact,
      sla_violated,
      assigned_technician_id,
      requester_id,
      required_skills,
      escalation_count_min,
      escalation_count_max,
      satisfaction_rating_min,
      satisfaction_rating_max,
      score_min,
      score_max,
      created_from,
      created_to,
      updated_from,
      updated_to,
      resolution_due_from,
      resolution_due_to,
      sort_by = 'created_at',
      sort_order = 'DESC',
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { Op } = require('sequelize');

    // Build where clause with comprehensive filters
    const whereClause = {};

    // Subject filter (partial match)
    if (subject) {
      whereClause.subject = { [Op.like]: `%${subject}%` };
    }

    // Description filter (partial match)
    if (description) {
      whereClause.description = { [Op.like]: `%${description}%` };
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    }

    // Priority filter
    if (priority) {
      if (Array.isArray(priority)) {
        whereClause.priority = { [Op.in]: priority };
      } else {
        whereClause.priority = priority;
      }
    }

    // Urgency filter
    if (urgency) {
      if (Array.isArray(urgency)) {
        whereClause.urgency = { [Op.in]: urgency };
      } else {
        whereClause.urgency = urgency;
      }
    }

    // Impact filter
    if (impact) {
      if (Array.isArray(impact)) {
        whereClause.impact = { [Op.in]: impact };
      } else {
        whereClause.impact = impact;
      }
    }

    // SLA violated filter
    if (sla_violated !== undefined) {
      whereClause.sla_violated = sla_violated === 'true';
    }

    // Assigned technician filter
    if (assigned_technician_id) {
      whereClause.assigned_technician_id = assigned_technician_id;
    }

    // Requester filter
    if (requester_id) {
      whereClause.requester_id = requester_id;
    }

    // Required skills filter
    if (required_skills) {
      const skillIds = Array.isArray(required_skills) ? required_skills : [required_skills];
      const skillConditions = skillIds.map(skillId => 
        `JSON_SEARCH(required_skills, 'one', '${skillId}') IS NOT NULL`
      );
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        { [Op.or]: skillConditions.map(condition => ({ [Op.and]: [condition] })) }
      ];
    }

    // Escalation count range filter
    if (escalation_count_min !== undefined || escalation_count_max !== undefined) {
      whereClause.escalation_count = {};
      if (escalation_count_min !== undefined) whereClause.escalation_count[Op.gte] = parseInt(escalation_count_min);
      if (escalation_count_max !== undefined) whereClause.escalation_count[Op.lte] = parseInt(escalation_count_max);
    }

    // Satisfaction rating range filter
    if (satisfaction_rating_min !== undefined || satisfaction_rating_max !== undefined) {
      whereClause.satisfaction_rating = {};
      if (satisfaction_rating_min !== undefined) whereClause.satisfaction_rating[Op.gte] = parseInt(satisfaction_rating_min);
      if (satisfaction_rating_max !== undefined) whereClause.satisfaction_rating[Op.lte] = parseInt(satisfaction_rating_max);
    }

    // Score range filter
    if (score_min !== undefined || score_max !== undefined) {
      whereClause.score = {};
      if (score_min !== undefined) whereClause.score[Op.gte] = parseFloat(score_min);
      if (score_max !== undefined) whereClause.score[Op.lte] = parseFloat(score_max);
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

    if (resolution_due_from || resolution_due_to) {
      whereClause.resolution_due = {};
      if (resolution_due_from) whereClause.resolution_due[Op.gte] = new Date(resolution_due_from);
      if (resolution_due_to) whereClause.resolution_due[Op.lte] = new Date(resolution_due_to);
    }

    // Global search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'subject', 'status', 'priority', 'urgency', 'impact', 'sla_violated', 'escalation_count', 'satisfaction_rating', 'score', 'justification', 'created_at', 'updated_at', 'resolution_due'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level', 'availability_status'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
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
        tickets: rows,
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
          subject,
          description,
          status,
          priority,
          urgency,
          impact,
          sla_violated,
          assigned_technician_id,
          requester_id,
          required_skills,
          escalation_count_min,
          escalation_count_max,
          satisfaction_rating_min,
          satisfaction_rating_max,
          score_min,
          score_max,
          created_from,
          created_to,
          updated_from,
          updated_to,
          resolution_due_from,
          resolution_due_to,
          search,
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department', 'contact_no']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level', 'availability_status', 'specialization'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'contact_no']
            }
          ]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

// Get tickets by user ID (requester)
const getTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, priority } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { Op } = require('sequelize');

    // Build where clause
    const whereClause = { requester_id: userId };

    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        whereClause.priority = { [Op.in]: priority };
      } else {
        whereClause.priority = priority;
      }
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['work_logs', 'audit_trail'] }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        tickets: rows,
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
          requester_id: userId,
          status,
          priority
        }
      }
    });
  } catch (error) {
    console.error('Get tickets by user ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets for user',
      error: error.message
    });
  }
};

// Get tickets by technician ID (assigned)
const getTicketsByTechnicianId = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { page = 1, limit = 10, status, priority } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { Op } = require('sequelize');

    // Build where clause
    const whereClause = { assigned_technician_id: technicianId };

    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        whereClause.priority = { [Op.in]: priority };
      } else {
        whereClause.priority = priority;
      }
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['work_logs', 'audit_trail'] }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        tickets: rows,
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
          assigned_technician_id: technicianId,
          status,
          priority
        }
      }
    });
  } catch (error) {
    console.error('Get tickets by technician ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets for technician',
      error: error.message
    });
  }
};

// Create new ticket
const createTicket = async (req, res) => {
  try {
    console.log('=== CREATE TICKET DEBUG START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      subject, 
      description, 
      priority,
      impact,
      urgency,
      requester_id,
      assigned_technician_id,
      required_skills,
      tags,
      resolution_due,
      score,
      justification
    } = req.body;
    assigned_technician_id=0
    console.log('Extracted fields:');
    console.log('- assigned_technician_id:', assigned_technician_id);
    console.log('- justification:', justification);
    console.log('- AI_BACKEND_URL:', process.env.AI_BACKEND_URL);

    // Check if requester exists
    const requester = await User.findByPk(requester_id);
    if (!requester) {
      return res.status(400).json({
        success: false,
        message: 'Requester user not found'
      });
    }

    // Check if assigned technician exists (if provided)
    if (assigned_technician_id) {
      const technician = await Technician.findByPk(assigned_technician_id);
      if (!technician) {
        return res.status(400).json({
          success: false,
          message: 'Assigned technician not found'
        });
      }
    }

    // Validate required_skills format if provided
    if (required_skills && Array.isArray(required_skills)) {
      for (const skillId of required_skills) {
        if (!Number.isInteger(skillId) || skillId < 1) {
          return res.status(400).json({
            success: false,
            message: 'Required skills must be an array of positive integers'
          });
        }
      }
    }

    // Validate score if provided
    if (score !== undefined) {
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum) || scoreNum < 0.0 || scoreNum > 10.0) {
        return res.status(400).json({
          success: false,
          message: 'Score must be a number between 0.0 and 10.0'
        });
      }
    }

    // Validate justification if provided
    if (justification !== undefined && justification.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Justification must be less than 1000 characters'
      });
    }

    console.log('Creating ticket with initial data...');
    
    // Create ticket
    const newTicket = await Ticket.create({
      subject,
      description,
      status: assigned_technician_id ? 'assigned' : 'new',
      priority: priority || 'normal',
      impact: impact || 'medium',
      urgency: urgency || 'normal',
      requester_id,
      assigned_technician_id,
      required_skills: required_skills || [],
      tags: tags || [],
      resolution_due: resolution_due ? new Date(resolution_due) : null,
      score: score !== undefined ? parseFloat(score) : null,
      justification: justification || null,
      tasks: [],
      work_logs: [],
      audit_trail: [
        {
          action: 'created',
          timestamp: new Date(),
          user_id: requester_id,
          details: 'Ticket created'
        }
      ]
    });

    console.log('Ticket created with ID:', newTicket.id);
    console.log('Initial ticket data:', {
      id: newTicket.id,
      assigned_technician_id: newTicket.assigned_technician_id,
      justification: newTicket.justification,
      status: newTicket.status
    });

    // Call AI backend for ticket assignment if no technician is assigned
    if (!assigned_technician_id && process.env.AI_BACKEND_URL) {
      try {
        console.log('=== AI BACKEND CALL START ===');
        console.log('Calling AI backend for ticket assignment...');
        console.log('AI Backend URL:', process.env.AI_BACKEND_URL);
        
        // Prepare ticket data for AI backend
        const aiTicketData = {
          ticket: {
            subject,
            description,
            requester_id,
            priority: priority || 'normal',
            impact: impact || 'medium',
            urgency: urgency || 'normal',
            complexity_level: 'level_1', // Default complexity level
            tags: tags || []
          }
        };

        console.log('AI request data:', JSON.stringify(aiTicketData, null, 2));

        // Make request to AI backend
        const aiResponse = await axios.post(
          `${process.env.AI_BACKEND_URL}/api/ticket-assignment`,
          aiTicketData,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        console.log('=== AI BACKEND RESPONSE ===');
        console.log('Response status:', aiResponse.status);
        console.log('Response headers:', aiResponse.headers);
        console.log('Full AI response data:', JSON.stringify(aiResponse.data, null, 2));

        // Extract technician_id and justification from AI response
        // Handle both possible field names from AI response
        const aiTechnicianId = aiResponse.data.selected_technician_id || aiResponse.data.assigned_technician_id;
        const aiJustification = aiResponse.data.justification;

        console.log('Extracted from AI response:');
        console.log('- aiTechnicianId:', aiTechnicianId);
        console.log('- aiJustification:', aiJustification);
        console.log('- AI response success:', aiResponse.data.success);

        // Update ticket with AI assignment if technician_id is provided
        if (aiTechnicianId && aiResponse.data.success !== false) {
          console.log('AI provided technician ID, verifying technician exists...');
          
          // Verify technician exists
          const aiTechnician = await Technician.findByPk(aiTechnicianId);
          if (aiTechnician) {
            console.log('Technician found, updating ticket...');
            
            const updateData = {
              assigned_technician_id: aiTechnicianId,
              status: 'assigned'
            };

            // Only update justification if AI provided one
            if (aiJustification) {
              updateData.justification = aiJustification;
              console.log('Adding AI justification:', aiJustification);
            }

            // Add to audit trail
            const auditEntry = {
              action: 'ai_assigned',
              timestamp: new Date(),
              user_id: requester_id,
              details: `Ticket automatically assigned to technician ${aiTechnicianId} by AI`,
              ai_justification: aiJustification || 'No justification provided by AI'
            };

            updateData.audit_trail = [...newTicket.audit_trail, auditEntry];

            await newTicket.update(updateData);
            
            console.log('Ticket updated successfully with AI assignment');
            console.log('Updated ticket data:', {
              id: newTicket.id,
              assigned_technician_id: newTicket.assigned_technician_id,
              justification: newTicket.justification,
              status: newTicket.status
            });
          } else {
            console.warn(`AI assigned technician ${aiTechnicianId} not found in database`);
            // Add to audit trail
            await newTicket.update({
              audit_trail: [
                ...newTicket.audit_trail,
                {
                  action: 'ai_assignment_failed',
                  timestamp: new Date(),
                  user_id: requester_id,
                  details: `AI assigned technician ${aiTechnicianId} not found in database`,
                  ai_technician_id: aiTechnicianId
                }
              ]
            });
          }
        } else {
          console.log('No technician ID provided by AI or AI request failed');
          if (aiResponse.data.success === false) {
            console.log('AI request failed with error:', aiResponse.data.error_message);
          }
          
          // Add to audit trail
          await newTicket.update({
            audit_trail: [
              ...newTicket.audit_trail,
              {
                action: 'ai_no_assignment',
                timestamp: new Date(),
                user_id: requester_id,
                details: 'AI did not provide technician assignment',
                ai_response: aiResponse.data
              }
            ]
          });
        }
        
        console.log('=== AI BACKEND CALL END ===');
      } catch (aiError) {
        console.error('=== AI BACKEND ERROR ===');
        console.error('Error calling AI backend:', aiError.message);
        console.error('Error details:', {
          code: aiError.code,
          status: aiError.response?.status,
          statusText: aiError.response?.statusText,
          data: aiError.response?.data,
          config: {
            url: aiError.config?.url,
            method: aiError.config?.method,
            timeout: aiError.config?.timeout
          }
        });
        
        // Continue with ticket creation even if AI assignment fails
        // Add error to audit trail
        await newTicket.update({
          audit_trail: [
            ...newTicket.audit_trail,
            {
              action: 'ai_assignment_failed',
              timestamp: new Date(),
              user_id: requester_id,
              details: 'AI ticket assignment failed',
              error: aiError.message,
              error_details: {
                code: aiError.code,
                status: aiError.response?.status,
                data: aiError.response?.data
              }
            }
          ]
        });
      }
    } else {
      console.log('Skipping AI backend call - reason:', 
        assigned_technician_id ? 'Technician already assigned' : 'AI_BACKEND_URL not configured');
    }

    // Get created ticket with relationships
    const createdTicket = await Ticket.findByPk(newTicket.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    console.log('=== FINAL TICKET DATA ===');
    console.log('Final ticket data:', {
      id: createdTicket.id,
      assigned_technician_id: createdTicket.assigned_technician_id,
      justification: createdTicket.justification,
      status: createdTicket.status,
      audit_trail_length: createdTicket.audit_trail?.length
    });
    console.log('=== CREATE TICKET DEBUG END ===');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: createdTicket
    });
  } catch (error) {
    console.error('=== CREATE TICKET ERROR ===');
    console.error('Create ticket error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      subject, 
      description, 
      status,
      priority,
      impact,
      urgency,
      assigned_technician_id,
      required_skills,
      tags,
      resolution_due,
      tasks,
      work_logs,
      satisfaction_rating,
      score,
      justification,
      feedback,
      sla_violated
    } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if assigned technician exists (if provided)
    if (assigned_technician_id && assigned_technician_id !== ticket.assigned_technician_id) {
      const technician = await Technician.findByPk(assigned_technician_id);
      if (!technician) {
        return res.status(400).json({
          success: false,
          message: 'Assigned technician not found'
        });
      }
    }

    // Validate required_skills format if provided
    if (required_skills && Array.isArray(required_skills)) {
      for (const skillId of required_skills) {
        if (!Number.isInteger(skillId) || skillId < 1) {
          return res.status(400).json({
            success: false,
            message: 'Required skills must be an array of positive integers'
          });
        }
      }
    }

    // Validate score if provided
    if (score !== undefined) {
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum) || scoreNum < 0.0 || scoreNum > 10.0) {
        return res.status(400).json({
          success: false,
          message: 'Score must be a number between 0.0 and 10.0'
        });
      }
    }

    // Validate justification if provided
    if (justification !== undefined && justification.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Justification must be less than 1000 characters'
      });
    }

    // Prepare update data
    const updateData = {};
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    if (status) {
      updateData.status = status;
      // Update resolved_at when status changes to resolved
      if (status === 'resolved' && ticket.status !== 'resolved') {
        updateData.resolved_at = new Date();
      }
      // Update closed_at when status changes to closed
      if (status === 'closed' && ticket.status !== 'closed') {
        updateData.closed_at = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (impact) updateData.impact = impact;
    if (urgency) updateData.urgency = urgency;
    if (assigned_technician_id !== undefined) updateData.assigned_technician_id = assigned_technician_id;
    if (required_skills !== undefined) updateData.required_skills = required_skills;
    if (tags !== undefined) updateData.tags = tags;
    if (resolution_due !== undefined) updateData.resolution_due = resolution_due ? new Date(resolution_due) : null;
    if (tasks !== undefined) updateData.tasks = tasks;
    if (work_logs !== undefined) updateData.work_logs = work_logs;
    if (satisfaction_rating !== undefined) updateData.satisfaction_rating = satisfaction_rating;
    if (score !== undefined) updateData.score = parseFloat(score);
    if (justification !== undefined) updateData.justification = justification;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (sla_violated !== undefined) updateData.sla_violated = sla_violated;

    // Add to audit trail
    const currentAuditTrail = ticket.audit_trail || [];
    updateData.audit_trail = [
      ...currentAuditTrail,
      {
        action: 'updated',
        timestamp: new Date(),
        user_id: req.user?.id || null, // Assuming user info from auth middleware
        details: 'Ticket updated',
        changes: Object.keys(updateData).filter(key => key !== 'audit_trail')
      }
    ];

    // Update ticket
    await ticket.update(updateData);

    // Get updated ticket with relationships
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

// Delete ticket (soft delete by setting status to cancelled)
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Soft delete by setting status to cancelled
    await ticket.update({ 
      status: 'cancelled',
      audit_trail: [
        ...(ticket.audit_trail || []),
        {
          action: 'cancelled',
          timestamp: new Date(),
          user_id: req.user?.id || null,
          details: 'Ticket cancelled'
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket',
      error: error.message
    });
  }
};

// Permanently delete ticket (hard delete)
const permanentDeleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.destroy();

    res.status(200).json({
      success: true,
      message: 'Ticket permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting ticket',
      error: error.message
    });
  }
};

// Reactivate ticket (change status from cancelled back to new)
const reactivateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.update({ 
      status: 'new',
      audit_trail: [
        ...(ticket.audit_trail || []),
        {
          action: 'reactivated',
          timestamp: new Date(),
          user_id: req.user?.id || null,
          details: 'Ticket reactivated'
        }
      ]
    });

    const reactivatedTicket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Ticket reactivated successfully',
      data: reactivatedTicket
    });
  } catch (error) {
    console.error('Reactivate ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating ticket',
      error: error.message
    });
  }
};

// Get tickets by required skills (union filter)
const getTicketsBySkills = async (req, res) => {
  try {
    const { skills, page = 1, limit = 10, status } = req.query;

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
      `JSON_SEARCH(required_skills, 'one', '${skillId}') IS NOT NULL`
    );

    const whereClause = {
      [Op.and]: [
        { [Op.or]: skillConditions.map(condition => ({ [Op.and]: [condition] })) }
      ]
    };

    // Add status filter if provided
    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['priority', 'DESC'], ['created_at', 'ASC']], // High priority first, then oldest first
      attributes: { exclude: ['work_logs', 'audit_trail'] }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        tickets: rows,
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
          required_skills: skillIds,
          status
        }
      }
    });
  } catch (error) {
    console.error('Get tickets by skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets by skills',
      error: error.message
    });
  }
};

// Process skills and update ticket
const processSkillsAndUpdateTicket = async (req, res) => {
  try {
    const { skills, ticket_id } = req.body;

    // Validate input
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skills array is required and must not be empty'
      });
    }

    if (!ticket_id) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    // Validate each skill object
    for (const skill of skills) {
      if (!skill.name || typeof skill.name !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Each skill must have a valid name'
        });
      }
    }

    // Check if ticket exists
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const { Skill } = require('../models');
    const processedSkills = [];
    const newSkills = [];
    const updatedSkills = [];

    // Process each skill
    for (const skillData of skills) {
      if (skillData.id) {
        // Skill has ID - update existing skill
        try {
          const existingSkill = await Skill.findByPk(skillData.id);
          if (!existingSkill) {
            return res.status(404).json({
              success: false,
              message: `Skill with ID ${skillData.id} not found`
            });
          }

          // Check if name is being changed and if it already exists
          if (skillData.name && skillData.name !== existingSkill.name) {
            const nameExists = await Skill.findOne({ 
              where: { 
                name: skillData.name,
                id: { [require('sequelize').Op.ne]: skillData.id }
              } 
            });
            if (nameExists) {
              return res.status(400).json({
                success: false,
                message: `Skill with name '${skillData.name}' already exists`
              });
            }
          }

          // Prepare update data
          const updateData = {};
          if (skillData.name) updateData.name = skillData.name;
          if (skillData.description !== undefined) updateData.description = skillData.description;
          if (skillData.is_active !== undefined) updateData.is_active = skillData.is_active;

          // Update skill
          await existingSkill.update(updateData);
          updatedSkills.push(existingSkill);
          processedSkills.push(existingSkill.id);
        } catch (error) {
          console.error(`Error updating skill ${skillData.id}:`, error);
          return res.status(500).json({
            success: false,
            message: `Error updating skill ${skillData.id}`,
            error: error.message
          });
        }
      } else {
        // Skill has no ID - create new skill
        try {
          // Check if skill with this name already exists
          const existingSkill = await Skill.findOne({ where: { name: skillData.name } });
          if (existingSkill) {
            // Use existing skill
            processedSkills.push(existingSkill.id);
            continue;
          }

          // Create new skill
          const newSkill = await Skill.create({
            name: skillData.name,
            description: skillData.description || null,
            is_active: skillData.is_active !== undefined ? skillData.is_active : true
          });

          newSkills.push(newSkill);
          processedSkills.push(newSkill.id);
        } catch (error) {
          console.error(`Error creating skill ${skillData.name}:`, error);
          return res.status(500).json({
            success: false,
            message: `Error creating skill ${skillData.name}`,
            error: error.message
          });
        }
      }
    }

    // Update ticket with all processed skill IDs
    const currentRequiredSkills = ticket.required_skills || [];
    const updatedRequiredSkills = [...new Set([...currentRequiredSkills, ...processedSkills])];

    // Add to audit trail
    const currentAuditTrail = ticket.audit_trail || [];
    const auditEntry = {
      action: 'skills_processed',
      timestamp: new Date(),
      user_id: req.user?.id || null,
      details: 'Skills processed and ticket updated',
      changes: {
        new_skills: newSkills.map(s => ({ id: s.id, name: s.name })),
        updated_skills: updatedSkills.map(s => ({ id: s.id, name: s.name })),
        total_skills_processed: processedSkills.length,
        skills_added_to_ticket: processedSkills
      }
    };

    await ticket.update({
      required_skills: updatedRequiredSkills,
      audit_trail: [...currentAuditTrail, auditEntry]
    });

    // Get updated ticket with relationships
    const updatedTicket = await Ticket.findByPk(ticket_id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: Technician,
          as: 'assigned_technician',
          attributes: ['id', 'name', 'skill_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Skills processed and ticket updated successfully',
      data: {
        ticket: updatedTicket,
        processed_skills: {
          total: processedSkills.length,
          new_skills: newSkills.map(s => ({ id: s.id, name: s.name })),
          updated_skills: updatedSkills.map(s => ({ id: s.id, name: s.name })),
          all_skill_ids: processedSkills
        }
      }
    });
  } catch (error) {
    console.error('Process skills and update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing skills and updating ticket',
      error: error.message
    });
  }
};

// Debug function to test AI backend connection
const debugAIBackend = async (req, res) => {
  try {
    console.log('=== AI BACKEND DEBUG TEST ===');
    
    if (!process.env.AI_BACKEND_URL) {
      return res.status(400).json({
        success: false,
        message: 'AI_BACKEND_URL not configured',
        env_vars: {
          AI_BACKEND_URL: process.env.AI_BACKEND_URL,
          NODE_ENV: process.env.NODE_ENV
        }
      });
    }

    console.log('Testing AI backend connection to:', process.env.AI_BACKEND_URL);

    // Test 1: Health check
    try {
      const healthResponse = await axios.get(`${process.env.AI_BACKEND_URL}/health`, {
        timeout: 10000
      });
      console.log('Health check response:', healthResponse.data);
    } catch (healthError) {
      console.error('Health check failed:', healthError.message);
    }

    // Test 2: Service status
    try {
      const statusResponse = await axios.get(`${process.env.AI_BACKEND_URL}/api/service-status`, {
        timeout: 10000
      });
      console.log('Service status response:', statusResponse.data);
    } catch (statusError) {
      console.error('Service status check failed:', statusError.message);
    }

    // Test 3: Sample ticket assignment
    const sampleTicketData = {
      ticket: {
        subject: "Test ticket for debugging",
        description: "This is a test ticket to verify AI backend integration",
        requester_id: 1,
        priority: "normal",
        impact: "medium",
        urgency: "normal",
        complexity_level: "level_1",
        tags: ["test", "debug"]
      }
    };

    console.log('Sending sample ticket data:', JSON.stringify(sampleTicketData, null, 2));

    try {
      const assignmentResponse = await axios.post(
        `${process.env.AI_BACKEND_URL}/api/ticket-assignment`,
        sampleTicketData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('Sample assignment response:', JSON.stringify(assignmentResponse.data, null, 2));

      res.json({
        success: true,
        message: 'AI backend debug test completed',
        ai_backend_url: process.env.AI_BACKEND_URL,
        sample_response: assignmentResponse.data,
        response_fields: {
          success: assignmentResponse.data.success,
          selected_technician_id: assignmentResponse.data.selected_technician_id,
          assigned_technician_id: assignmentResponse.data.assigned_technician_id,
          justification: assignmentResponse.data.justification,
          error_message: assignmentResponse.data.error_message
        }
      });
    } catch (assignmentError) {
      console.error('Sample assignment failed:', assignmentError.message);
      
      res.status(500).json({
        success: false,
        message: 'AI backend assignment test failed',
        ai_backend_url: process.env.AI_BACKEND_URL,
        error: assignmentError.message,
        error_details: {
          code: assignmentError.code,
          status: assignmentError.response?.status,
          statusText: assignmentError.response?.statusText,
          data: assignmentError.response?.data
        }
      });
    }

  } catch (error) {
    console.error('AI backend debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during AI backend debug test',
      error: error.message
    });
  }
};

module.exports = {
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
  getTicketsBySkills,
  processSkillsAndUpdateTicket,
  debugAIBackend
};