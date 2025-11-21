const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const chrono = require('chrono-node');

// Enhanced recommendation engine
router.get('/:boardId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).lean();
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const cards = board.cards || [];

    // helpers
    const stop = new Set(['the','a','an','and','or','to','for','of','in','on','is','are','be','with','by','this','that','these','those']);
    const tokenize = s => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).filter(w=>!stop.has(w));

    function parseSuggestedDue(text){
      text = text || '';
      // Try chrono first for natural language parsing
      try{
        const parsed = chrono.parseDate(text);
        if (parsed) return { date: parsed, confidence: 0.98, reason: 'Parsed by chrono' };
      } catch(e){ /* fall through to heuristics */ }

      const now = Date.now();
      // explicit ISO or yyyy-mm-dd or mm/dd/yyyy
      const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
      if (iso) return { date: new Date(iso[1]), confidence: 0.99, reason: 'Explicit date found' };
      const md = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      if (md){
        const d = new Date(md[1]);
        if (!isNaN(d)) return { date: d, confidence: 0.95, reason: 'Explicit date found' };
      }
      if (text.match(/\b(today|due today)\b/)) return { date: new Date(now), confidence: 0.9, reason: 'Contains "today"' };
      if (text.match(/\b(tomorrow|due tomorrow)\b/)) return { date: new Date(now + 24*3600*1000), confidence: 0.9, reason: 'Contains "tomorrow"' };
      const inDays = text.match(/in (\d+) (day|days|d)\b/);
      if (inDays) return { date: new Date(now + parseInt(inDays[1],10)*24*3600*1000), confidence: 0.85, reason: `In ${inDays[1]} days` };
      if (text.match(/\b(urgent|asap|as soon as possible|immediately)\b/)) return { date: new Date(now + 24*3600*1000), confidence: 0.7, reason: 'Urgency detected' };
      if (text.match(/\b(next week)\b/)) return { date: new Date(now + 7*24*3600*1000), confidence: 0.6, reason: 'Next week mention' };
      return null;
    }

    function suggestMove(text){
      text = text.toLowerCase();
      if (text.match(/\b(start|started|doing|in progress|begin)\b/)) return { list: 'In Progress', confidence: 0.9, reason: 'Progress keywords' };
      if (text.match(/\b(done|completed|finished|closed)\b/)) return { list: 'Done', confidence: 0.95, reason: 'Completion keywords' };
      if (text.match(/\b(review|needs review|qa)\b/)) return { list: 'Review', confidence: 0.8, reason: 'Review keywords' };
      return null;
    }

    // build tokens map
    const cardTokens = cards.map(c => ({ id: c._id, title: c.title || '', description: c.description || '', tokens: tokenize((c.title||'')+' '+(c.description||'')), labels: c.labels||[] }));

    // recommendations per card
    const recs = cardTokens.map(ct => {
      const text = (ct.title + ' ' + ct.description).toLowerCase();
      const due = parseSuggestedDue(text);
      const move = suggestMove(text);
      // combine confidence metric
      const score = Math.max(due?due.confidence:0, move?move.confidence:0);
      return {
        cardId: ct.id,
        title: ct.title,
        suggestedDue: due ? { date: due.date, confidence: due.confidence, reason: due.reason } : null,
        suggestedMove: move ? { list: move.list, confidence: move.confidence, reason: move.reason } : null,
        score
      };
    });

    // related cards: Jaccard similarity on token sets and also label overlap
    const relatedGroups = [];
    for (let i=0;i<cardTokens.length;i++){
      for (let j=i+1;j<cardTokens.length;j++){
        const a = cardTokens[i], b = cardTokens[j];
        const aset = new Set(a.tokens), bset = new Set(b.tokens);
        const inter = a.tokens.filter(t=>bset.has(t));
        const union = new Set([...a.tokens, ...b.tokens]);
        const jaccard = union.size ? inter.length / union.size : 0;
        const commonLabels = (a.labels || []).filter(l => (b.labels || []).includes(l));
        // score more if label overlap
        let relScore = jaccard + (commonLabels.length?0.3:0);
        if (relScore >= 0.15){
          relatedGroups.push({ cards: [a.id, b.id], commonTokens: inter, commonLabels, score: Math.round(relScore*100)/100 });
        }
      }
    }

    // keep only meaningful recommendations (score > 0 or explicit suggestion)
    const meaningful = recs.filter(r => (r.score && r.score > 0) || r.suggestedDue || r.suggestedMove);
    meaningful.sort((x,y)=> (y.score||0) - (x.score||0));

    // attach titles to related groups for easier UI display
    const relatedWithTitles = relatedGroups.map(g => ({ ...g, titles: g.cards.map(cid => {
      const found = cards.find(c=> String(c._id) === String(cid));
      return found ? (found.title || '(untitled)') : cid;
    }) }));

    res.json({ recommendations: meaningful, related: relatedWithTitles });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Debug endpoint: return intermediate parsing/tokenization results for each card
router.get('/:boardId/debug', async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).lean();
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const cards = board.cards || [];
    const stop = new Set(['the','a','an','and','or','to','for','of','in','on','is','are','be','with','by','this','that','these','those']);
    const tokenize = s => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).filter(w=>!stop.has(w));

    const diagnostics = cards.map(c => {
      const title = c.title || '';
      const desc = c.description || '';
      const text = (title + ' ' + desc).toLowerCase();
      const tokens = tokenize(title + ' ' + desc);

      // date detections (reuse logic from main endpoint)
      const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
      const md = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      const today = !!text.match(/\b(today|due today)\b/);
      const tomorrow = !!text.match(/\b(tomorrow|due tomorrow)\b/);
      const inDays = text.match(/in (\d+) (day|days|d)\b/);
      const urgent = !!text.match(/\b(urgent|asap|immediately)\b/);

      // move detections
      const moveInProgress = !!text.match(/\b(start|started|doing|in progress|begin)\b/);
      const moveDone = !!text.match(/\b(done|completed|finished|closed)\b/);
      const moveReview = !!text.match(/\b(review|needs review|qa)\b/);

      return {
        cardId: c._id,
        title,
        description: desc,
        tokens,
        dateMatches: { iso: iso ? iso[1] : null, md: md ? md[1] : null, today, tomorrow, inDays: inDays ? inDays[1] : null, urgent },
        moveMatches: { moveInProgress, moveDone, moveReview },
        labels: c.labels || [],
        list: c.list || null
      };
    });

    res.json({ boardId: req.params.boardId, diagnostics });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
