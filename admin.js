(function () {
  'use strict';

  var data = ForumData.load();

  var sideLinks = document.querySelectorAll('.side-link[data-view]');
  var views = document.querySelectorAll('.admin-view');

  function switchView(name) {
    sideLinks.forEach(function (l) { l.classList.toggle('active', l.dataset.view === name); });
    views.forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
    if (name === 'dashboard') renderDashboard();
    if (name === 'boards') renderBoards();
    if (name === 'threads') renderThreads();
  }

  sideLinks.forEach(function (l) {
    l.addEventListener('click', function () { switchView(l.dataset.view); });
  });

  document.getElementById('btnResetData').addEventListener('click', function () {
    if (!confirm('确定要重置成示例数据吗？这会清空你新增/修改的所有内容。')) return;
    data = ForumData.reset();
    switchView('dashboard');
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function boardName(id) {
    var b = data.boards.find(function (x) { return x.id === id; });
    return b ? b.icon + ' ' + b.name : '（已删除版块）';
  }

  function threadCountFor(boardId) {
    return data.threads.filter(function (t) { return t.boardId === boardId; }).length;
  }
  function replyCountFor(threadId) {
    return data.replies.filter(function (r) { return r.threadId === threadId; }).length;
  }

  // ---------- Dashboard ----------
  function renderDashboard() {
    var totalBoards = data.boards.length;
    var totalThreads = data.threads.length;
    var totalReplies = data.replies.length;

    var mostActiveLabel = '最活跃版块';
    var mostActiveValue = 0;
    if (data.boards.length) {
      var best = data.boards.reduce(function (acc, b) {
        var c = threadCountFor(b.id);
        return (c > acc.count) ? { board: b, count: c } : acc;
      }, { board: null, count: -1 });
      if (best.board) {
        mostActiveValue = best.count;
        mostActiveLabel = '最活跃版块：' + best.board.icon + ' ' + best.board.name;
      }
    }

    var stats = [
      { label: '版块总数', value: totalBoards },
      { label: '主题总数', value: totalThreads },
      { label: '回复总数', value: totalReplies },
      { label: mostActiveLabel, value: mostActiveValue },
    ];
    document.getElementById('statGrid').innerHTML = stats.map(function (s) {
      return '<div class="stat-card"><div class="num">' + s.value + '</div><div class="label">' + s.label + '</div></div>';
    }).join('');

    var recent = data.threads.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 5);
    document.getElementById('recentThreadsBody').innerHTML = recent.map(function (t) {
      return '<tr><td>' + escapeHtml(t.title) + '</td><td>' + boardName(t.boardId) + '</td><td>' + escapeHtml(t.authorName) + '</td><td>' + ForumData.timeAgo(t.createdAt) + '</td></tr>';
    }).join('') || '<tr><td colspan="4" style="color:var(--muted)">暂无主题</td></tr>';
  }

  // ---------- Boards ----------
  var boardModalBackdrop = document.getElementById('boardModalBackdrop');
  var boardModalTitle = document.getElementById('boardModalTitle');
  var boardModalMsg = document.getElementById('boardModalMsg');
  var boardForm = document.getElementById('boardForm');
  var boardIdInput = document.getElementById('boardIdInput');
  var boardIconInput = document.getElementById('boardIconInput');
  var boardNameInput = document.getElementById('boardNameInput');
  var boardDescInput = document.getElementById('boardDescInput');

  function renderBoards() {
    var boardsBody = document.getElementById('boardsBody');
    boardsBody.innerHTML = data.boards.map(function (b) {
      return '<tr><td style="font-size:18px">' + b.icon + '</td><td>' + escapeHtml(b.name) + '</td><td>' + escapeHtml(b.description) + '</td><td>' + threadCountFor(b.id) + '</td>' +
        '<td class="table-actions">' +
        '<button class="btn btn-sm" data-edit-board="' + b.id + '">编辑</button>' +
        '<button class="btn btn-sm btn-danger" data-delete-board="' + b.id + '">删除</button>' +
        '</td></tr>';
    }).join('') || '<tr><td colspan="5" style="color:var(--muted)">暂无版块</td></tr>';

    boardsBody.querySelectorAll('[data-edit-board]').forEach(function (btn) {
      btn.addEventListener('click', function () { openBoardModal(btn.dataset.editBoard); });
    });
    boardsBody.querySelectorAll('[data-delete-board]').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteBoard(btn.dataset.deleteBoard); });
    });
  }

  function openBoardModal(id) {
    boardModalMsg.innerHTML = '';
    boardForm.reset();
    if (id) {
      var b = data.boards.find(function (x) { return x.id === id; });
      boardModalTitle.textContent = '编辑版块';
      boardIdInput.value = b.id;
      boardIconInput.value = b.icon;
      boardNameInput.value = b.name;
      boardDescInput.value = b.description;
    } else {
      boardModalTitle.textContent = '新增版块';
      boardIdInput.value = '';
    }
    boardModalBackdrop.classList.add('show');
  }

  document.getElementById('btnAddBoard').addEventListener('click', function () { openBoardModal(null); });
  document.getElementById('btnCloseBoardModal').addEventListener('click', function () { boardModalBackdrop.classList.remove('show'); });
  boardModalBackdrop.addEventListener('click', function (e) { if (e.target === boardModalBackdrop) boardModalBackdrop.classList.remove('show'); });

  boardForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var icon = boardIconInput.value.trim();
    var name = boardNameInput.value.trim();
    var desc = boardDescInput.value.trim();
    if (!icon || !name || !desc) {
      boardModalMsg.innerHTML = '<div class="msg error">请完整填写图标、名称和简介。</div>';
      return;
    }
    var id = boardIdInput.value;
    if (id) {
      var b = data.boards.find(function (x) { return x.id === id; });
      b.icon = icon; b.name = name; b.description = desc;
    } else {
      data.boards.push({ id: ForumData.uid('bd'), icon: icon, name: name, description: desc });
    }
    ForumData.save(data);
    boardModalBackdrop.classList.remove('show');
    renderBoards();
  });

  function deleteBoard(id) {
    if (!confirm('确定删除这个版块吗？该版块下的所有主题和回复都会被一并删除。')) return;
    var threadIds = data.threads.filter(function (t) { return t.boardId === id; }).map(function (t) { return t.id; });
    data.replies = data.replies.filter(function (r) { return threadIds.indexOf(r.threadId) === -1; });
    data.threads = data.threads.filter(function (t) { return t.boardId !== id; });
    data.boards = data.boards.filter(function (b) { return b.id !== id; });
    ForumData.save(data);
    renderBoards();
  }

  // ---------- Threads ----------
  function renderThreads() {
    var threadsBody = document.getElementById('threadsBody');
    var list = data.threads.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    threadsBody.innerHTML = list.map(function (t) {
      var statusBadges = '';
      statusBadges += t.isPinned ? '<span class="badge pinned">置顶</span> ' : '';
      statusBadges += t.isLocked ? '<span class="badge locked">锁定</span>' : '';
      if (!statusBadges) statusBadges = '<span style="color:var(--muted);font-size:12px">-</span>';
      return '<tr><td>' + escapeHtml(t.title) + '</td><td>' + boardName(t.boardId) + '</td><td>' + escapeHtml(t.authorName) + '</td><td>' + replyCountFor(t.id) + '</td><td>' + t.viewCount + '</td>' +
        '<td>' + statusBadges + '</td>' +
        '<td class="table-actions">' +
        '<button class="btn btn-sm" data-pin="' + t.id + '">' + (t.isPinned ? '取消置顶' : '置顶') + '</button>' +
        '<button class="btn btn-sm" data-lock="' + t.id + '">' + (t.isLocked ? '解锁' : '锁定') + '</button>' +
        '<button class="btn btn-sm btn-danger" data-delete-thread="' + t.id + '">删除</button>' +
        '</td></tr>';
    }).join('') || '<tr><td colspan="7" style="color:var(--muted)">暂无主题</td></tr>';

    threadsBody.querySelectorAll('[data-pin]').forEach(function (btn) {
      btn.addEventListener('click', function () { togglePin(btn.dataset.pin); });
    });
    threadsBody.querySelectorAll('[data-lock]').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleLock(btn.dataset.lock); });
    });
    threadsBody.querySelectorAll('[data-delete-thread]').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteThread(btn.dataset.deleteThread); });
    });
  }

  function togglePin(id) {
    var t = data.threads.find(function (x) { return x.id === id; });
    if (!t) return;
    t.isPinned = !t.isPinned;
    ForumData.save(data);
    renderThreads();
  }

  function toggleLock(id) {
    var t = data.threads.find(function (x) { return x.id === id; });
    if (!t) return;
    t.isLocked = !t.isLocked;
    ForumData.save(data);
    renderThreads();
  }

  function deleteThread(id) {
    if (!confirm('确定删除这个主题吗？其下的所有回复也会被一并删除。')) return;
    data.replies = data.replies.filter(function (r) { return r.threadId !== id; });
    data.threads = data.threads.filter(function (t) { return t.id !== id; });
    ForumData.save(data);
    renderThreads();
  }

  switchView('dashboard');
})();
