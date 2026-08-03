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
  }

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.id = "vv-cookie-banner";
    wrap.style.cssText =
      "position:fixed;left:20px;right:20px;bottom:20px;max-width:480px;" +
      "background:#FBF7F2;border:1px solid #F0DFE6;border-radius:18px;" +
      "box-shadow:0 12px 32px rgba(11,36,91,.18);padding:22px 24px;" +
      "font-family:'Inter Tight',Arial,sans-serif;z-index:99999;line-height:1.5;";

    wrap.innerHTML =
      '<div style="font-family:\'Fraunces\',serif;font-weight:600;font-size:1.05rem;color:#0B245B;margin-bottom:6px;">On utilise quelques cookies 🍪</div>' +
      '<div style="font-size:.9rem;color:#3a3a3a;margin-bottom:16px;">' +
      "Juste pour comprendre comment le site est utilisé (Google Analytics), rien d'autre. Tu peux accepter ou refuser." +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
      '<button id="vv-cookie-accept" style="flex:1;min-width:120px;background:#D93F72;color:#fff;border:none;border-radius:999px;padding:10px 18px;font-weight:600;font-size:.9rem;cursor:pointer;">Accepter</button>' +
      '<button id="vv-cookie-refuse" style="flex:1;min-width:120px;background:transparent;color:#0B245B;border:1px solid #0B245B;border-radius:999px;padding:10px 18px;font-weight:600;font-size:.9rem;cursor:pointer;">Refuser</button>' +
      "</div>";

    document.body.appendChild(wrap);
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
