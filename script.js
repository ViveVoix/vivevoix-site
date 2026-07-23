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

  // Formulaire de contact — envoi réel vers le Worker
  var form = document.querySelector('form.vv');
  if(form){
    var msg = form.querySelector('.formmsg');
    var btn = form.querySelector('button[type="submit"]');

    function showMsg(text, isError){
      if(!msg) return;
      msg.textContent = text;
      msg.style.display = 'block';
      msg.style.background = isError ? '#FDE7E7' : '';
      msg.style.color = isError ? '#B32525' : '';
      msg.scrollIntoView({behavior:'smooth', block:'center'});
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var data = {
        nom: (form.nom && form.nom.value || '').trim(),
        email: (form.email && form.email.value || '').trim(),
        public: (form.public && form.public.value || ''),
        message: (form.message && form.message.value || '').trim(),
        website: (form.website && form.website.value || '')
      };

      if(!data.nom || !data.email || data.email.indexOf('@') === -1){
        showMsg("Merci de renseigner votre nom et un e-mail valide.", true);
        return;
      }

      var original = btn ? btn.textContent : '';
      if(btn){ btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(r){ return r.json().catch(function(){ return {ok:false}; }); })
      .then(function(res){
        if(res && res.ok){
          showMsg("Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.", false);
          form.reset();
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
})();
