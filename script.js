// Menu mobile
(function(){
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if(burger && menu){
    burger.addEventListener('click', function(){
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.classList.remove('open'); });
    });
  }

  // Formulaires (contact & inscription) — envoi via Formspree
  var form = document.querySelector('form.vv');
  if(form){
    var msg = form.querySelector('.formmsg');
    var btn = form.querySelector('button[type="submit"]');

    // Choix de l'endpoint selon la page
    var isInscription = !!document.querySelector('.age-picker');
    var ENDPOINT = isInscription
      ? 'https://formspree.io/f/xlgqwvnl'   // Vive Voix — Inscription
      : 'https://formspree.io/f/xjgnezrg';  // Vive Voix — Contact

    function showMsg(text, isError){
      if(!msg) return;
      msg.textContent = text;
      msg.style.display = 'block';
      msg.style.background = isError ? '#FDE7E7' : '';
      msg.style.color = isError ? '#B32525' : '';
      msg.scrollIntoView({behavior:'smooth', block:'center'});
    }

    function val(name){
      var el = form.elements[name];
      return el && el.value ? el.value.trim() : '';
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();

      // Pot de miel anti-spam : si rempli, on simule un succès sans envoyer
      if(val('website')){
        showMsg("Merci ! Votre message a bien été envoyé.", false);
        form.reset();
        return;
      }

      var data = {};
      var okToSend = true;

      if(isInscription){
        var creneauEl = form.querySelector('input[name="creneau"]:checked')
                     || document.querySelector('input[name="creneau"]:checked');
        data = {
          _subject     : 'Nouvelle demande d\u2019inscription — Vive Voix',
          _replyto     : val('email'),
          Creneau      : creneauEl ? creneauEl.value : '(non sélectionné)',
          Participant  : val('participant'),
          Age          : val('age'),
          Responsable  : val('responsable'),
          email        : val('email'),
          Telephone    : val('tel'),
          Message      : val('message')
        };
        if(!data.Participant || !data.email || data.email.indexOf('@') === -1){
          showMsg("Merci d'indiquer le nom du participant et un e-mail valide.", true);
          okToSend = false;
        } else if(!creneauEl){
          showMsg("Merci de choisir un créneau ci-dessus avant d'envoyer.", true);
          okToSend = false;
        }
      } else {
        data = {
          _subject : 'Nouveau message depuis le site — Vive Voix',
          _replyto : val('email'),
          Nom      : val('nom'),
          email    : val('email'),
          Concerne : val('public'),
          Message  : val('message')
        };
        if(!data.Nom || !data.email || data.email.indexOf('@') === -1){
          showMsg("Merci de renseigner votre nom et un e-mail valide.", true);
          okToSend = false;
        }
      }

      if(!okToSend) return;

      var original = btn ? btn.textContent : '';
      if(btn){ btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(r){
        if(r.ok){
          showMsg(isInscription
            ? "Merci ! Votre demande d'inscription a bien été envoyée. Nous vous répondons sous 24 à 48h."
            : "Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.", false);
          form.reset();
          var recap = document.getElementById('recap');
          if(recap) recap.hidden = true;
          document.querySelectorAll('.slot').forEach(function(s){ s.classList.remove('checked'); });
        } else {
          showMsg("Une erreur est survenue. Vous pouvez aussi nous écrire directement à contact@associationvivevoix.fr.", true);
        }
      })
      .catch(function(){
        showMsg("Impossible d'envoyer pour le moment. Écrivez-nous à contact@associationvivevoix.fr.", true);
      })
      .finally(function(){
        if(btn){ btn.disabled = false; btn.textContent = original; }
      });
    });
  }

  // ── Page inscription : choix de la tranche d'âge puis du créneau ──
  var ageBtns = document.querySelectorAll('.age-btn');
  if(ageBtns.length){
    var slotGrid  = document.getElementById('slotGrid');
    var slotHint  = document.getElementById('slotHint');
    var recap     = document.getElementById('recap');
    var recapSlot = document.getElementById('recapSlot');
    var slots     = document.querySelectorAll('.slot');

    ageBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var age = btn.getAttribute('data-age');

        ageBtns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');

        var count = 0;
        slots.forEach(function(s){
          var match = s.getAttribute('data-for') === age;
          s.hidden = !match;
          s.style.display = match ? '' : 'none';
          s.classList.remove('checked');
          var r = s.querySelector('input');
          if(r) r.checked = false;
          if(match) count++;
        });

        slotGrid.hidden = false;
        slotHint.textContent = count + (count > 1 ? ' créneaux disponibles' : ' créneau disponible') + ' pour ce public.';

        if(recap) recap.hidden = true;
      });
    });

    slots.forEach(function(s){
      s.addEventListener('click', function(){
        slots.forEach(function(o){ o.classList.remove('checked'); });
        s.classList.add('checked');
        var r = s.querySelector('input');
        if(r){
          r.checked = true;
          if(recap && recapSlot){
            recapSlot.textContent = r.value;
            recap.hidden = false;
          }
        }
      });
    });

    // Champ responsable légal : mis en avant si l'âge saisi est < 18
    var ageInput = document.getElementById('age');
    var respField = document.getElementById('responsableField');
    if(ageInput && respField){
      ageInput.addEventListener('input', function(){
        var v = parseInt(ageInput.value, 10);
        respField.style.display = (!isNaN(v) && v >= 18) ? 'none' : '';
      });
    }
  }

  // ── Vidéo du hero : relance la lecture si le mobile a bloqué l'autoplay ──
  var heroVid = document.querySelector('.hero-cine-video');
  if(heroVid){
    var tryPlay = function(){
      var pr = heroVid.play();
      if(pr && typeof pr.catch === 'function'){ pr.catch(function(){}); }
    };

    tryPlay();
    heroVid.addEventListener('loadeddata', tryPlay);
    heroVid.addEventListener('canplay', tryPlay);

    // Certains mobiles n'autorisent la lecture qu'après une interaction
    ['touchstart','click','scroll'].forEach(function(evt){
      document.addEventListener(evt, function once(){
        tryPlay();
        document.removeEventListener(evt, once);
      }, {passive:true});
    });

    // Si l'onglet redevient visible, on relance
    document.addEventListener('visibilitychange', function(){
      if(!document.hidden) tryPlay();
    });
  }
})();
