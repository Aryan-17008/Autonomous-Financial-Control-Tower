const express = require('express');
const cors = require('cors');
const transactionsRouter = require('./routes/transactions');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'Financial Control Tower API' });
});

app.use('/api', transactionsRouter);

// Seed sample data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
if (count === 0) {
  const seed = require('./seed');
  seed();
}

app.listen(PORT, () => {
  console.log(`🚀 Financial Control Tower API running on port ${PORT}`);
});

module.exports = app;
