require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const boardsRouter = require('./routes/boards');
const recsRouter = require('./routes/recommendations');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-trello';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Mongo connect error', err));

app.use('/api/auth', authRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/recommendations', recsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
