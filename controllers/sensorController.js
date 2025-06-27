const moment = require('moment-timezone');
const SensorReading = require('../models/sensorReading');
const sequelize = SensorReading.sequelize;

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
  console.log('📨 POST /api/query');
  const { start, end, inputInterval } = req.body;

  const intervalMap = {
    '1s': 'second',
    '1m': 'minute',
    '1h': 'hour',
    raw: null,
  };

  const interval = intervalMap[inputInterval];
  if (interval === undefined) {
    return res.status(400).json({ error: 'Invalid interval format' });
  }

  try {
    const startToronto = moment
      .tz(start, 'America/Toronto')
      .format('YYYY-MM-DD HH:mm:ss');
    const endToronto = moment
      .tz(end, 'America/Toronto')
      .format('YYYY-MM-DD HH:mm:ss');

    console.log('🕒 Parsed times (Toronto, no timezone cast):');
    console.log('  ➤ startToronto:', startToronto);
    console.log('  ➤ endToronto  :', endToronto);

    const [minMax] = await sequelize.query(`
      SELECT MIN(timestamp) AS min_ts, MAX(timestamp) AS max_ts
      FROM sensor_stablity_test_system_table_johnny
    `);
    console.log('📊 DB Range:', minMax[0]);

    let query;

    if (interval === null) {
      query = `
        SELECT * FROM sensor_stablity_test_system_table_johnny
        WHERE timestamp >= '${startToronto}'
          AND timestamp <= '${endToronto}'::timestamp + interval '1 second'
        ORDER BY timestamp ASC
      `;
    } else {
      query = `
        SELECT DISTINCT ON (DATE_TRUNC('${interval}', timestamp)) *
        FROM sensor_stablity_test_system_table_johnny
        WHERE timestamp >= '${startToronto}'
          AND timestamp <= '${endToronto}'::timestamp + interval '1 second'
        ORDER BY DATE_TRUNC('${interval}', timestamp) ASC, timestamp ASC
      `;
    }

    console.log('🧾 SQL Query:\n', query);

    const [rows] = await sequelize.query(query);
    console.log(`📥 Raw results: ${rows.length} row(s) found`);

    const converted = rows.map((item) => ({
      ...item,
      timestamp: moment(item.timestamp).format(), // ISO with correct local offset
    }));

    res.json(converted);
  } catch (err) {
    console.error('❌ Error in postTableData:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

const postAlignedTableData = async (req, res) => {
  console.log('🎯 POST /api/aligned-query');
  const { start, end, inputInterval } = req.body;

  // Normalize input interval
  const intervalMap = {
    hour: 'hour',
    minute: 'minute',
    second: 'second',
  };

  const interval = intervalMap[inputInterval];
  if (!interval) {
    return res.status(400).json({ error: 'Invalid inputInterval' });
  }

  try {
    // Treat start/end as Toronto local
    const startToronto = moment
      .tz(start, 'YYYY-MM-DD HH:mm', 'America/Toronto')
      .format('YYYY-MM-DD HH:mm:ss');
    const endToronto = moment
      .tz(end, 'YYYY-MM-DD HH:mm', 'America/Toronto')
      .format('YYYY-MM-DD HH:mm:ss');

    const query = `
      SELECT DISTINCT ON (DATE_TRUNC('${interval}', timestamp)) *
      FROM sensor_stablity_test_system_table_johnny
      WHERE timestamp >= '${startToronto}'
        AND timestamp <= '${endToronto}'::timestamp + interval '1 second'
      ORDER BY DATE_TRUNC('${interval}', timestamp) ASC, timestamp ASC
    `;

    const [rows] = await sequelize.query(query);

    const formatted = rows.map((row) => {
      const obj = {
        id: row.id,
        timestamp: new Date(row.timestamp).toISOString(), // Match Allen: UTC ISO
      };

      for (let i = 1; i <= 24; i++) {
        const key = `ai${i}`;
        const val = parseFloat(row[key]);
        obj[key] = isNaN(val) ? null : val.toFixed(6);
      }

      return obj;
    });

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error in postAlignedTableData:', err);
    res.status(500).json({ error: 'Server error' });
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
  postAlignedTableData,
};
