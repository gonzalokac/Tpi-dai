const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // adaptá según tu conexión

const EventLocation = sequelize.define('EventLocation', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  max_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'event_location',
  timestamps: false
});

module.exports = EventLocation;
