/* Vive Voix — pop-up d'information (mise à jour des horaires et de la date d'inauguration)
   Affiché une fois par visite (par onglet). Pour le désactiver : passer ACTIVE à false. */
(function () {
  var ACTIVE = true;
  var IMAGE = "info-mise-a-jour.jpg";
  var STORAGE_KEY = "vv_popup_maj_2026_09"; // change la valeur pour ré-afficher le pop-up à tout le monde

  if (!ACTIVE) return;
  try { if (sessionStorage.getItem(STORAGE_KEY)) return; } catch (e) {}

  function openPopup() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}

    var previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    var overlay = document.createElement("div");
    overlay.id = "vv-info-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Mise à jour importante : informations corrigées");
    // z-index au-dessus du bandeau cookies (99998) : l'info s'affiche en premier
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(10,10,12,.65);z-index:99999;" +
      "display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;";

    var box = document.createElement("div");
    box.style.cssText = "position:relative;max-width:100%;max-height:100%;display:flex;";

    var img = document.createElement("img");
    img.src = IMAGE;
    img.alt = "Mise à jour importante — inauguration le jeudi 1er octobre 2026 ; adolescents 17h30 à 19h ; adultes 19h à 20h30.";
    img.style.cssText =
      "display:block;max-width:100%;max-height:calc(100vh - 32px);width:auto;height:auto;" +
      "border-radius:12px;box-shadow:0 30px 70px rgba(0,0,0,.4);background:#fff;";

    var close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Fermer");
    close.innerHTML = "&times;";
    close.style.cssText =
      "position:absolute;top:10px;right:10px;width:40px;height:40px;border:0;border-radius:50%;" +
      "background:#0B245B;color:#fff;font-size:26px;line-height:1;cursor:pointer;" +
      "display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3);";

    function closePopup() {
      overlay.remove();
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") closePopup(); }

    close.addEventListener("click", closePopup);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closePopup(); });
    document.addEventListener("keydown", onKey);

    box.appendChild(img);
    box.appendChild(close);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    close.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", openPopup);
  } else {
    openPopup();
  }
})();
