const express = require('express');
const { getProgress, updateProgress } = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: '请先登录' });
  next();
}
router.use(requireAuth);

router.get('/:system', (req, res) => {
  res.json(getProgress(req.session.userId, req.params.system));
});

router.put('/:system/:page', (req, res) => {
  const { completed, score } = req.body;
  updateProgress(req.session.userId, req.params.system, req.params.page, completed, score);
  res.json({ ok: true });
});

module.exports = router;
