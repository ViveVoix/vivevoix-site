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

  // Vidéo hero : si le fichier hero.mp4 est absent ou illisible, on masque
  // la vidéo pour laisser apparaître la photo de repli en dessous.
  var heroVideo = document.querySelector('.hero-video');
  if(heroVideo){
    var hideVideo = function(){ heroVideo.style.display = 'none'; };
    var source = heroVideo.querySelector('source');
    if(source){
      source.addEventListener('error', hideVideo);
    }
    heroVideo.addEventListener('error', hideVideo);
    // Sécurité : si après 2,5s la vidéo n'a pas commencé à charger de données, on masque
    setTimeout(function(){
      if(heroVideo.readyState === 0){ hideVideo(); }
    }, 2500);
  }
})();
