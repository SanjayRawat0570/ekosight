const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const { authMiddleware } = require('../middleware/auth');


// Create board (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const b = new Board({ title: req.body.title || 'New Board', members: req.body.members || [req.user.email], lists: req.body.lists || [] });
    await b.save();
    res.json(b);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all boards (simple)
router.get('/', async (req, res) => {
  const boards = await Board.find().sort({ createdAt: -1 }).lean();
  res.json(boards);
});

// Get board by id
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).lean();
    if (!board) return res.status(404).json({ error: 'Not found' });
    res.json(board);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add list
router.post('/:id/lists', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    board.lists.push({ title: req.body.title || 'Untitled' });
    await board.save();
    res.json(board);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add card
router.post('/:id/cards', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    const card = {
      title: req.body.title,
      description: req.body.description,
      list: req.body.list || (board.lists[0] && board.lists[0].title) || 'To Do',
      labels: req.body.labels || []
    };
    board.cards.push(card);
    await board.save();
    res.json(board);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update card (move, edit, set due date)
router.patch('/:id/cards/:cardId', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    const card = board.cards.id(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    const { title, description, list, dueDate, labels } = req.body;
    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (list !== undefined) card.list = list;
    if (dueDate !== undefined) card.dueDate = dueDate ? new Date(dueDate) : null;
    if (labels !== undefined) card.labels = labels;
    await board.save();
    res.json(board);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Invite member by email
router.post('/:id/invite', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    if (!board.members.includes(email)) board.members.push(email);
    await board.save();
    res.json(board);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
