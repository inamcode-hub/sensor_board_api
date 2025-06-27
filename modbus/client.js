const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

async function connectModbus() {
  await client.connectRTUBuffered('/dev/ttyUSB0', { baudRate: 9600 });
  client.setID(1);
  console.log('[Modbus] Connected');
}

module.exports = { client, connectModbus };
