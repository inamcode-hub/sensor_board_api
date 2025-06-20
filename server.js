const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for all origins (or restrict below if needed)
app.use(cors());

// ✅ Accept JSON bodies
app.use(express.json());

// ✅ Serve static dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ API routes
const sensorRoutes = require('./routes/sensorRoutes');
app.use('/api/v1', sensorRoutes);

// ✅ Optional SPA fallback (skip if you're serving frontend separately)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/index.html'));
// });

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  sequelize
    .authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection error:', err));
});
