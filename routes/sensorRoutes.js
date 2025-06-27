const express = require('express');
const router = express.Router();
const controller = require('../controllers/sensorController');

router.get('/crud', controller.getTableData);
router.get('/sensor', controller.getSensorStabilityTestSystemData);
router.get('/sensor/1s', controller.getSensorStabilityTestSystemData_1s);
router.get('/sensor/1m', controller.getSensorStabilityTestSystemData_1m);
router.get('/sensor/1h', controller.getSensorStabilityTestSystemData_1h);
router.get('/calrig', controller.getCalData);
router.post('/query', controller.postTableData);
router.post('/aligned-query', controller.postAlignedTableData);

module.exports = router;
