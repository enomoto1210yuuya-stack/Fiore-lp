// 株式会社Fiore コーポレートサイト
'use strict';

// ヒーローの登場アニメーション（1回だけ）
window.addEventListener('load', () => document.body.classList.add('is-loaded'));

// トップへ戻るボタンの表示
const toTop = document.getElementById('toTop');
const onScroll = () => { if (toTop) toTop.classList.toggle('is-show', window.scrollY > 600); };
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// モバイルメニュー
const menuBtn = document.getElementById('menuBtn');
const mnav = document.getElementById('mnav');
if (menuBtn && mnav) {
  const setMenu = (open) => {
    mnav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  menuBtn.addEventListener('click', () => setMenu(!mnav.classList.contains('is-open')));
  mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
}

// スクロール登場アニメーション ＋ 数字カウントアップ
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  const supportsIO = 'IntersectionObserver' in window;

  // カード群を順番に遅延（スタッガー）
  reveals.forEach((el) => {
    const sibs = Array.prototype.filter.call(el.parentElement.children, (c) => c.classList.contains('reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = (i * 90) + 'ms';
  });

  // 数字カウントアップ（[data-count]）
  const runCount = (el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduce) { el.textContent = String(target); return; }
    const dur = 1100; const start = performance.now();
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - start) / dur));
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const show = (el) => {
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(runCount);
  };

  if (reduce || !supportsIO) {
    reveals.forEach(show);
    document.querySelectorAll('[data-count]').forEach(runCount);
    return;
  }

  // アニメ再生前に数字を0にしておく（登場時に0→目標へ。最終値の一瞬のチラつき防止）
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = '0'; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  reveals.forEach((el) => io.observe(el));

  // 安全網：高速スクロールやアンカー移動でも、画面内に入った要素は必ず表示する
  const safety = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
      // ビューポート下端(92%)より上に来た要素は必ず表示（飛ばした区間も確実に出す）
      if (el.getBoundingClientRect().top < vh * 0.92) { show(el); io.unobserve(el); }
    });
  };
  window.addEventListener('scroll', safety, { passive: true });
  window.addEventListener('resize', safety, { passive: true });
  window.addEventListener('load', safety);
  safety();
})();
