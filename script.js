(function () {
  'use strict';

  var data = ForumData.load();
  var currentBoardId = null;
  var currentThreadId = null;

  var views = document.querySelectorAll('.view');
  function showView(name) {
    views.forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var boardGrid = document.getElementById('boardGrid');

  var boardTitle = document.getElementById('boardTitle');
  var boardDesc = document.getElementById('boardDesc');
  var threadList = document.getElementById('threadList');
  var newThreadMsg = document.getElementById('newThreadMsg');
  var threadForm = document.getElementById('threadForm');
  var threadAuthorInput = document.getElementById('threadAuthorInput');
  var threadTitleInput = document.getElementById('threadTitleInput');
  var threadContentInput = document.getElementById('threadContentInput');

  var threadDetail = document.getElementById('threadDetail');
  var replyCountLabel = document.getElementById('replyCountLabel');
  var replyList = document.getElementById('replyList');
  var replyBox = document.getElementById('replyBox');
  var backToBoardLink = document.getElementById('backToBoardLink');

  // ---------- helpers ----------
  function threadsForBoard(boardId) {
    return data.threads.filter(function (t) { return t.boardId === boardId; });
  }
  function repliesForThread(threadId) {
    return data.replies.filter(function (r) { return r.threadId === threadId; });
  }
  function sortThreads(list) {
    return list.slice().sort(function (a, b) {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  // ---------- home ----------
  function renderHome() {
    boardGrid.innerHTML = data.boards.map(function (b) {
      var count = threadsForBoard(b.id).length;
      return '<div class="board-card" data-id="' + b.id + '">' +
        '<div class="board-card__icon">' + b.icon + '</div>' +
        '<div class="board-card__body">' +
        '<h3>' + escapeHtml(b.name) + '</h3>' +
        '<p>' + escapeHtml(b.description) + '</p>' +
        '<div class="board-card__count">' + count + ' 个主题</div>' +
        '</div></div>';
    }).join('') || '<div class="empty-hint">暂时还没有版块。</div>';

    boardGrid.querySelectorAll('.board-card').forEach(function (card) {
      card.addEventListener('click', function () {
        location.hash = '#/board/' + card.dataset.id;
      });
    });
    showView('home');
  }

  // ---------- board ----------
  function renderBoardList(boardId) {
    var board = data.boards.find(function (b) { return b.id === boardId; });
    if (!board) { location.hash = '#/'; return; }
    boardTitle.textContent = board.icon + ' ' + board.name;
    boardDesc.textContent = board.description;

    var list = sortThreads(threadsForBoard(boardId));
    threadList.innerHTML = list.map(function (t) {
      var replyCount = repliesForThread(t.id).length;
      var badges = '';
      if (t.isPinned) badges += '<span class="badge pinned">置顶</span> ';
      if (t.isLocked) badges += '<span class="badge locked">已锁定</span> ';
      return '<div class="thread-row' + (t.isPinned ? ' pinned' : '') + '" data-id="' + t.id + '">' +
        '<div class="thread-row__main">' +
        '<div class="thread-row__title">' + badges + escapeHtml(t.title) + '</div>' +
        '<div class="thread-row__meta">' + escapeHtml(t.authorName) + ' · ' + ForumData.timeAgo(t.createdAt) + '</div>' +
        '</div>' +
        '<div class="thread-row__stats"><span>' + replyCount + ' 回复</span><span>' + t.viewCount + ' 浏览</span></div>' +
        '</div>';
    }).join('') || '<div class="empty-hint">这个版块还没有帖子，来发第一帖吧。</div>';

    threadList.querySelectorAll('.thread-row').forEach(function (row) {
      row.addEventListener('click', function () {
        location.hash = '#/thread/' + row.dataset.id;
      });
    });
    showView('board');
  }

  function enterBoard(boardId) {
    currentBoardId = boardId;
    newThreadMsg.innerHTML = '';
    threadForm.reset();
    renderBoardList(boardId);
  }

  threadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentBoardId) return;
    var author = threadAuthorInput.value.trim();
    var title = threadTitleInput.value.trim();
    var content = threadContentInput.value.trim();
    if (!author || !title || !content) {
      newThreadMsg.innerHTML = '<div class="msg error">请填写昵称、标题和内容后再发布。</div>';
      return;
    }
    var thread = {
      id: ForumData.uid('t'),
      boardId: currentBoardId,
      title: title,
      authorName: author,
      content: content,
      createdAt: new Date().toISOString(),
      isPinned: false,
      isLocked: false,
      viewCount: 0,
    };
    data.threads.push(thread);
    ForumData.save(data);
    newThreadMsg.innerHTML = '<div class="msg success">发布成功！</div>';
    threadForm.reset();
    renderBoardList(currentBoardId);
  });

  // ---------- thread detail ----------
  function renderThreadDetail(threadId) {
    var thread = data.threads.find(function (t) { return t.id === threadId; });
    if (!thread) { location.hash = '#/'; return; }
    currentThreadId = threadId;
    backToBoardLink.href = '#/board/' + thread.boardId;

    var badges = '';
    if (thread.isPinned) badges += '<span class="badge pinned">置顶</span> ';
    if (thread.isLocked) badges += '<span class="badge locked">已锁定</span> ';

    threadDetail.innerHTML =
      '<div class="thread-detail__badges">' + badges + '</div>' +
      '<h1>' + escapeHtml(thread.title) + '</h1>' +
      '<div class="thread-detail__meta">' + escapeHtml(thread.authorName) + ' · ' + ForumData.timeAgo(thread.createdAt) + ' · <span id="threadViewCount">' + thread.viewCount + '</span> 浏览</div>' +
      '<div class="thread-detail__content">' + escapeHtml(thread.content).replace(/\n/g, '<br>') + '</div>';

    var replies = repliesForThread(threadId).slice().sort(function (a, b) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    replyCountLabel.textContent = replies.length;
    replyList.innerHTML = replies.map(function (r) {
      return '<div class="reply-item">' +
        '<div class="reply-item__meta"><strong>' + escapeHtml(r.authorName) + '</strong> · ' + ForumData.timeAgo(r.createdAt) + '</div>' +
        '<div class="reply-item__content">' + escapeHtml(r.content).replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    }).join('') || '<div class="empty-hint">还没有人回复，来抢个沙发吧。</div>';

    renderReplyBox(thread);
    showView('thread');
  }

  function renderReplyBox(thread) {
    if (thread.isLocked) {
      replyBox.innerHTML = '<div class="locked-msg">该帖已被锁定，无法回复</div>';
      return;
    }
    replyBox.innerHTML =
      '<div class="post-box">' +
      '<h3>回复</h3>' +
      '<div id="replyMsg"></div>' +
      '<form id="replyForm" novalidate>' +
      '<div class="field"><label>昵称</label><input id="replyAuthorInput" type="text" required placeholder="你的显示名"></div>' +
      '<div class="field"><label>内容</label><textarea id="replyContentInput" rows="3" required placeholder="写下你的回复……"></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-block">发表回复</button>' +
      '</form>' +
      '</div>';

    var replyForm = document.getElementById('replyForm');
    var replyMsg = document.getElementById('replyMsg');
    var replyAuthorInput = document.getElementById('replyAuthorInput');
    var replyContentInput = document.getElementById('replyContentInput');

    replyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var author = replyAuthorInput.value.trim();
      var content = replyContentInput.value.trim();
      if (!author || !content) {
        replyMsg.innerHTML = '<div class="msg error">请填写昵称和回复内容。</div>';
        return;
      }
      var current = data.threads.find(function (t) { return t.id === thread.id; });
      if (!current || current.isLocked) {
        renderThreadDetail(thread.id);
        return;
      }
      data.replies.push({
        id: ForumData.uid('r'),
        threadId: thread.id,
        authorName: author,
        content: content,
        createdAt: new Date().toISOString(),
      });
      ForumData.save(data);
      renderThreadDetail(thread.id);
    });
  }

  function openThread(threadId) {
    var thread = data.threads.find(function (t) { return t.id === threadId; });
    if (!thread) { location.hash = '#/'; return; }
    thread.viewCount = (thread.viewCount || 0) + 1;
    ForumData.save(data);
    renderThreadDetail(threadId);
  }

  // ---------- router ----------
  function route() {
    var hash = location.hash || '#/';
    var threadMatch = hash.match(/^#\/thread\/(.+)$/);
    var boardMatch = hash.match(/^#\/board\/(.+)$/);
    if (threadMatch) {
      openThread(decodeURIComponent(threadMatch[1]));
    } else if (boardMatch) {
      enterBoard(decodeURIComponent(boardMatch[1]));
    } else {
      renderHome();
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
