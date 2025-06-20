const moment = require('moment-timezone');
const SensorReading = require('../models/sensorReading');

const getTableData = async (req, res) => {
  try {
    const result = await SensorReading.findAll({
      order: [['id', 'DESC']],
      limit: 1,
      raw: true, // <-- ✨ this converts it to a plain object
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching table data:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const getSensorStabilityTestSystemData = async (req, res) => {
  console.log('GET /api/sensor called');
  try {
    const result = await SensorReading.findAll({ limit: 10 });
    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const getSensorStabilityTestSystemData_1s = async (req, res) => {
  console.log('GET /api/sensor/1s called');
  try {
    const [results] = await SensorReading.sequelize.query(`
      SELECT DISTINCT ON (DATE_TRUNC('second', timestamp)) *
      FROM sensor_stablity_test_system_table_johnny
      ORDER BY DATE_TRUNC('second', timestamp), timestamp ASC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const getSensorStabilityTestSystemData_1m = async (req, res) => {
  console.log('GET /api/sensor/1m called');
  try {
    const [results] = await SensorReading.sequelize.query(`
      SELECT DISTINCT ON (DATE_TRUNC('minute', timestamp)) *
      FROM sensor_stablity_test_system_table_johnny
      ORDER BY DATE_TRUNC('minute', timestamp), timestamp ASC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const getSensorStabilityTestSystemData_1h = async (req, res) => {
  console.log('GET /api/sensor/1h called');
  try {
    const [results] = await SensorReading.sequelize.query(`
      SELECT DISTINCT ON (DATE_TRUNC('hour', timestamp)) *
      FROM sensor_stablity_test_system_table_johnny
      ORDER BY DATE_TRUNC('hour', timestamp), timestamp ASC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const getCalData = async (req, res) => {
  try {
    const [results] = await SensorReading.sequelize.query(
      `SELECT * FROM cal_table`
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching cal data:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const postTableData = async (req, res) => {
  console.log('POST /api/query called');
  const { start, end, inputInterval = 'minute' } = req.body;

  try {
    const startToronto = moment
      .tz(start, 'YYYY-MM-DD HH:mm', 'America/Toronto')
      .format('YYYY-MM-DD HH:mm:ss');
    const endToronto = moment
      .tz(end, 'YYYY-MM-DD HH:mm', 'America/Toronto')
      .format('YYYY-MM-DD HH:mm:ss');

    const query = `
      SELECT DISTINCT ON (DATE_TRUNC('${inputInterval}', timestamp)) *
      FROM sensor_stablity_test_system_table_johnny
      WHERE timestamp >= '${startToronto}' AT TIME ZONE 'America/Toronto'
        AND timestamp <= '${endToronto}' AT TIME ZONE 'America/Toronto' + interval '1 second'
      ORDER BY DATE_TRUNC('${inputInterval}', timestamp), timestamp ASC
    `;

    const [results] = await SensorReading.sequelize.query(query);

    const converted = results.map((item) => ({
      ...item,
      timestamp: moment
        .tz(item.timestamp, 'UTC')
        .tz('America/Toronto')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    }));

    res.json(converted);
  } catch (err) {
    console.error('Error in postTableData:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

module.exports = {
  getTableData,
  getSensorStabilityTestSystemData,
  getSensorStabilityTestSystemData_1s,
  getSensorStabilityTestSystemData_1m,
  getSensorStabilityTestSystemData_1h,
  getCalData,
  postTableData,
};
