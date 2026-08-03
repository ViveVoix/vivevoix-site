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
      "position:fixed;inset:0;background:rgba(20,20,25,.35);z-index:99998;";
    document.body.appendChild(overlay);

    var modal = document.createElement("div");
    modal.id = "vv-cookie-banner";
    modal.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;width:100%;box-sizing:border-box;" +
      "max-height:70vh;overflow:auto;background:#FBF7F2;" +
      "box-shadow:0 -12px 40px rgba(0,0,0,.25);" +
      "font-family:'Inter Tight',Arial,sans-serif;color:#3a3a3a;z-index:99999;";

    modal.innerHTML =
      '<div style="padding:32px 40px 20px;max-width:1100px;margin:0 auto;">' +
        '<div style="font-family:\'Fraunces\',serif;font-weight:600;font-size:1.4rem;color:#0B245B;margin-bottom:14px;">Bienvenue sur le site de Vive Voix</div>' +
        '<div style="font-size:.95rem;line-height:1.6;margin-bottom:10px;">' +
          "Pour comprendre combien de personnes visitent le site et comment il est utilisé, on aimerait activer Google Analytics. C'est le seul outil qu'on utilise, il n'y a pas de publicité ni de partage de données avec des tiers." +
        '</div>' +
        '<div style="font-size:.95rem;line-height:1.6;margin-bottom:16px;">' +
          "Vous pouvez changer d'avis à tout moment via le lien <strong>« Gérer mes cookies »</strong> tout en bas de chaque page." +
        '</div>' +
      '</div>' +
      '<div style="background:#F4ECE1;padding:18px 40px;">' +
        '<div style="max-width:1100px;margin:0 auto;display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap;">' +
          '<button id="vv-cookie-refuse" style="background:transparent;color:#0B245B;border:1px solid #0B245B;border-radius:8px;padding:13px 26px;font-weight:600;font-size:.9rem;cursor:pointer;">Refuser</button>' +
          '<button id="vv-cookie-accept" style="background:#0B245B;color:#fff;border:none;border-radius:8px;padding:13px 26px;font-weight:600;font-size:.9rem;cursor:pointer;">Tout accepter</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    document.getElementById("vv-cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
    });
    document.getElementById("vv-cookie-refuse").addEventListener("click", function () {
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
