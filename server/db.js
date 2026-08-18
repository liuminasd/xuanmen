const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'xuanmen.json');

// 初始化
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    progress: [],
    quiz_log: [],
    bookmarks: []
  }, null, 2));
}

function readDb() {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 用户操作
function findUser(username) {
  return readDb().users.find(u => u.username === username);
}

function findUserById(id) {
  return readDb().users.find(u => u.id === id);
}

function createUser(username, passwordHash) {
  const db = readDb();
  const id = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const user = { id, username, password_hash: passwordHash, created_at: new Date().toISOString() };
  db.users.push(user);
  writeDb(db);
  return user;
}

// 进度操作
function getProgress(userId, system) {
  const db = readDb();
  const rows = db.progress.filter(p => p.user_id === userId && p.system === system);
  const map = {};
  for (const r of rows) {
    map[r.page] = { completed: !!r.completed, score: r.score, updated_at: r.updated_at };
  }
  return map;
}

function updateProgress(userId, system, page, completed, score) {
  const db = readDb();
  const idx = db.progress.findIndex(p => p.user_id === userId && p.system === system && p.page === page);

  if (idx >= 0) {
    if (completed !== undefined && completed !== null) db.progress[idx].completed = completed;
    if (score !== undefined && score !== null) db.progress[idx].score = score;
    db.progress[idx].updated_at = new Date().toISOString();
  } else {
    db.progress.push({
      user_id: userId, system, page,
      completed: completed ?? 0, score: score ?? 0,
      updated_at: new Date().toISOString()
    });
  }
  writeDb(db);
}

// 题库操作
function getQuizStats(userId, system) {
  const db = readDb();
  const logs = db.quiz_log.filter(q => q.user_id === userId && q.system === system);

  const byTier = {};
  for (const l of logs) {
    if (!byTier[l.tier]) byTier[l.tier] = { total: 0, correct: 0 };
    byTier[l.tier].total++;
    if (l.correct) byTier[l.tier].correct++;
  }
  return Object.entries(byTier).map(([tier, s]) => ({ tier, ...s }));
}

function addQuizLog(userId, system, tier, questionId, correct) {
  const db = readDb();
  db.quiz_log.push({
    user_id: userId, system, tier, question_id: questionId,
    correct: correct ? 1 : 0,
    timestamp: new Date().toISOString()
  });
  writeDb(db);
}

function getWrongAnswers(userId, system) {
  const db = readDb();
  const wrong = {};
  for (const q of db.quiz_log) {
    if (q.user_id === userId && q.system === system && !q.correct) {
      const key = `${q.tier}:${q.question_id}`;
      wrong[key] = (wrong[key] || 0) + 1;
    }
  }
  return Object.entries(wrong)
    .map(([key, attempts]) => {
      const [tier, question_id] = key.split(':');
      return { question_id, tier, attempts };
    })
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 50);
}

// 书签操作
function getBookmarks(userId, system) {
  return readDb().bookmarks.filter(b => b.user_id === userId && b.system === system);
}

function addBookmark(userId, system, page, note) {
  const db = readDb();
  db.bookmarks.push({
    user_id: userId, system, page, note: note || '',
    created_at: new Date().toISOString()
  });
  writeDb(db);
}

module.exports = {
  findUser, findUserById, createUser,
  getProgress, updateProgress,
  getQuizStats, addQuizLog, getWrongAnswers,
  getBookmarks, addBookmark
};
