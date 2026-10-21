/* Vive Voix — animations & effets (JS pur, sans bibliothèque, hébergé sur le site)
   Actif uniquement si <html class="fx"> (posé par le script d'en-tête, absent si « mouvement réduit »). */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('fx')) return;
  window.__fxReady = true;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var delay = function (el, v) { el.style.setProperty('--d', v); };

  /* ---------- 1. Préparation du hero ---------- */
  $$('.hero-h .l').forEach(function (l, i) {
    var s = document.createElement('span');
    s.className = 'li'; s.style.setProperty('--i', i);
    while (l.firstChild) s.appendChild(l.firstChild);
    l.appendChild(s);
  });
  $$('.hero-tag').forEach(function (e) { delay(e, 0); });
  $$('.hero-sub').forEach(function (e) { delay(e, .45); });
  $$('.say').forEach(function (e) { delay(e, .55); });
  $$('.hero-actions').forEach(function (e) { delay(e, .65); });
  $$('.hero-facts .m').forEach(function (e, i) { delay(e, .8 + i * .1); });

  /* mot qui tourne : machine à sous verticale */
  var rot = $('#rot');
  if (rot) {
    var words = ['parler', 'convaincre', "s'affirmer"];
    var slot = document.createElement('span'); slot.className = 'slot';
    var inner = document.createElement('span');
    words.concat(words[0]).forEach(function (w) {
      var b = document.createElement('b'); b.textContent = w; inner.appendChild(b);
    });
    slot.appendChild(inner);
    rot.parentNode.replaceChild(slot, rot);
    var wi = 0;
    setInterval(function () {
      wi++;
      inner.style.transition = 'transform .7s cubic-bezier(.77,0,.18,1)';
      inner.style.transform = 'translateY(-' + (wi * 1.7) + 'em)';
      if (wi === words.length) {
        setTimeout(function () { inner.style.transition = 'none'; inner.style.transform = 'translateY(0)'; wi = 0; }, 760);
      }
    }, 2400);
  }

  /* ---------- 2. Titres découpés mot à mot ---------- */
  var SPLIT = '.title,.page-hero h1,.intervenants-title,.foot-slogan,.invite h2,.essay h2,.tool-block h3,.pillar h3,.step h3,.idx-title,.term-body b';
  function split(el) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var sp = document.createElement('span'); sp.className = 'sp';
            var i = document.createElement('i'); i.textContent = p; i.style.setProperty('--w', n++);
            sp.appendChild(i); frag.appendChild(sp);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR' && c.tagName !== 'SUP') {
          walk(c);
        }
      });
    })(el);
    el.classList.add('split');
  }
  var splits = $$(SPLIT);
  splits.forEach(split);

  /* ---------- 3. Éléments qui apparaissent (décalés) ---------- */
  var FXR = '.lead-2,.sec-head > p,.sec-head .eyebrow,.statement .eyebrow,.essay-body p,.team-card,.intervenant-card,.qa,.cinfo .row,' +
            'form.vv .field,form.vv .btn,.term,.sched-row,.tool-label,.reel-head .btn,.limited-badge,.age-btn,.slot-hint,' +
            '.invite p,.invite-details,.invite .btn,.date-badge,.docs-bar a,.reel-item,.fxr-x';
  var fxr = $$(FXR);
  fxr.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(FXR); });
    delay(el, Math.min(sibs.indexOf(el) * .08, .5));
    el.classList.add('fxr');
  });
  var fxi = $$('.team-photo img,.intervenant-photo img,.reel-item img');
  fxi.forEach(function (el) {
    var sibs = $$(el.tagName === 'IMG' ? 'img' : '*', el.closest('.team-grid,.intervenants-grid,.reel') || el.parentNode);
    delay(el, Math.min((sibs.indexOf(el) % 3) * .12, .4));
    el.classList.add('fxi');
  });
  // décalage des blocs « .rv » du reste du site
  $$('.index-row,.price-card,.step,.pillar,.stat').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.className === el.className || c.matches('.' + el.classList[0]); });
    delay(el, Math.min(sibs.indexOf(el) * .12, .5));
  });

  /* ---------- 4. Conviction : le texte se colore au défilement ---------- */
  var statement = $('.statement .big');
  var sWords = [];
  if (statement) {
    statement.classList.remove('rv');
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = p;
            sWords.push(w); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) { walk(c); }
      });
    })(statement);
  }

  /* ---------- 5. Observateurs (démarrent quand la page est « prête ») ---------- */
  function startObservers() {
    if (!('IntersectionObserver' in window)) {
      splits.concat(fxr, fxi).forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' });
    splits.concat(fxr).forEach(function (e) { io.observe(e); });
    // les photos sont masquées (clip-path) : on observe leur conteneur
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target._img.classList.add('in'); io2.unobserve(en.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -5% 0px' });
    fxi.forEach(function (img) { var h = img.parentNode; h._img = img; io2.observe(h); });
  }

  /* ---------- 6. Intro « rideau » + page prête ---------- */
  var curtain = $('#curtain');
  var finished = false;
  function ready() {
    if (root.classList.contains('ready')) return;
    root.classList.add('ready');
    startObservers();
  }
  function whenFonts(cb) {
    var done = false, go = function () { if (!done) { done = true; cb(); } };
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); setTimeout(go, 900); } else { go(); }
  }
  function finishIntro() {
    if (finished) return; finished = true;
    curtain.classList.add('open');
    root.classList.remove('intro');
    setTimeout(ready, 420);
    setTimeout(function () { if (curtain.parentNode) curtain.parentNode.removeChild(curtain); }, 1400);
  }
  if (curtain && root.classList.contains('intro')) {
    try { sessionStorage.setItem('vv_intro', '1'); } catch (e) {}
    var cnt = $('.cnt', curtain), bar = $('.bar i', curtain), t0 = null;
    var tick = function (ts) {
      if (finished) return;
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / 1100, 1), e = 1 - Math.pow(1 - p, 3);
      cnt.textContent = Math.round(e * 100);
      bar.style.transform = 'scaleX(' + e + ')';
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finishIntro, 160);
    };
    whenFonts(function () { requestAnimationFrame(tick); });
    curtain.addEventListener('click', finishIntro);
  } else if (root.classList.contains('wipe-in')) {
    whenFonts(function () {
      requestAnimationFrame(function () {
        root.classList.remove('wipe-in');
        setTimeout(ready, 300);
      });
    });
  } else {
    whenFonts(function () { requestAnimationFrame(ready); });
  }

  /* ---------- 7. Transition entre les pages ---------- */
  var wipe = $('#wipe');
  document.addEventListener('click', function (e) {
    if (!wipe || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.hash) return;
    if (/\.(pdf|png|jpe?g|mp4|ico|xml|txt)$/i.test(u.pathname)) return;
    e.preventDefault();
    try { sessionStorage.setItem('vv_wipe', '1'); } catch (x) {}
    wipe.classList.add('cover');
    setTimeout(function () { location.href = a.href; }, 600);
  });
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted && wipe) { wipe.classList.remove('cover'); root.classList.remove('wipe-in'); }
  });

  /* ---------- 8. Boucle de défilement : progression, parallaxe, scrub, bandeau ---------- */
  var prog = document.createElement('div'); prog.id = 'prog'; document.body.appendChild(prog);
  var hdr = $('header.site');
  var heroMedia = $('.hero-media'), heroVid = $('.hero-media video');
  var marquee = $('.marquee'), mBand = $('.marquee-band');
  var mx = 0, half = 0, mVisible = true, vel = 0, lastY = window.scrollY;
  if (marquee) {
    var measure = function () { half = marquee.scrollWidth / 2; };
    measure(); window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { mVisible = en[0].isIntersecting; }).observe(mBand);
    }
  }
  var footer = $('footer.site');
  var fab = null;
  if (!$('.age-picker')) {
    fab = document.createElement('a');
    fab.className = 'fab btn btn-rose'; fab.href = 'inscription.html'; fab.textContent = "S'inscrire";
    document.body.appendChild(fab);
  }
  var cur = null, cx = 0, cy = 0, tx = 0, ty = 0, curShown = false;

  function frame() {
    var y = window.scrollY, vh = window.innerHeight, dh = document.documentElement.scrollHeight;
    var dy = y - lastY; lastY = y; vel = vel * 0.86 + dy * 0.14;

    prog.style.transform = 'scaleX(' + (dh - vh > 0 ? y / (dh - vh) : 0) + ')';

    if (hdr && !document.body.classList.contains('menu-open')) {
      if (y > 500 && dy > 2) hdr.classList.add('hide');
      else if (dy < -2 || y <= 500) hdr.classList.remove('hide');
    }
    if (heroMedia && heroVid) {
      var r = heroMedia.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        heroVid.style.setProperty('--py', clamp((r.top + r.height / 2 - vh / 2) * -0.07, -34, 34) + 'px');
      }
    }
    if (sWords.length) {
      var sr = statement.getBoundingClientRect();
      if (sr.bottom > -50 && sr.top < vh + 50) {
        var p = clamp((vh * 0.85 - sr.top) / (sr.height + vh * 0.25), 0, 1), N = sWords.length;
        for (var i = 0; i < N; i++) {
          var o = (0.14 + 0.86 * clamp(p * (N + 4) - i, 0, 1)).toFixed(2);
          if (sWords[i]._o !== o) { sWords[i].style.opacity = o; sWords[i]._o = o; }
        }
      }
    }
    if (marquee && mVisible && half) {
      mx -= 0.7 + vel * 0.45;
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      marquee.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,0,0)';
    }
    if (fab && footer) {
      fab.classList.toggle('show', y > 600 && footer.getBoundingClientRect().top > vh * 0.92);
    }
    if (cur && curShown) {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 9. Curseur, boutons magnétiques, bande photo à glisser ---------- */
  if (fine) {
    cur = document.createElement('div'); cur.id = 'cur'; document.body.appendChild(cur);
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!curShown) { cx = tx; cy = ty; curShown = true; cur.classList.add('on'); }
      var t = e.target, lbl = '';
      if (t.closest) {
        if (t.closest('.reel')) lbl = 'Glisser';
        else if (t.closest('.index-row')) lbl = 'Voir';
      }
      cur.classList.toggle('lbl', !!lbl);
      if (lbl) cur.setAttribute('data-l', lbl);
      cur.classList.toggle('hov', !lbl && !!(t.closest && t.closest('a,button,summary,label,input,select,textarea')));
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); curShown = false; });

    $$('.btn').forEach(function (b) {
      if (b.classList.contains('fab')) return;
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.translate = (dx * 16).toFixed(1) + 'px ' + (dy * 10).toFixed(1) + 'px';
      });
      b.addEventListener('mouseleave', function () { b.style.translate = ''; });
    });

    var reel = $('.reel');
    if (reel) {
      var down = false, sx = 0, sl = 0, moved = 0;
      reel.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = reel.scrollLeft; moved = 0; });
      window.addEventListener('mouseup', function () { down = false; reel.classList.remove('drag'); });
      window.addEventListener('mousemove', function (e) {
        if (!down) return;
        moved = e.pageX - sx;
        if (Math.abs(moved) > 5) reel.classList.add('drag');
        reel.scrollLeft = sl - moved;
      });
      reel.addEventListener('click', function (e) { if (Math.abs(moved) > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    }
  }
})();
