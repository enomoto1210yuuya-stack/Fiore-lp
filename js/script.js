// 株式会社Fiore コーポレートサイト  ── 2026 Editorial Rose
'use strict';

// ヒーロー登場アニメ（1回だけ）
window.addEventListener('load', () => document.body.classList.add('is-loaded'));

// ヘッダーの縮み・スクロール進捗・トップへ戻る表示（1つのスクロールハンドラに集約）
const header = document.getElementById('header');
const toTop = document.getElementById('toTop');
const progress = document.getElementById('scrollProgress');
let ticking = false;

const onScrollFrame = () => {
  const y = window.scrollY || 0;
  const doc = document.documentElement;
  const max = (doc.scrollHeight - window.innerHeight) || 1;

  if (header) header.classList.toggle('is-stuck', y > 24);
  if (toTop) toTop.classList.toggle('is-show', y > 640);
  if (progress) progress.style.width = Math.min(100, (y / max) * 100) + '%';

  ticking = false;
};
const onScroll = () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
onScrollFrame();

if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// モバイルメニュー
const menuBtn = document.getElementById('menuBtn');
const mnav = document.getElementById('mnav');
if (menuBtn && mnav) {
  const setMenu = (open) => {
    mnav.classList.toggle('is-open', open);
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!mnav.classList.contains('is-open')));
  mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

// スクロール登場アニメ ＋ 数字カウントアップ
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  const supportsIO = 'IntersectionObserver' in window;

  // 同じ親内の .reveal は順番に遅延（スタッガー）
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
    const dur = 1200; const start = performance.now();
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

  // カウント対象は一旦0に（登場時に0→目標。最終値の一瞬のチラつき防止）
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = '0'; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach((el) => io.observe(el));

  // 数字カウントは [data-count] を直接監視（.reveal の外＝ヒーロー等でも発火させる）
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0 });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

  // 安全網：高速スクロール・アンカー移動でも画面内の要素は必ず表示
  const safety = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) { show(el); io.unobserve(el); }
    });
  };
  window.addEventListener('scroll', safety, { passive: true });
  window.addEventListener('resize', safety, { passive: true });
  window.addEventListener('load', safety);
  safety();
})();
