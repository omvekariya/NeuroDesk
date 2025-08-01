'use strict';

module.exports = (sequelize, DataTypes) => {
  const Technician = sequelize.define('Technician', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_tickets_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    assigned_tickets: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of ticket IDs: [1, 2, 3]'
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of skill objects with id and percentage: [{id: 1, percentage: 85}, {id: 2, percentage: 90}]'
    },
    workload: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    availability_status: {
      type: DataTypes.ENUM('available', 'busy', 'in_meeting', 'on_break', 'end_of_shift', 'focus_mode'),
      allowNull: false,
      defaultValue: 'available'
    },
    skill_level: {
      type: DataTypes.ENUM('junior', 'mid', 'senior', 'expert'),
      allowNull: false,
      defaultValue: 'junior'
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'technicians',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['availability_status']
      },
      {
        fields: ['workload']
      },
      {
        fields: ['skill_level']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Technician.associate = function(models) {
    // Simple relationship - Technician belongs to a User
    Technician.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    // Simple relationship - Technician can have many tickets
    Technician.hasMany(models.Ticket, {
      foreignKey: 'assigned_technician_id',
      as: 'tickets'
    });
  };

  return Technician;
};