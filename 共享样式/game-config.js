/*══════════════════════════════════════════════════════════
  玄门修炼平台 · 游戏配置
  覆盖：等级表 · XP奖励 · 称号 · 成就 · 试炼 · NPC
  ══════════════════════════════════════════════════════════*/
(function(global) {
  'use strict';

  /* ── 修炼等级表 ── */
  // xpForLevel(n): 从 n 级升到 n+1 级所需的 XP
  function xpForLevel(n) {
    return Math.floor(50 * Math.pow(n, 1.35) + 30);
  }

  // 累积 XP 到等级的映射（快速查找用）
  function buildCumulativeXp() {
    var cum = [0]; // cum[1] = 升到2级需要累积多少XP
    for (var i = 1; i <= 100; i++) {
      cum[i] = cum[i-1] + xpForLevel(i);
    }
    return cum;
  }
  var cumulativeXp = buildCumulativeXp();

  /* ── 境界称号 ── */
  var TITLES = [
    { min: 1,  max: 4,  title: '门外弟子', color: '#888' },
    { min: 5,  max: 9,  title: '入门弟子', color: 'var(--blue)' },
    { min: 10, max: 17, title: '内门弟子', color: 'var(--green)' },
    { min: 18, max: 28, title: '真传弟子', color: 'var(--gold)' },
    { min: 29, max: 40, title: '筑基修士', color: 'var(--gold-lt)' },
    { min: 41, max: 54, title: '金丹真人', color: '#f0a040' },
    { min: 55, max: 69, title: '元婴上仙', color: 'var(--purple)' },
    { min: 70, max: 84, title: '化神大能', color: '#d060e0' },
    { min: 85, max: 99, title: '渡劫天尊', color: '#ff6080' }
  ];

  function getTitle(level) {
    for (var i = 0; i < TITLES.length; i++) {
      if (level >= TITLES[i].min && level <= TITLES[i].max) return TITLES[i];
    }
    return TITLES[0];
  }

  function getLevelFromTotalXp(totalXp) {
    for (var i = cumulativeXp.length - 1; i >= 1; i--) {
      if (totalXp >= cumulativeXp[i]) return i + 1;
    }
    return 1;
  }

  /* ── XP 奖励表 ── */
  var XP_REWARDS = {
    quizCorrect:     10,   // 答题正确
    quizCorrectBonus: 5,   // 连击5+时的额外奖励
    quizWrong:        3,   // 答题错误（仍有收获）
    matchComplete:   15,   // 完成配对练习
    chapterRead:     20,   // 阅读新章节（一次性）
    flashcardMaster:  8,   // 掌握闪卡
    weeklyCheckpoint:50,   // 完成周阶段
    perfectQuiz:     30,   // 单tab全部正确
    dailyFirst:       5,   // 每日首次操作
    dailyStreakBonus: 2,   // 每日连击加成（per day，上限30）
    trialBronze:     50,   // 试炼铜牌
    trialSilver:    100,   // 试炼银牌
    trialGold:      200,   // 试炼金牌
    dailyTask:       30,   // 完成每日任务单项
    dailyAll:        50    // 完成全部每日任务
  };

  /* ── 每日任务定义 ── */
  var DAILY_TASKS = [
    { id: 'answer_10',    name: '解答10道题目',  icon: '📝', target: 10 },
    { id: 'read_chapter', name: '阅读1个新章节',  icon: '📖', target: 1  },
    { id: 'flashcard_3', name: '掌握3张灵符',    icon: '🃏', target: 3  },
    { id: 'trial_1',      name: '完成1次试炼',    icon: '⚔️',  target: 1  }
  ];

  /* ── 成就定义 ── */
  var ACHIEVEMENTS = [
    // === 答题类 ===
    { id:'first_blood', name:'初窥门径', desc:'回答第一道题目', icon:'🔰', cat:'quiz', type:'threshold', target:1, rewardXp:30, rarity:'common' },
    { id:'quiz_10_streak', name:'一气呵成', desc:'连续答对10题', icon:'🔥', cat:'quiz', type:'threshold', target:10, rewardXp:150, rarity:'rare' },
    { id:'quiz_25_streak', name:'道心坚定', desc:'连续答对25题', icon:'💎', cat:'quiz', type:'threshold', target:25, rewardXp:400, rarity:'epic' },
    { id:'quiz_50_streak', name:'天选之人', desc:'连续答对50题', icon:'👑', cat:'quiz', type:'threshold', target:50, rewardXp:1000, rarity:'legendary' },
    { id:'quiz_100_total', name:'学海无涯', desc:'累计回答100道题目', icon:'📜', cat:'quiz', type:'cumulative', target:100, rewardXp:200, rarity:'common' },
    { id:'quiz_500_total', name:'皓首穷经', desc:'累计回答500道题目', icon:'🏛️', cat:'quiz', type:'cumulative', target:500, rewardXp:800, rarity:'epic' },
    { id:'quiz_1000_total', name:'万题宗师', desc:'累计回答1000道题目', icon:'🎓', cat:'quiz', type:'cumulative', target:1000, rewardXp:2000, rarity:'legendary' },
    { id:'quiz_perfect_10', name:'十全十美', desc:'在一个分类中全部答对(10题)', icon:'💯', cat:'quiz', type:'single_session', target:1, rewardXp:250, rarity:'rare' },
    { id:'quiz_all_subjects', name:'三花聚顶', desc:'在三个学科中都答过题', icon:'☯️', cat:'quiz', type:'threshold', target:3, rewardXp:300, rarity:'rare' },

    // === 连击类 ===
    { id:'daily_3_days', name:'三日筑基', desc:'连续修炼3天', icon:'🌱', cat:'streak', type:'threshold', target:3, rewardXp:60, rarity:'common' },
    { id:'daily_7_days', name:'七日金丹', desc:'连续修炼7天', icon:'⭐', cat:'streak', type:'threshold', target:7, rewardXp:200, rarity:'rare' },
    { id:'daily_30_days', name:'一月元婴', desc:'连续修炼30天', icon:'🌙', cat:'streak', type:'threshold', target:30, rewardXp:1000, rarity:'epic' },
    { id:'daily_100_days', name:'百日飞升', desc:'连续修炼100天', icon:'🚀', cat:'streak', type:'threshold', target:100, rewardXp:3000, rarity:'legendary' },

    // === 学习类 ===
    { id:'chapters_10', name:'博览群书', desc:'阅读10个章节', icon:'📚', cat:'study', type:'cumulative', target:10, rewardXp:100, rarity:'common' },
    { id:'chapters_all', name:'通晓三式', desc:'阅读所有学科的全部章节', icon:'🗺️', cat:'study', type:'threshold', target:1, rewardXp:600, rarity:'epic' },
    { id:'flashcards_50', name:'灵符大师', desc:'掌握50张灵符', icon:'🃏', cat:'study', type:'cumulative', target:50, rewardXp:300, rarity:'rare' },

    // === 等级类 ===
    { id:'level_5',  name:'入门弟子', desc:'修炼至第5级', icon:'🥋', cat:'level', type:'threshold', target:5,  rewardXp:50,  rarity:'common' },
    { id:'level_10', name:'内门弟子', desc:'修炼至第10级', icon:'⚔️', cat:'level', type:'threshold', target:10, rewardXp:150, rarity:'rare' },
    { id:'level_18', name:'真传弟子', desc:'修炼至第18级', icon:'🛡️', cat:'level', type:'threshold', target:18, rewardXp:400, rarity:'epic' },
    { id:'level_29', name:'筑基修士', desc:'修炼至第29级', icon:'🏯', cat:'level', type:'threshold', target:29, rewardXp:800, rarity:'epic' },
    { id:'level_41', name:'金丹真人', desc:'修炼至第41级', icon:'🔮', cat:'level', type:'threshold', target:41, rewardXp:1500, rarity:'legendary' },

    // === 试炼类 ===
    { id:'trial_first',     name:'初入试炼', desc:'完成第一次试炼', icon:'🏟️', cat:'trial', type:'threshold', target:1, rewardXp:100, rarity:'common' },
    { id:'trial_gold',      name:'试炼金仙', desc:'在任意试炼中获得金牌', icon:'🥇', cat:'trial', type:'threshold', target:1, rewardXp:300, rarity:'rare' },
    { id:'trial_all_gold',  name:'三界至尊', desc:'在所有试炼中获得金牌', icon:'🏆', cat:'trial', type:'threshold', target:3, rewardXp:1000, rarity:'epic' },

    // === 学科大师 ===
    { id:'qmdj_master', name:'帝王术士', desc:'奇门遁甲修炼至第5级', icon:'🏯', cat:'mastery', type:'threshold', target:5, rewardXp:250, rarity:'rare' },
    { id:'zwds_master', name:'命理宗师', desc:'紫微斗数修炼至第5级', icon:'🔮', cat:'mastery', type:'threshold', target:5, rewardXp:250, rarity:'rare' },
    { id:'mhyc_master', name:'卦象通灵', desc:'梅花易数修炼至第5级', icon:'🌸', cat:'mastery', type:'threshold', target:5, rewardXp:250, rarity:'rare' },

    // === 趣味类 ===
    { id:'speed_demon', name:'快马加鞭', desc:'在30秒内连续答对10题', icon:'⚡', cat:'trial', type:'single_session', target:1, rewardXp:200, rarity:'rare' },
    { id:'night_owl',   name:'夜观天象', desc:'在深夜(22:00-05:00)修炼', icon:'🦉', cat:'secret', type:'single_session', target:1, rewardXp:50, rarity:'common' },
    { id:'comeback',    name:'卷土重来', desc:'答错后连续答对5题', icon:'🔄', cat:'quiz', type:'threshold', target:5, rewardXp:80, rarity:'common' },

    // === 隐藏/终极 ===
    { id:'all_achievements', name:'万法归宗', desc:'解锁所有其他成就', icon:'🌟', cat:'secret', type:'threshold', target:1, rewardXp:5000, rarity:'mythical', hidden:true }
  ];

  /* ── 试炼定义 ── */
  var TRIALS = {
    speed: {
      id: 'speed',
      name: '速算天机',
      icon: '⚡',
      desc: '在最短时间内回答10道基础题。速度与正确率并重！',
      questionCount: 10,
      timeLimit: 120, // 秒
      scoring: 'speed', // speed | survival | mixed
      medals: { bronze: 50, silver: 75, gold: 90 }
    },
    survival: {
      id: 'survival',
      name: '心魔试炼',
      icon: '💀',
      desc: '连续挑战高难度题目，一题答错即告失败。考验真功夫！',
      questionCount: 10,
      timeLimit: 0, // 无时间限制
      scoring: 'survival',
      medals: { bronze: 3, silver: 5, gold: 8 }
    },
    mixed: {
      id: 'mixed',
      name: '周天循环',
      icon: '🌀',
      desc: '15道随机题目横跨三大玄学体系，测试你的广博学识。',
      questionCount: 15,
      timeLimit: 0,
      scoring: 'mixed',
      medals: { bronze: 40, silver: 65, gold: 85 }
    }
  };

  /* ── NPC 天榜对手 ── */
  var NPC_RIVALS = [
    { name: '青云子',   level: 50, title: '金丹真人',  xp: 8900,  icon: '🧙', specialty:'qmdj', quote:'奇门九宫，尽在我心' },
    { name: '碧落仙',   level: 35, title: '筑基修士',  xp: 5200,  icon: '🧝', specialty:'zwds', quote:'星曜流转，命理由我' },
    { name: '墨阳君',   level: 28, title: '真传弟子',  xp: 3100,  icon: '🧘', specialty:'mhyc', quote:'一花一世界，一卦一天机' },
    { name: '赤松子',   level: 22, title: '真传弟子',  xp: 2400,  icon: '🧙', specialty:'qmdj', quote:'遁甲藏形，鬼神莫测' },
    { name: '月华仙子', level: 18, title: '真传弟子',  xp: 1800,  icon: '🧝', specialty:'zwds', quote:'十二宫中，自有乾坤' },
    { name: '云游散人', level: 12, title: '内门弟子',  xp: 950,   icon: '🧘', specialty:'mhyc', quote:'触机而动，观物取象' },
    { name: '清虚道童', level: 7,  title: '入门弟子',  xp: 420,   icon: '👦', specialty:'all',  quote:'每日勤修，终成大道' }
  ];

  /* ── 学科内等级 ── */
  // 学科内独立等级（不受全局等级影响，仅基于该学科的 XP）
  function getSubjectLevel(subjectXp) {
    // 学科等级更易升级：每200XP一级
    return Math.floor(subjectXp / 200) + 1;
  }

  function getSubjectTitle(level) {
    if (level >= 20) return '宗师';
    if (level >= 15) return '大师';
    if (level >= 10) return '高手';
    if (level >= 6)  return '熟手';
    if (level >= 3)  return '学徒';
    return '入门';
  }

  /* ── 导出配置 ── */
  global.XUANMEN_CONFIG = {
    xpForLevel: xpForLevel,
    cumulativeXp: cumulativeXp,
    getTitle: getTitle,
    getLevelFromTotalXp: getLevelFromTotalXp,
    TITLES: TITLES,
    XP_REWARDS: XP_REWARDS,
    DAILY_TASKS: DAILY_TASKS,
    ACHIEVEMENTS: ACHIEVEMENTS,
    TRIALS: TRIALS,
    NPC_RIVALS: NPC_RIVALS,
    getSubjectLevel: getSubjectLevel,
    getSubjectTitle: getSubjectTitle
  };

})(window);
