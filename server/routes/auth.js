const express = require('express');
const bcrypt = require('bcryptjs');
const { findUser, createUser } = require('../db');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: '密码至少4位' });
  }
  if (findUser(username)) {
    return res.status(409).json({ error: '用户名已存在' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = createUser(username, hash);

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ id: user.id, username: user.username });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = findUser(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ id: user.id, username: user.username });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  }
  res.json({ loggedIn: true, id: req.session.userId, username: req.session.username });
});

module.exports = router;
