require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const paymentRouter = require('./routes/payment');
const notifyRouter = require('./routes/notify');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/notify', notifyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bhumi API is running' });
});

app.listen(PORT, () => {
  console.log(`🌿 Bhumi API running on port ${PORT}`);
});
