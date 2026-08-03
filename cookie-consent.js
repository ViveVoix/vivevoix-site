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
      "position:fixed;inset:0;background:rgba(20,20,25,.55);z-index:99998;" +
      "display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";

    var modal = document.createElement("div");
    modal.id = "vv-cookie-banner";
    modal.style.cssText =
      "width:100%;max-width:760px;max-height:85vh;overflow:auto;background:#FBF7F2;" +
      "border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.35);" +
      "font-family:'Inter Tight',Arial,sans-serif;color:#3a3a3a;";

    modal.innerHTML =
      '<div style="padding:36px 40px 24px;">' +
        '<div style="font-family:\'Fraunces\',serif;font-weight:600;font-size:1.6rem;color:#0B245B;margin-bottom:18px;">Bienvenue sur le site de Vive Voix</div>' +
        '<div style="font-size:.95rem;line-height:1.65;margin-bottom:16px;">' +
          "Pour comprendre combien de personnes visitent le site et comment il est utilisé, on aimerait activer Google Analytics. C'est le seul outil qu'on utilise, il n'y a pas de publicité ni de partage de données avec des tiers." +
        '</div>' +
        '<div style="font-size:.95rem;line-height:1.65;margin-bottom:20px;">' +
          "Vous pouvez modifier votre choix à tout moment en cliquant sur « Gérer mes cookies » en bas de page." +
        '</div>' +
        '<a id="vv-cookie-continue" href="#" style="font-size:.9rem;color:#0B245B;font-weight:600;text-decoration:underline;cursor:pointer;">Continuer sans accepter ›</a>' +
      '</div>' +
      '<div style="background:#F4ECE1;padding:20px 40px;border-radius:0 0 14px 14px;display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap;">' +
        '<button id="vv-cookie-refuse" style="background:transparent;color:#0B245B;border:1px solid #0B245B;border-radius:8px;padding:13px 26px;font-weight:600;font-size:.9rem;cursor:pointer;">Refuser</button>' +
        '<button id="vv-cookie-accept" style="background:#0B245B;color:#fff;border:none;border-radius:8px;padding:13px 26px;font-weight:600;font-size:.9rem;cursor:pointer;">Tout accepter</button>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById("vv-cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
    });
    document.getElementById("vv-cookie-refuse").addEventListener("click", function () {
      setConsent("refused");
    });
    document.getElementById("vv-cookie-continue").addEventListener("click", function (e) {
      e.preventDefault();
      setConsent("refused");
    });
  }

  function init() {
    var existing;
    try { existing = localStorage.getItem(STORAGE_KEY); } catch (e) { existing = null; }

    if (existing === "accepted") {
      loadGA();
    } else if (existing === "refused") {
      // rien à faire
    } else {
      buildBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Permet de rouvrir le choix depuis un lien "Gérer mes cookies" dans le footer
  window.vvOpenCookieChoice = function () {
    hideBanner();
    buildBanner();
  };
})();
