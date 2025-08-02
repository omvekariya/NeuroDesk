'use strict';

module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 500]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'),
      allowNull: false,
      defaultValue: 'new'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'normal'
    },
    impact: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium'
    },
    urgency: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'normal'
    },
    // SLA related fields
    sla_violated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    resolution_due: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolution_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    first_response_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    response_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    resolution_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    escalation_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Relationships
    requester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_technician_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'technicians',
        key: 'id'
      }
    },
    // JSON fields for simple data storage
    required_skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of skill IDs: [1, 2, 3]'
    },
    tasks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of task objects: [{sub: "Task 1", status: "pending", description: "Details"}]'
    },
    work_logs: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of work log entries with timestamps and notes'
    },
    audit_trail: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of all changes made to the ticket'
    },
    // Additional tracking
    first_response_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reopened_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    satisfaction_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0.0,
        max: 10.0
      }
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Severity: Medium',
      comment: 'Justification for ticket decisions or actions'
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['urgency']
      },
      {
        fields: ['impact']
      },
      {
        fields: ['requester_id']
      },
      {
        fields: ['assigned_technician_id']
      },
      {
        fields: ['sla_violated']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['resolution_due']
      }
    ]
  });

  Ticket.associate = function(models) {
    // Simple relationships - Ticket belongs to a requester (User)
    Ticket.belongsTo(models.User, {
      foreignKey: 'requester_id',
      as: 'requester'
    });
    
    // Simple relationship - Ticket can be assigned to a technician
    Ticket.belongsTo(models.Technician, {
      foreignKey: 'assigned_technician_id',
      as: 'assigned_technician'
    });
  };

  return Ticket;
};