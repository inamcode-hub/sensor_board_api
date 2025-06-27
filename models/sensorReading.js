const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SensorReading = sequelize.define(
  'SensorReading',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ai1: DataTypes.STRING(100),
    ai2: DataTypes.STRING(100),
    ai3: DataTypes.STRING(100),
    ai4: DataTypes.STRING(100),
    ai5: DataTypes.STRING(100),
    ai6: DataTypes.STRING(100),
    ai7: DataTypes.STRING(100),
    ai8: DataTypes.STRING(100),
    ai9: DataTypes.STRING(100),
    ai10: DataTypes.STRING(100),
    ai11: DataTypes.STRING(100),
    ai12: DataTypes.STRING(100),
    ai13: DataTypes.STRING(100),
    ai14: DataTypes.STRING(100),
    ai15: DataTypes.STRING(100),
    ai16: DataTypes.STRING(100),
    ai17: DataTypes.STRING(100),
    ai18: DataTypes.STRING(100),
    ai19: DataTypes.STRING(100),
    ai20: DataTypes.STRING(100),
    ai21: DataTypes.STRING(100),
    ai22: DataTypes.STRING(100),
    ai23: DataTypes.STRING(100),
    ai24: DataTypes.STRING(100),
  },
  {
    tableName: 'sensor_stablity_test_system_table_johnny',
    timestamps: false,
  }
);

module.exports = SensorReading;
