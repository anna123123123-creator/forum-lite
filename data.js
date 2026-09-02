(function (global) {
  'use strict';
  var STORAGE_KEY = 'forum_lite_data_v1';

  function hoursAgo(h) {
    return new Date(Date.now() - h * 3600000).toISOString();
  }

  function seed() {
    var boards = [
      { id: 'bd1', name: '综合讨论', description: '什么都能聊，畅所欲言。', icon: '💬' },
      { id: 'bd2', name: '技术交流', description: '编程、开发、技术问题探讨。', icon: '💻' },
      { id: 'bd3', name: '生活闲聊', description: '分享日常生活中的点点滴滴。', icon: '☕' },
      { id: 'bd4', name: '公告', description: '论坛官方通知与公告。', icon: '📢' },
    ];

    var threads = [
      { id: 't1', boardId: 'bd4', title: '论坛使用规则与版规说明', authorName: '管理员', content: '欢迎来到本论坛，请遵守以下规则：\n1. 禁止发布广告和垃圾内容；\n2. 禁止人身攻击和恶意辱骂；\n3. 发帖前请检查是否已有相同主题；\n4. 违规内容将被版主删除或锁定。\n感谢配合，祝大家在这里玩得愉快！', createdAt: hoursAgo(400), isPinned: true, isLocked: true, viewCount: 512 },
      { id: 't2', boardId: 'bd4', title: '新版本上线公告：支持置顶与锁定功能', authorName: '管理员', content: '本次更新为版主后台新增了主题置顶和锁定功能，方便管理重要内容和归档旧帖，欢迎大家体验并反馈问题。', createdAt: hoursAgo(150), isPinned: true, isLocked: false, viewCount: 340 },
      { id: 't3', boardId: 'bd1', title: '大家平时都用什么笔记软件？', authorName: '阿伟', content: '最近在纠结用 Notion 还是 Obsidian，有没有用过的朋友分享一下体验？主要用来记工作笔记和读书笔记。', createdAt: hoursAgo(72), isPinned: false, isLocked: false, viewCount: 88 },
      { id: 't4', boardId: 'bd1', title: '周末去哪玩比较好，求推荐', authorName: '小美', content: '天气越来越好了，周末想出去走走，有什么适合两天一夜的地方推荐吗？预算不用太高。', createdAt: hoursAgo(50), isPinned: false, isLocked: false, viewCount: 63 },
      { id: 't5', boardId: 'bd2', title: 'JavaScript 异步编程有哪些坑？', authorName: 'devZhang', content: '写了几年 JS 感觉 Promise 和 async/await 混用的时候特别容易出 bug，大家有什么心得或者踩过的坑可以分享一下吗？', createdAt: hoursAgo(96), isPinned: true, isLocked: false, viewCount: 210 },
      { id: 't6', boardId: 'bd2', title: '求推荐一款轻量的代码编辑器', authorName: '小林', content: 'VSCode 用久了感觉有点重，想找个轻量一点、启动快一点的，Sublime 现在怎么样了？', createdAt: hoursAgo(30), isPinned: false, isLocked: false, viewCount: 45 },
      { id: 't7', boardId: 'bd2', title: '【已归档】旧版 API 文档讨论', authorName: 'devZhang', content: '这个帖子讨论的是旧版本 API，内容已经过时，仅作存档保留，不再接受新回复，有问题请在新帖中提出。', createdAt: hoursAgo(600), isPinned: false, isLocked: true, viewCount: 120 },
      { id: 't8', boardId: 'bd3', title: '分享一下今天做的晚餐', authorName: '吃货小陈', content: '今天试着做了红烧肉，虽然卖相一般但是味道还不错，第一次做居然成功了，太开心了。', createdAt: hoursAgo(20), isPinned: false, isLocked: false, viewCount: 37 },
      { id: 't9', boardId: 'bd3', title: '养猫的朋友进来聊聊', authorName: '猫奴一号', content: '家里两只猫最近老是打架，一言不合就上爪子，有经验的铲屎官支个招吧，快被折腾崩溃了。', createdAt: hoursAgo(10), isPinned: false, isLocked: false, viewCount: 29 },
      { id: 't10', boardId: 'bd1', title: '新人报道，请多关照', authorName: '路过的小王', content: '刚注册的新用户，先来打个招呼，看大家聊得挺热闹的，请多多关照！', createdAt: hoursAgo(5), isPinned: false, isLocked: false, viewCount: 12 },
    ];

    var replies = [
      { id: 'r1', threadId: 't3', authorName: '小美', content: 'Obsidian 本地存储更放心，我用了半年了，感觉还不错。', createdAt: hoursAgo(70) },
      { id: 'r2', threadId: 't3', authorName: 'devZhang', content: 'Notion 协作方便一些，主要看你是自己用还是团队用。', createdAt: hoursAgo(68) },
      { id: 'r3', threadId: 't3', authorName: '阿伟', content: '谢谢两位，我再对比一下看看，感觉都不错。', createdAt: hoursAgo(60) },
      { id: 'r4', threadId: 't4', authorName: '路过的小王', content: '推荐去周边的古镇转转，人不多风景也不错，性价比很高。', createdAt: hoursAgo(45) },
      { id: 'r5', threadId: 't4', authorName: '吃货小陈', content: '附议，还可以顺便尝尝当地小吃，一举两得。', createdAt: hoursAgo(40) },
      { id: 'r6', threadId: 't5', authorName: '小林', content: '我踩过最大的坑就是忘记 await 导致的执行顺序问题，调了好久。', createdAt: hoursAgo(90) },
      { id: 'r7', threadId: 't5', authorName: '猫奴一号', content: '路过打卡，虽然看不太懂但是学到了。', createdAt: hoursAgo(80) },
      { id: 'r8', threadId: 't5', authorName: 'devZhang', content: '还有 Promise.all 里只要有一个 reject 就整体失败的问题，也很容易被忽略。', createdAt: hoursAgo(75) },
      { id: 'r9', threadId: 't6', authorName: '阿伟', content: 'Sublime 确实轻快，但插件生态没有 VSCode 丰富。', createdAt: hoursAgo(28) },
      { id: 'r10', threadId: 't6', authorName: '小美', content: '可以试试 Zed，最近挺多人推荐的，速度很快。', createdAt: hoursAgo(25) },
      { id: 'r11', threadId: 't8', authorName: '猫奴一号', content: '看着就很好吃，求详细教程！', createdAt: hoursAgo(18) },
      { id: 'r12', threadId: 't8', authorName: '小林', content: '红烧肉算硬菜了，第一次就成功很厉害。', createdAt: hoursAgo(15) },
      { id: 'r13', threadId: 't9', authorName: '吃货小陈', content: '多准备几个猫窝分散在不同房间试试，能缓解一些。', createdAt: hoursAgo(9) },
      { id: 'r14', threadId: 't9', authorName: '路过的小王', content: '可能是在争地盘，建议先隔离几天再慢慢重新介绍认识。', createdAt: hoursAgo(8) },
      { id: 'r15', threadId: 't2', authorName: '阿伟', content: '置顶功能太实用了，管理重要公告方便多了，点赞！', createdAt: hoursAgo(100) },
    ];

    return { boards: boards, threads: threads, replies: replies };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var s = seed();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        return s;
      }
      return JSON.parse(raw);
    } catch (e) {
      return seed();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function timeAgo(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) diff = 0;
    var min = Math.floor(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return min + ' 分钟前';
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' 小时前';
    var day = Math.floor(hr / 24);
    if (day < 30) return day + ' 天前';
    var month = Math.floor(day / 30);
    if (month < 12) return month + ' 个月前';
    return Math.floor(month / 12) + ' 年前';
  }

  global.ForumData = {
    load: load,
    save: save,
    uid: uid,
    timeAgo: timeAgo,
    reset: function () { var s = seed(); save(s); return s; },
  };
})(window);
