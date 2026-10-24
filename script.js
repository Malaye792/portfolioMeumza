(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Année du pied de page
  $('#year').textContent = new Date().getFullYear();

  var root = document.documentElement;

  /* ---------- Intro : rideau, puis décodage du titre de poste ---------- */
  var loader = $('#loader');
  var introStarted = false;

  function scramble(el) {
    var finalText = el.textContent;
    var pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_';
    var frame = 0, total = 38;
    var iv = setInterval(function () {
      frame++;
      var out = '';
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText.charAt(i);
        if (ch === ' ') { out += ' '; continue; }
        out += i < finalText.length * (frame / total) ? ch : pool.charAt((Math.random() * pool.length) | 0);
      }
      el.textContent = out;
      if (frame >= total) { clearInterval(iv); el.textContent = finalText; }
    }, 34);
  }

  function startIntro() {
    if (introStarted) return;
    introStarted = true;
    root.classList.add('ready');
    if (loader) {
      loader.classList.add('done');
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 1300);
    }
    var role = $('#role');
    if (role && !reduce) setTimeout(function () { scramble(role); }, 650);
  }

  if (reduce) {
    if (loader) loader.parentNode.removeChild(loader);
    root.classList.add('ready');
  } else if (document.readyState === 'complete') {
    setTimeout(startIntro, 1250);
  } else {
    window.addEventListener('load', function () { setTimeout(startIntro, 1250); });
  }

  /* ---------- Bandeau : accélère avec le défilement ---------- */
  var marqAnim = null, marqRate = 1;
  function boostMarquee(v) {
    if (!marqAnim) {
      var t = $('.track');
      var list = t && t.getAnimations ? t.getAnimations() : [];
      marqAnim = list[0] || null;
    }
    if (marqAnim) marqRate = Math.max(marqRate, 1 + Math.min(Math.abs(v) * 0.16, 9));
  }
  (function decay() {
    if (marqAnim) { marqRate += (1 - marqRate) * 0.06; marqAnim.playbackRate = marqRate; }
    requestAnimationFrame(decay);
  })();

  /* ---------- En-tête : état, progression, menu mobile ---------- */
  var header = $('#header');
  var progress = $('#progress');
  var toggle = $('#nav-toggle');
  var timeline = $('#timeline');
  var ticking = false, lastY = 0, heroInner = $('.hero-inner');

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 24);
    var dy = y - lastY;
    if (!reduce) {
      if (dy > 4 && y > 500 && !header.classList.contains('open')) header.classList.add('hide');
      else if (dy < -4 || y <= 500) header.classList.remove('hide');
      if (Math.abs(dy) > 2) boostMarquee(dy);
      if (heroInner && y < window.innerHeight * 1.3) {
        heroInner.style.transform = 'translate3d(0,' + (y * 0.2).toFixed(1) + 'px,0)';
        heroInner.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.85)).toFixed(3);
      }
    }
    lastY = y;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';

    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.62 - r.top) / r.height;
      timeline.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      $$('li', timeline).forEach(function (li) {
        li.classList.toggle('on', li.getBoundingClientRect().top < window.innerHeight * 0.66);
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Lien actif dans la navigation ---------- */
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('#nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('#nav a.active').forEach(function (a) { a.classList.remove('active'); });
        var id = e.target.id === 'realisations' ? 'plateformes' : e.target.id;
        if (links[id]) links[id].classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Apparition au défilement ---------- */
  // Titres découpés mot par mot
  $$('[data-split]').forEach(function (h) {
    var label = h.textContent.trim();
    var words = label.split(/\s+/);
    h.setAttribute('aria-label', label);
    h.textContent = '';
    words.forEach(function (wd, i) {
      var sw = document.createElement('span');
      var inner = document.createElement('span');
      sw.className = 'sw';
      sw.setAttribute('aria-hidden', 'true');
      inner.style.setProperty('--k', i);
      inner.textContent = wd;
      sw.appendChild(inner);
      h.appendChild(sw);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  });
  var revealEls = $$('.reveal, [data-split]');
  // Décalage des puces de compétences
  $$('.chips').forEach(function (ul) {
    $$('li', ul).forEach(function (li, k) { li.style.setProperty('--k', k); });
  });
  // Décalage des attestations
  $$('.certs .reveal').forEach(function (el, i) { el.style.setProperty('--i', i); });
  $$('.skills .reveal').forEach(function (el, i) { el.style.setProperty('--i', i % 3); });

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Compteurs ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = target; return; }
    var start = performance.now();
    var dur = 1100;
    (function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    counters.forEach(function (c) { c.textContent = '0'; });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Bandeau de technologies (boucle continue) ---------- */
  var track = $('.track');
  if (track) {
    var clone = track.cloneNode(true);
    $$('li', clone).forEach(function (li) { track.appendChild(li); });
    $$('li', track).forEach(function (li, i, all) {
      if (i >= all.length / 2) li.setAttribute('aria-hidden', 'true');
    });
  }

  /* ---------- Réseau animé du hero ---------- */
  var canvas = $('#net');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1, nodes = [], packets = [];
    var mouse = { x: -9999, y: -9999 };
    var heroVisible = true, raf = 0, last = 0;
    var LINK = 150;
    var SIG = '77,168,255', EMB = '240,248,255';

    var resize = function () {
      var r = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.max(28, Math.min(74, (w * h) / 21000)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          r: 1.5 + Math.random() * 1.5, hub: Math.random() < 0.1
        });
      }
      packets = [];
    };

    var spawn = function () {
      if (packets.length > 14) return;
      for (var tries = 0; tries < 12; tries++) {
        var a = nodes[(Math.random() * nodes.length) | 0];
        var b = nodes[(Math.random() * nodes.length) | 0];
        if (a === b) continue;
        var dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy < LINK * LINK) {
          packets.push({ a: a, b: b, t: 0, s: 0.006 + Math.random() * 0.01, hot: a.hub || b.hub });
          return;
        }
      }
    };

    var frame = function (now) {
      raf = 0;
      if (!heroVisible) return;
      var dt = Math.min((now - last) / 16.67 || 1, 3);
      last = now;
      ctx.clearRect(0, 0, w, h);

      var i, j, a, b, dx, dy, d, alpha, m;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduce) {
          a.x += a.vx * dt; a.y += a.vy * dt;
          if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
          if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;
        }
      }

      // liens
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            alpha = (1 - Math.sqrt(d) / LINK) * 0.28;
            var mx = (a.x + b.x) / 2 - mouse.x, my = (a.y + b.y) / 2 - mouse.y;
            m = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 220);
            alpha += m * 0.4;
            ctx.strokeStyle = 'rgba(' + SIG + ',' + alpha.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // sonde souris
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        dx = a.x - mouse.x; dy = a.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170) {
          ctx.strokeStyle = 'rgba(' + SIG + ',' + ((1 - d / 170) * 0.55).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }

      // nœuds
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        dx = a.x - mouse.x; dy = a.y - mouse.y;
        m = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 170);
        if (a.hub) {
          ctx.strokeStyle = 'rgba(' + EMB + ',' + (0.55 + m * 0.4).toFixed(2) + ')';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(a.x, a.y, 5 + m * 2, 0, 6.2832); ctx.stroke();
          ctx.lineWidth = 1;
          ctx.fillStyle = 'rgba(' + EMB + ',0.95)';
          ctx.beginPath(); ctx.arc(a.x, a.y, 2.2, 0, 6.2832); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(' + SIG + ',' + (0.55 + m * 0.45).toFixed(2) + ')';
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r + m * 1.6, 0, 6.2832); ctx.fill();
        }
      }

      // paquets
      if (!reduce && Math.random() < 0.07) spawn();
      for (i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        p.t += p.s * dt;
        dx = p.a.x - p.b.x; dy = p.a.y - p.b.y;
        if (p.t >= 1 || dx * dx + dy * dy > LINK * LINK * 1.5) { packets.splice(i, 1); continue; }
        var px = p.a.x + (p.b.x - p.a.x) * p.t;
        var py = p.a.y + (p.b.y - p.a.y) * p.t;
        var col = p.hot ? EMB : SIG;
        var g = ctx.createRadialGradient(px, py, 0, px, py, 12);
        g.addColorStop(0, 'rgba(' + col + ',0.95)');
        g.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 12, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 6.2832); ctx.fill();
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    var start = function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    resize();
    start();
    window.addEventListener('resize', function () { resize(); start(); });

    var hero = canvas.parentElement;
    hero.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) start();
      }).observe(hero);
    }
  }

  /* ---------- Panneau de supervision (aperçu illustratif animé) ---------- */
  var rows = $$('[data-spark]');
  if (rows.length) {
    var N = 24;
    var series = rows.map(function () {
      var v = 0.3 + Math.random() * 0.4, arr = [];
      for (var i = 0; i < N; i++) {
        v = Math.max(0.1, Math.min(0.92, v + (Math.random() - 0.5) * 0.28));
        arr.push(v);
      }
      return arr;
    });
    var drawSpark = function () {
      rows.forEach(function (row, k) {
        var pts = series[k].map(function (v, i) {
          return (i * 120 / (N - 1)).toFixed(1) + ',' + (26 - v * 24).toFixed(1);
        });
        $('polyline', row).setAttribute('points', pts.join(' '));
        var c = $('circle', row);
        c.setAttribute('cx', 120);
        c.setAttribute('cy', (26 - series[k][N - 1] * 24).toFixed(1));
      });
    };
    drawSpark();
    if (!reduce) {
      setInterval(function () {
        if (document.hidden) return;
        series.forEach(function (arr) {
          var v = arr[arr.length - 1] + (Math.random() - 0.5) * 0.3;
          arr.push(Math.max(0.1, Math.min(0.92, v)));
          arr.shift();
        });
        drawSpark();
      }, 1100);
    }
  }

  /* ---------- Boutons magnétiques ---------- */
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });

    /* Inclinaison du cadre navigateur */
    var frameEl = $('#frame');
    if (frameEl) {
      frameEl.addEventListener('pointermove', function (e) {
        var r = frameEl.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        frameEl.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        frameEl.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
      });
      frameEl.addEventListener('pointerleave', function () {
        frameEl.style.setProperty('--rx', '0deg');
        frameEl.style.setProperty('--ry', '0deg');
      });
    }
  }

  /* ---------- Hero : lueur et inclinaison du panneau ---------- */
  var heroEl = $('.hero');
  var tiltEl = $('#tilt');
  if (heroEl && finePointer && !reduce) {
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      heroEl.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (tiltEl) {
        var t = tiltEl.getBoundingClientRect();
        var px = (e.clientX - (t.left + t.width / 2)) / window.innerWidth;
        var py = (e.clientY - (t.top + t.height / 2)) / window.innerHeight;
        tiltEl.style.setProperty('--try', (px * 14).toFixed(2) + 'deg');
        tiltEl.style.setProperty('--trx', (-py * 14).toFixed(2) + 'deg');
      }
    });
    heroEl.addEventListener('pointerleave', function () {
      if (tiltEl) { tiltEl.style.setProperty('--try', '0deg'); tiltEl.style.setProperty('--trx', '0deg'); }
    });
  }

  /* ---------- Lueur qui suit la souris sur les blocs ---------- */
  if (finePointer && !reduce) {
    $$('.major, .stats > div, .contact-form').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Ondulation sur les boutons ---------- */
  if (!reduce) {
    $$('.btn').forEach(function (b) {
      b.addEventListener('pointerdown', function (e) {
        var r = b.getBoundingClientRect();
        var d = Math.max(r.width, r.height) * 2;
        var s = document.createElement('span');
        s.className = 'ripple';
        s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
        b.appendChild(s);
        setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 800);
      });
    });
  }

  /* ---------- Agrandissement des attestations ---------- */
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');
  if (lb && typeof lb.showModal === 'function') {
    $$('.cert-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = $('img', btn);
        lbImg.src = btn.getAttribute('data-full');
        lbImg.alt = img ? img.alt : '';
        lb.showModal();
      });
    });
    $('#lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  } else {
    $$('.cert-btn').forEach(function (btn) { btn.style.cursor = 'default'; });
  }

  /* ---------- Formulaire : ouvre la messagerie avec le message pré-rempli ---------- */
  $('#contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(this);
    var name = data.get('name');
    var email = data.get('email');
    var message = data.get('message');

    var subject = 'Message depuis votre portfolio — ' + name;
    var body = message + '\n\n' + name + '\n' + email;

    var btn = $('#send-btn');
    btn.textContent = 'Ouverture de la messagerie…';
    setTimeout(function () { btn.textContent = 'Envoyer par email'; }, 3000);

    window.location.href =
      'mailto:malaye250@gmail.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
})();