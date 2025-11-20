const express = require('express');
const router = express.Router();
const Board = require('../models/Board');

// Very simple recommendation engine
router.get('/:boardId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).lean();
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const cards = board.cards || [];
    const recs = cards.map(card => {
      const text = ((card.title || '') + ' ' + (card.description || '')).toLowerCase();
      // Suggested due date heuristics
      let suggestedDue = null;
      if (text.includes('urgent')) suggestedDue = new Date(Date.now() + 24*3600*1000);
      else if (text.includes('today')) suggestedDue = new Date();
      else if (text.includes('tomorrow')) suggestedDue = new Date(Date.now() + 24*3600*1000);
      else if (text.includes('next week')) suggestedDue = new Date(Date.now() + 7*24*3600*1000);

      // Suggested list move heuristics
      let suggestedMove = null;
      if (text.match(/\b(start|started|doing|in progress)\b/)) suggestedMove = 'In Progress';
      if (text.match(/\b(done|completed|finished)\b/)) suggestedMove = 'Done';

      return { cardId: card._id, title: card.title, suggestedDue, suggestedMove };
    });

    // Simple related cards: find other cards that share a word (ignoring stop words)
    const stop = new Set(['the','a','an','and','or','to','for','of','in','on','is','are','be','with','by']);
    const tokenize = s => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).filter(w=>!stop.has(w));

    const cardTokens = cards.map(c => ({ id: c._id, tokens: tokenize((c.title||'')+' '+(c.description||'')) }));
    const related = [];
    for (let i=0;i<cardTokens.length;i++){
      for (let j=i+1;j<cardTokens.length;j++){
        const a = cardTokens[i], b = cardTokens[j];
        const common = a.tokens.filter(t=>b.tokens.includes(t));
        if (common.length) related.push({ cards: [a.id,b.id], common });
      }
    }

    res.json({ recommendations: recs, related });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
