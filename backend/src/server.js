require('dotenv').config();
const express = require('express');
const cors = require('cors');
const trendsRouter = require('./routes/trends');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

// API Routes
app.use('/api/trends', trendsRouter);

// Health check
app.get('/', (req, res) => {
  res.send('Blue Horizon API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});