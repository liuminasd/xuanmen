const express = require('express');
const { getQuizStats, addQuizLog, getWrongAnswers } = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: '请先登录' });
  next();
}
router.use(requireAuth);

router.get('/stats/:system', (req, res) => {
  res.json(getQuizStats(req.session.userId, req.params.system));
});

router.post('/answer', (req, res) => {
  const { system, tier, question_id, correct } = req.body;
  if (!system || !tier || !question_id) {
    return res.status(400).json({ error: '参数不完整' });
  }
  addQuizLog(req.session.userId, system, tier, question_id, correct);
  res.json({ ok: true });
});

router.get('/wrong/:system', (req, res) => {
  res.json(getWrongAnswers(req.session.userId, req.params.system));
});

module.exports = router;
