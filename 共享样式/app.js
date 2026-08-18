/*══════════════════════════════════════════════════════════
  玄门学习平台 · 共享交互脚本
  覆盖：进度条 · 回到顶部 · 侧边栏 · Hash路由 · 复制 · 键盘
  ══════════════════════════════════════════════════════════*/
(function() {
  'use strict';

  // 安全解析 localStorage 进度数据：损坏时返回空对象，避免 JSON.parse 抛异常中断调用链
  function safeParse(raw) {
    try { return JSON.parse(raw || '{}'); } catch (e) { return {}; }
  }

  /* ── 进度条 + 回到顶部 ── */
  var bar = document.getElementById('pageProgress') || document.getElementById('progress');
  var topBtn = document.getElementById('backTop');

  function onScroll() {
    if (bar) {
      var h = document.documentElement;
      var denom = h.scrollHeight - h.clientHeight;
      var pct = denom > 0 ? Math.round(h.scrollTop / denom * 100) : 0;
      bar.style.width = pct + '%';
    }
    if (topBtn) topBtn.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初始调用

  /* ── 回到顶部点击 ── */
  if (topBtn) {
    topBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 侧边栏 (移动端) ── */
  window.toggleSidebar = function() {
    var sb = document.getElementById('sidebar');
    var ov = document.querySelector('.sidebar-overlay');
    if (!sb) return;
    var open = sb.classList.contains('open');
    sb.classList.toggle('open', !open);
    if (ov) ov.classList.toggle('show', !open);
    document.body.style.overflow = open ? '' : 'hidden';
  };

  window.closeSidebar = function() {
    var sb = document.getElementById('sidebar');
    var ov = document.querySelector('.sidebar-overlay');
    if (sb) sb.classList.remove('open');
    if (ov) ov.classList.remove('show');
    document.body.style.overflow = '';
  };

  // 侧边栏遮罩点击关闭
  var overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.addEventListener('click', window.closeSidebar);

  /* ── 侧边栏当前章节高亮 ── */
  var sideLinks = document.querySelectorAll('.sidebar-nav a[href*="#"]');
  if (sideLinks.length) {
    var secs = document.querySelectorAll('[id]');
    window.addEventListener('scroll', function() {
      var cur = '';
      secs.forEach(function(s) {
        if (s.getBoundingClientRect().top < 100) cur = s.id;
      });
      sideLinks.forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    }, { passive: true });
  }

  /* ── Hash 路由恢复 ── */
  function restoreFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (!hash) return;
    // 尝试顶部导航面板
    var panel = document.getElementById('p-' + hash);
    if (panel && typeof window.activatePanel === 'function') {
      window.activatePanel(hash);
      return;
    }
    // 尝试内容页
    var page = document.getElementById('page-' + hash);
    if (page && typeof window.showPage === 'function') {
      window.showPage(hash);
      return;
    }
    // 尝试滚动到锚点
    var anchor = document.getElementById(hash);
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
  }
  window.addEventListener('hashchange', restoreFromHash);
  if (window.location.hash) restoreFromHash();

  /* ── 复制按钮 ── */
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetId = this.dataset.target || this.getAttribute('onclick');
      var text = '';
      // 尝试 data-target 属性
      if (this.dataset.target) {
        var el = document.getElementById(this.dataset.target);
        if (el) text = el.textContent;
      }
      if (!text) {
        // 回退：找最近的 pre
        var pre = this.closest('.prompt-block')?.querySelector('pre');
        if (pre) text = pre.textContent;
      }
      if (!text) return;

      function markCopied() {
        btn.classList.add('done');
        btn.textContent = '✓ 已复制';
        setTimeout(function() {
          btn.classList.remove('done');
          btn.textContent = '📋 复制';
        }, 2000);
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        markCopied();
      }
      // 先判断 Clipboard API 是否存在（非安全上下文下 navigator.clipboard 为 undefined）
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(markCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  });

  /* ── 键盘：Escape 关闭侧边栏 ── */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var sb = document.getElementById('sidebar');
      if (sb && sb.classList.contains('open')) window.closeSidebar();
    }
  });

  /* ── 移动端：侧边栏滑动手势 ── */
  var touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    // 从左边缘向右滑动 → 打开侧边栏
    if (dx > 60 && Math.abs(dx) > Math.abs(dy) && touchStartX < 30) {
      var sb = document.getElementById('sidebar');
      if (sb && window.innerWidth <= 860) {
        sb.classList.add('open');
        var ov = document.querySelector('.sidebar-overlay');
        if (ov) ov.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }
    // 在侧边栏上向左滑动 → 关闭
    if (dx < -40 && Math.abs(dx) > Math.abs(dy)) {
      window.closeSidebar();
    }
  });

  /* ── 移动端：增大触控反馈 ── */
  document.addEventListener('touchstart', function(e) {
    var t = e.target;
    if (t.closest('.btn,.nav-card,.hub-card,.dash-card,.flash,.match-item,.seq-item,.sidebar-nav a')) {
      t.style.WebkitTapHighlightColor = 'rgba(212,176,106,.15)';
    }
  }, { passive: true });

  /* ── 窗口大小变化时关闭侧边栏 ── */
  var lastWidth = window.innerWidth;
  window.addEventListener('resize', function() {
    if (window.innerWidth > 860 && lastWidth <= 860) {
      window.closeSidebar(); // 从手机切换到桌面时确保侧边栏状态正常
    }
    lastWidth = window.innerWidth;
  });

  /* ── 移动端左侧导航 ── */
  window.toggleMobileNav = function() {
    var nav = document.getElementById('mobileNav');
    var ov = document.getElementById('navOverlay');
    if (!nav) return;
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    if (ov) ov.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  window.closeMobileNav = function() {
    var nav = document.getElementById('mobileNav');
    var ov = document.getElementById('navOverlay');
    if (nav) nav.classList.remove('open');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ── 闪卡翻转 ── */
  document.addEventListener('click', function(e) {
    var card = e.target.closest('.flash-card');
    if (card) card.classList.toggle('flipped');
  });

  /* ── API 辅助 ── */
  window.api = {
    base: 'http://localhost:3456',
    async call(method, path, body) {
      try {
        var opts = { method: method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
        if (body) opts.body = JSON.stringify(body);
        var res = await fetch(this.base + path, opts);
        return await res.json();
      } catch (e) {
        console.log('API离线，使用本地存储');
        return null;
      }
    },
    async saveProgress(system, page, completed, score) {
      // 始终存 localStorage
      var key = 'xm_progress_' + system;
      var data = safeParse(localStorage.getItem(key));
      data[page] = { completed: completed, score: score, ts: Date.now() };
      localStorage.setItem(key, JSON.stringify(data));
      // 尝试同步到后端
      return this.call('PUT', '/api/progress/' + system + '/' + page, { completed: completed, score: score });
    },
    async loadProgress(system) {
      var key = 'xm_progress_' + system;
      return safeParse(localStorage.getItem(key));
    }
  };

  /* ── 进度仪表盘更新 ── */
  window.updateDashboard = function(system) {
    var key = 'xm_progress_' + system;
    var data = safeParse(localStorage.getItem(key));
    var pages = ['01','02','03','04','05','06','quiz'];
    var done = pages.filter(function(p) { return data[p] && data[p].completed; });
    var el = document.getElementById('dashDone');
    if (el) el.textContent = done.length + '/' + pages.length;
    var pct = Math.round(done.length / pages.length * 100);
    var fill = document.getElementById('dashFill');
    if (fill) fill.style.width = pct + '%';
    var pctEl = document.getElementById('dashPct');
    if (pctEl) pctEl.textContent = pct + '%';
  };

  /* ── 暴露全局 ── */
  window._xuanmen = {
    scrollTo: function(el) { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    getProgressBar: function() { return bar; },
    getBackTop: function() { return topBtn; }
  };

})();
