/* ====== CONFIGURAÇÃO ====== */
const WHATSAPP = "5551999999999"; // ← TROQUE pelo número real (DDI + DDD + número)
const DEFAULT_MSG = "Olá! Vim pelo site e preciso de uma peça.";

/* WhatsApp links */
document.querySelectorAll("[data-wa]").forEach(a => {
  const msg = a.getAttribute("data-wa") || DEFAULT_MSG;
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  a.target = "_blank";
  a.rel = "noopener";
});

document.getElementById("year").textContent = new Date().getFullYear();

/* Text reveal: divide em palavras */
document.querySelectorAll("[data-split]").forEach(el => {
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) { frag.append(part); return; }
          const w = document.createElement("span");
          w.className = "w";
          w.innerHTML = `<span style="--i:${i++}">${part}</span>`;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") {
        walk(n);
      }
    });
  };
  walk(el);
});

/* Observer: reveals */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  });
}, { threshold: .15, rootMargin: "0px 0px -6% 0px" });

document.querySelectorAll(".reveal,.mask-reveal,[data-split]").forEach(el => io.observe(el));

/* Header + dock */
const header = document.getElementById("header");
const dock = document.getElementById("dock");
const hero = document.querySelector(".hero");

/* Parallax sutil */
const pxEls = [...document.querySelectorAll("[data-parallax]")];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("is-stuck", y > 40);
  dock.classList.toggle("is-show", y > hero.offsetHeight * 0.6);

  if (!reduce) {
    const vh = window.innerHeight;
    pxEls.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const center = r.top + r.height / 2 - vh / 2;
      img.style.setProperty("--py", `${center * -parseFloat(img.dataset.parallax)}px`);
    });
  }
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

/* Menu mobile */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const toggleMenu = (open) => {
  burger.setAttribute("aria-expanded", open);
  nav.classList.toggle("is-open", open);
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => toggleMenu(burger.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));

/* Botão magnético (só desktop com mouse) */
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
  document.querySelectorAll(".magnetic").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .18;
      const y = (e.clientY - r.top - r.height / 2) * .25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("mouseleave", () => btn.style.transform = "");
  });
}

/* FAQ: fecha os outros ao abrir um */
document.querySelectorAll(".faq details").forEach(d => {
  d.addEventListener("toggle", () => {
    if (d.open) document.querySelectorAll(".faq details").forEach(o => { if (o !== d) o.open = false; });
  });
});

/* Botão voltar ao topo */
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('is-show', window.scrollY > 400);
}, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Grid canvas animado */
(function(){
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  const GAP = 64;
  const STEP_MS = 120;
  const LINE_COLOR = 'rgba(255,255,255,0.07)';

  function resize(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); restart(); });

  let hLines = [], vLines = [], seq = [], idx = 0, timer = null;

  function buildSequence(){
    const W = canvas.width, H = canvas.height;
    hLines = [];
    vLines = [];
    for(let y = GAP; y < H; y += GAP) hLines.push(y);
    for(let x = GAP; x < W; x += GAP) vLines.push(x);

    seq = [];
    const max = Math.max(hLines.length, vLines.length);
    for(let i = 0; i < max; i++){
      if(i < hLines.length) seq.push({type:'h', val:hLines[i]});
      if(i < vLines.length) seq.push({type:'v', val:vLines[i]});
    }
  }

  function drawAll(upTo){
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;
    for(let i = 0; i < upTo; i++){
      const l = seq[i];
      ctx.beginPath();
      if(l.type === 'h'){ ctx.moveTo(0, l.val); ctx.lineTo(W, l.val); }
      else             { ctx.moveTo(l.val, 0); ctx.lineTo(l.val, H); }
      ctx.stroke();
    }
  }

  function restart(){
    clearInterval(timer);
    buildSequence();
    idx = 0;
    timer = setInterval(() => {
      idx++;
      drawAll(idx);
      if(idx >= seq.length) { idx = 0; ctx.clearRect(0,0,canvas.width,canvas.height); }
    }, STEP_MS);
  }

  restart();
})();
(function(){
  const track = document.querySelector(".carousel__track");
  const slides = document.querySelectorAll(".carousel__slide");
  const dotsWrap = document.querySelector(".carousel__dots");
  let cur = 0;

  slides.forEach((_,i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Slide ${i+1}`);
    if(i===0) b.classList.add("is-active");
    b.addEventListener("click", () => go(i));
    dotsWrap.append(b);
  });

  function go(n){
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dotsWrap.querySelectorAll("button").forEach((b,i) => b.classList.toggle("is-active", i===cur));
  }

  document.querySelector(".carousel__btn--prev").addEventListener("click", () => go(cur - 1));
  document.querySelector(".carousel__btn--next").addEventListener("click", () => go(cur + 1));

  setInterval(() => go(cur + 1), 4000);
})();