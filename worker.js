import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

// Adresse expéditrice : DOIT appartenir au domaine où Email Routing est actif.
const SENDER_ADDR = "site@associationvivevoix.fr";
const SENDER_NAME = "Site Vive Voix";
// Adresse de destination (celle vérifiée dans Email Routing + le binding).
const RECIPIENT_ADDR = "contact@associationvivevoix.fr";

function escapeText(s) {
  return String(s ?? "").slice(0, 5000);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Endpoint du formulaire de contact ──
    if (url.pathname === "/api/contact" && request.method === "POST") {
      try {
        const ct = request.headers.get("content-type") || "";
        let data = {};
        if (ct.includes("application/json")) {
          data = await request.json();
        } else {
          const form = await request.formData();
          data = Object.fromEntries(form.entries());
        }

        const nom = escapeText(data.nom);
        const email = escapeText(data.email);
        const publicCible = escapeText(data.public);
        const message = escapeText(data.message);

        // Validation minimale
        if (!nom || !email || !email.includes("@")) {
          return json({ ok: false, error: "Champs manquants ou e-mail invalide." }, 400);
        }

        // Anti-spam simple : champ caché "website" doit rester vide
        if (data.website) {
          return json({ ok: true }); // on fait comme si tout allait bien
        }

        const msg = createMimeMessage();
        msg.setSender({ name: SENDER_NAME, addr: SENDER_ADDR });
        msg.setRecipient(RECIPIENT_ADDR);
        msg.setHeader("Reply-To", email);
        msg.setSubject(`Nouveau message du site — ${nom}`);
        msg.addMessage({
          contentType: "text/plain",
          data:
            `Nouveau message via le formulaire de contact\n\n` +
            `Nom : ${nom}\n` +
            `E-mail : ${email}\n` +
            `Concerne : ${publicCible || "(non précisé)"}\n\n` +
            `Message :\n${message || "(vide)"}\n`,
        });

        const emailMessage = new EmailMessage(SENDER_ADDR, RECIPIENT_ADDR, msg.asRaw());
        await env.CONTACT_EMAIL.send(emailMessage);

        return json({ ok: true });
      } catch (e) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // ── Tout le reste : fichiers statiques ──
    return env.ASSETS.fetch(request);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
