/* Vive Voix — bandeau cookies + chargement conditionnel de Google Analytics (GA4) */
(function () {
  // ⚠️ Remplace la ligne suivante par ton propre ID de mesure GA4 (format G-XXXXXXXXXX)
  var GA_MEASUREMENT_ID = "G-KZ3C1VJ6K2";

  var STORAGE_KEY = "vv_cookie_consent"; // "accepted" | "refused"

  function loadGA() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("XXXX") !== -1) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    hideBanner();
    if (value === "accepted") loadGA();
    addFloatingButton();
  }

  function hideBanner() {
    var el = document.getElementById("vv-cookie-banner");
    if (el) el.remove();
    var ov = document.getElementById("vv-cookie-overlay");
    if (ov) ov.remove();
  }

  function buildBanner() {
    var overlay = document.createElement("div");
    overlay.id = "vv-cookie-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(10,10,12,.6);z-index:99998;" +
      "display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";

    var modal = document.createElement("div");
    modal.id = "vv-cookie-banner";
    modal.style.cssText =
      "width:100%;max-width:640px;max-height:88vh;overflow:hidden;background:#FBF7F2;" +
      "border-radius:16px;box-shadow:0 30px 70px rgba(0,0,0,.4);" +
      "font-family:'Inter Tight',Arial,sans-serif;color:#3a3a3a;" +
      "display:flex;";

    modal.innerHTML =
      '<div style="flex:1;padding:32px 36px;overflow:auto;display:flex;flex-direction:column;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;gap:16px;">' +
          '<img src="logo.png" alt="Vive Voix" style="height:56px;width:56px;flex-shrink:0;">' +
          '<a id="vv-cookie-continue" href="#" style="font-size:.85rem;color:#0B245B;font-weight:600;white-space:nowrap;text-decoration:none;">Continuer sans accepter →</a>' +
        '</div>' +
        '<div style="font-family:\'Fraunces\',serif;font-weight:600;font-size:1.4rem;color:#0B245B;line-height:1.3;margin-bottom:16px;">Vos préférences sur les cookies</div>' +
        '<div style="font-size:.92rem;line-height:1.6;margin-bottom:14px;">' +
          "Vive Voix aimerait activer Google Analytics sur ce site pour mieux comprendre comment il est utilisé et continuer à l'améliorer au fil du temps. Concrètement, ça nous aide à :" +
        '</div>' +
        '<ul style="font-size:.92rem;line-height:1.6;margin:0 0 14px;padding-left:20px;">' +
          '<li style="margin-bottom:8px;"><strong>Savoir qui visite le site</strong>, sans jamais identifier personne individuellement.</li>' +
          '<li style="margin-bottom:8px;"><strong>Voir quelles pages intéressent le plus</strong>, pour savoir lesquelles retravailler en priorité.</li>' +
          '<li><strong>Comprendre d\'où viennent les visites</strong> (Instagram, Facebook, Google, ou directement) pour savoir où concentrer nos efforts de communication.</li>' +
        '</ul>' +
        '<div style="font-size:.92rem;line-height:1.6;margin-bottom:6px;">' +
          "Nous n'affichons aucune publicité et ne partageons rien avec des tiers commerciaux. Ces données servent uniquement en interne, à l'équipe de Vive Voix." +
        '</div>' +
        '<button id="vv-cookie-toggle" style="background:none;border:none;color:#0B245B;font-size:.85rem;font-weight:600;text-decoration:underline;cursor:pointer;padding:6px 0 14px;text-align:left;">En savoir plus ▾</button>' +
        '<div id="vv-cookie-details" style="display:none;font-size:.85rem;line-height:1.6;color:#5a5a5a;background:#F4ECE1;border-radius:10px;padding:16px 18px;margin-bottom:16px;">' +
          "Techniquement, Google Analytics dépose un cookie dans votre navigateur qui permet de compter les visites et de suivre le parcours sur le site (pages vues, provenance, type d'appareil), de façon agrégée. Ces informations sont anonymisées (adresse IP tronquée) et conservées par Google selon leurs propres règles de conservation. Aucune donnée n'est utilisée à des fins publicitaires, ni revendue, ni croisée avec d'autres sites. Si vous refusez, le site fonctionne exactement de la même façon : aucune fonctionnalité n'est limitée." +
        '</div>' +
        '<div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;">' +
          '<button id="vv-cookie-manage" style="background:none;border:none;color:#0B245B;font-size:.9rem;font-weight:600;text-decoration:underline;cursor:pointer;padding:0;">Personnaliser mes choix</button>' +
          '<button id="vv-cookie-accept" style="background:#0B245B;color:#fff;border:none;border-radius:999px;padding:14px 28px;font-weight:600;font-size:.9rem;cursor:pointer;white-space:nowrap;">Accepter et fermer</button>' +
        '</div>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById("vv-cookie-toggle").addEventListener("click", function () {
      var d = document.getElementById("vv-cookie-details");
      var isOpen = d.style.display === "block";
      d.style.display = isOpen ? "none" : "block";
      this.textContent = isOpen ? "En savoir plus ▾" : "Voir moins ▴";
    });
    document.getElementById("vv-cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
    });
    document.getElementById("vv-cookie-continue").addEventListener("click", function (e) {
      e.preventDefault();
      setConsent("refused");
    });
    document.getElementById("vv-cookie-manage").addEventListener("click", function () {
      setConsent("refused");
    });
  }

  function init() {
    var existing;
    try { existing = localStorage.getItem(STORAGE_KEY); } catch (e) { existing = null; }

    if (existing === "accepted") {
      loadGA();
      addFloatingButton();
    } else if (existing === "refused") {
      addFloatingButton();
    } else {
      buildBanner();
    }
  }

  function addFloatingButton() {
    if (document.getElementById("vv-cookie-float")) return;
    var btn = document.createElement("button");
    btn.id = "vv-cookie-float";
    btn.innerHTML = "🍪";
    btn.title = "Gérer mes cookies";
    btn.style.cssText =
      "position:fixed;left:18px;bottom:18px;width:46px;height:46px;border-radius:50%;" +
      "background:#0B245B;color:#fff;border:none;font-size:1.2rem;cursor:pointer;" +
      "box-shadow:0 6px 18px rgba(11,36,91,.35);z-index:99997;display:flex;" +
      "align-items:center;justify-content:center;padding:0;";
    btn.addEventListener("click", function () {
      window.vvOpenCookieChoice();
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Permet de rouvrir le choix depuis le bouton flottant ou un lien du footer
  window.vvOpenCookieChoice = function () {
    var fb = document.getElementById("vv-cookie-float");
    if (fb) fb.remove();
    hideBanner();
    buildBanner();
  };
})();
