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
    var slot = document.createElement('span'); slot.className = 'wslot';
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
            '.invite p,.invite-details,.invite .btn,.date-badge,.docs-bar a,.tool-block,.price-card,.fxr-x';
  var fxr = $$(FXR);
  fxr.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(FXR); });
    delay(el, Math.min(sibs.indexOf(el) * .08, .5));
    el.classList.add('fxr');
    if (el.matches('.tool-block,.price-card,.team-card')) { el.classList.remove('rv'); el.classList.add('f3'); }
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
    // les photos masquées (clip-path) ne se chargeraient pas en « lazy » : on les charge juste après l'entrée en scène
    setTimeout(function () { fxi.forEach(function (im) { im.loading = 'eager'; }); }, 1200);
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
  var mic = null, cx = 0, cy = 0, tx = 0, ty = 0, lastTx = 0, curShown = false, ang = 0, msc = 1, mscT = 1;
  var pmx = 0, pmy = 0, hx = 0, hy = 0;
  var cards = $$('.scard'), stickyTop = [];
  var pageHero = $('.page-hero'), heroH = $$('.hero-h .l'), parImgs = $$('.team-photo img,.intervenant-photo img');
  var cfUpdate = null, cfStep = null;
  function measureCards() {
    stickyTop = cards.map(function (c) { return parseFloat(getComputedStyle(c).top) || 0; });
  }
  measureCards(); window.addEventListener('resize', measureCards);

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
      marquee.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,0,0) skewX(' + clamp(-vel * 0.5, -10, 10).toFixed(2) + 'deg)';
    }
    if (fab && footer) {
      fab.classList.toggle('show', y > 600 && footer.getBoundingClientRect().top > vh * 0.92);
    }
    // cartes empilées : la carte recouverte recule, s'incline et s'assombrit
    for (var c = 0; c < cards.length - 1; c++) {
      var nr = cards[c + 1].getBoundingClientRect(), st = stickyTop[c + 1] || 0;
      var pp = clamp((vh * 0.95 - nr.top) / (vh * 0.95 - st - 24), 0, 1);
      cards[c].style.transform = 'scale(' + (1 - pp * 0.07).toFixed(3) + ') perspective(1400px) rotateX(' + (pp * 6).toFixed(2) + 'deg)';
      cards[c].style.setProperty('--dim', (pp * 0.4).toFixed(2));
    }
    // bandeau de page : grand mot qui défile en fond
    if (pageHero && y < vh * 1.2) pageHero.style.setProperty('--sx', (-y * 0.35).toFixed(1) + 'px');
    // photos : légère parallaxe de profondeur
    for (var q = 0; q < parImgs.length; q++) {
      var ir = parImgs[q].parentNode.getBoundingClientRect();
      if (ir.bottom > 0 && ir.top < vh) parImgs[q].style.setProperty('--ty', clamp((ir.top + ir.height / 2 - vh / 2) * -0.07, -20, 20).toFixed(1) + 'px');
    }
    // souris → profondeur du hero (titre étagé + carte vidéo inclinée)
    if (fine && root.classList.contains('ready')) {
      hx += (pmx - hx) * 0.07; hy += (pmy - hy) * 0.07;
      if (y < vh) {
        for (var h = 0; h < heroH.length; h++) heroH[h].style.translate = (hx * (6 + h * 7)).toFixed(1) + 'px 0';
        if (heroMedia) heroMedia.style.transform = 'rotateY(' + (hx * 7).toFixed(2) + 'deg) rotateX(' + (-hy * 5).toFixed(2) + 'deg)';
      }
    }
    // le curseur est un micro : il suit la souris, se penche selon la vitesse
    if (mic && curShown) {
      cx += (tx - cx) * 0.55; cy += (ty - cy) * 0.55;
      var vx = tx - lastTx; lastTx = tx;
      ang += (clamp(vx * 2.4, -42, 42) - ang) * 0.16;
      msc += (mscT - msc) * 0.2;
      mic.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) rotate(' + ang.toFixed(1) + 'deg) scale(' + msc.toFixed(3) + ')';
    }
    if (cfStep) cfStep();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 9. Souris : barres de son, boutons magnétiques, cartes inclinées ---------- */
  if (fine) {
    mic = document.createElement('div'); mic.id = 'mic'; mic.setAttribute('aria-hidden', 'true');
    mic.innerHTML = '<svg viewBox="0 0 28 44" width="28" height="44"><path class="mb" d="M9 24h10l-1.6 16.4Q14 43 10.6 40.4z"/><rect class="mc" x="7" y="19.6" width="14" height="4.6" rx="2.3"/><ellipse class="mh" cx="14" cy="11" rx="9" ry="10"/><path class="mg" d="M5.8 8.2h16.4M5.2 12h17.6M6.4 15.8h15.2M10 2.4v17.2M14 1v20M18 2.4v17.2"/></svg>';
    document.body.appendChild(mic);
    var FIELD = 'input,textarea,select,[contenteditable]';
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      pmx = (e.clientX / window.innerWidth) * 2 - 1; pmy = (e.clientY / window.innerHeight) * 2 - 1;
      if (!curShown) { cx = tx; cy = ty; lastTx = tx; curShown = true; root.classList.add('mic-on'); mic.classList.add('on'); }
      var t = e.target, lbl = '';
      if (t.closest) {
        mic.classList.toggle('off', !!t.closest(FIELD));
        if (t.closest('.reel')) lbl = 'Glisser';
        else if (t.closest('.scard')) lbl = 'Voir';
      }
      mic.classList.toggle('lbl', !!lbl);
      if (lbl) mic.setAttribute('data-l', lbl);
      var hv = !lbl && !!(t.closest && t.closest('a,button,summary,label'));
      mic.classList.toggle('hov', hv);
      mscT = hv ? 1.3 : 1;
    }, { passive: true });
    document.addEventListener('mouseleave', function () { mic.classList.remove('on'); root.classList.remove('mic-on'); curShown = false; });
    document.addEventListener('mouseenter', function () { /* réactivé au prochain mouvement */ });
    // au clic : des ondes sonores partent du micro
    document.addEventListener('mousedown', function (e) {
      if (mic.classList.contains('off')) return;
      var w = document.createElement('div'); w.className = 'vvwave';
      w.style.left = e.clientX + 'px'; w.style.top = e.clientY + 'px';
      w.style.setProperty('--r', (-24 + Math.random() * 14).toFixed(0) + 'deg');
      w.innerHTML = '<svg viewBox="-50 -50 100 100"><g class="a1"><path d="M17-13A21 21 0 0 1 17 13"/></g><g class="a2"><path d="M27-20A33 33 0 0 1 27 20"/></g><g class="a3"><path d="M37-27A46 46 0 0 1 37 27"/></g></svg>';
      document.body.appendChild(w);
      setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 1100);
    });

    $$('.btn').forEach(function (b) {
      if (b.classList.contains('fab')) return;
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.translate = (dx * 16).toFixed(1) + 'px ' + (dy * 10).toFixed(1) + 'px';
      });
      b.addEventListener('mouseleave', function () { b.style.translate = ''; });
    });

    // cartes qui se penchent vers la souris (effet 3D)
    $$('.price-card,.team-card,.intervenant-card,.tool-block').forEach(function (card) {
      card.classList.add('tilt');
      card.addEventListener('mousemove', function (e) {
        if (!card.classList.contains('in')) return;
        var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transition = 'transform .15s ease-out';
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 9).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 12).toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1)';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 820);
      });
    });
  }

  /* ---------- 10. Carrousel 3D des intervenants ---------- */
  var reel = $('.reel');
  if (reel && $$('.reel-item', reel).length > 2) {
    var items = $$('.reel-item', reel), n = items.length;
    reel.classList.add('cf'); reel.setAttribute('tabindex', '0');
    reel.setAttribute('aria-roledescription', 'carrousel'); reel.setAttribute('aria-label', 'Nos intervenants');
    var pos = 0, target = 0, dragging = false, sxp = 0, spos = 0, moved = 0, hover = false, inview = true, lastAuto = performance.now(), dirty = true;
    var step = function () { return items[0].offsetWidth * 0.6; };
    var ARR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="';
    var nav = document.createElement('div'); nav.className = 'cf-nav';
    nav.innerHTML = '<button type="button" aria-label="Intervenant précédent">' + ARR + 'M19 12H5M11 6l-6 6 6 6"/></svg></button>' +
                    '<button type="button" aria-label="Intervenant suivant">' + ARR + 'M5 12h14M13 6l6 6-6 6"/></svg></button>';
    reel.parentNode.insertBefore(nav, reel.nextSibling);
    nav.children[0].addEventListener('click', function () { target = Math.round(target) - 1; lastAuto = performance.now(); });
    nav.children[1].addEventListener('click', function () { target = Math.round(target) + 1; lastAuto = performance.now(); });
    function place() {
      var w = items[0].offsetWidth, st = step();
      for (var i = 0; i < n; i++) {
        var d = i - pos; d = ((d + n / 2) % n + n) % n - n / 2;
        var ad = Math.abs(d);
        items[i].style.transform = 'translate3d(' + (d * st - w / 2).toFixed(1) + 'px,0,' + (-ad * 190).toFixed(1) + 'px) rotateY(' + (-d * 32).toFixed(2) + 'deg) scale(' + (1 - ad * 0.05).toFixed(3) + ')';
        items[i].style.opacity = Math.max(0.18, 1 - ad * 0.26).toFixed(2);
        items[i].style.zIndex = String(100 - Math.round(ad * 10));
      }
    }
    cfUpdate = place; place();
    cfStep = function () {
      var now = performance.now();
      if (inview && !hover && !dragging && now - lastAuto > 3800) { target = Math.round(target) + 1; lastAuto = now; }
      if (!dragging && Math.abs(target - pos) > 0.0005) { pos += (target - pos) * 0.09; dirty = true; }
      if (dirty && inview) { place(); dirty = false; }
    };
    window.addEventListener('resize', function () { dirty = true; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inview = en[0].isIntersecting; }).observe(reel);
    reel.addEventListener('mouseenter', function () { hover = true; });
    reel.addEventListener('mouseleave', function () { hover = false; });
    reel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { target = Math.round(target) - 1; e.preventDefault(); }
      if (e.key === 'ArrowRight') { target = Math.round(target) + 1; e.preventDefault(); }
    });
    reel.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0; sxp = e.clientX; spos = pos; lastAuto = performance.now();
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      moved = e.clientX - sxp;
      if (Math.abs(moved) > 5) reel.classList.add('drag');
      pos = spos - moved / step(); target = pos; dirty = true;
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false; reel.classList.remove('drag'); target = Math.round(pos); lastAuto = performance.now();
    });
    reel.addEventListener('click', function (e) {
      if (Math.abs(moved) > 6) { e.preventDefault(); return; }
      var it = e.target.closest && e.target.closest('.reel-item');
      if (!it) return;
      var i = items.indexOf(it), d = i - pos; d = ((d + n / 2) % n + n) % n - n / 2;
      if (Math.abs(d) > 0.4) { e.preventDefault(); e.stopPropagation(); target = Math.round(pos + d); lastAuto = performance.now(); }
    }, true);
  }
})();
