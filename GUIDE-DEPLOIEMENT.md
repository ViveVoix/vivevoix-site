# Vive Voix — Guide de déploiement (Worker + formulaire e-mail)

Ce projet contient **tout le site** ET **le formulaire de contact qui envoie de vrais e-mails**,
dans un seul Worker Cloudflare. Voici les étapes, dans l'ordre.

---

## Ce dont tu as besoin une seule fois

- Node.js installé (https://nodejs.org, version LTS)
- Un terminal (PowerShell sur Windows convient)

---

## Étape 1 — Activer Email Routing sur ton domaine

Sans ça, le Worker ne pourra pas envoyer d'e-mail.

1. Va sur le dashboard Cloudflare → ton domaine **associationvivevoix.fr**
2. Menu **Email** → **Email Routing** → active-le (les enregistrements DNS MX/SPF
   sont ajoutés automatiquement puisque ton DNS est chez Cloudflare).
3. Dans **Destination addresses**, ajoute **contact@associationvivevoix.fr**
   → Cloudflare envoie un e-mail de vérification → clique le lien pour la valider.
   ⚠️ Tant qu'elle n'est pas vérifiée, l'envoi ne marchera pas.

L'envoi vers une adresse de destination vérifiée est **gratuit** sur tous les plans.

---

## Étape 2 — Installer Wrangler et se connecter

Ouvre un terminal dans le dossier de ce projet, puis :

```
npm install
npx wrangler login
```

`wrangler login` ouvre ton navigateur pour autoriser l'accès à ton compte Cloudflare.

---

## Étape 3 — Déployer

```
npx wrangler deploy
```

À la fin, Wrangler affiche l'URL de ton Worker (du type
`https://vivevoix.<ton-sous-domaine>.workers.dev`). Le site est en ligne, formulaire compris.

---

## Étape 4 — Brancher ton domaine

Pour que le site réponde sur **www.associationvivevoix.fr** et pas seulement sur l'URL workers.dev :

1. Dashboard Cloudflare → **Workers & Pages** → ton Worker **vivevoix**
2. Onglet **Settings** → **Domains & Routes** → **Add** → **Custom domain**
3. Saisis `www.associationvivevoix.fr` (et/ou `associationvivevoix.fr`).

> Remarque : ton ancien projet `lingering-butterfly-c91a` servait le site. Une fois ce
> nouveau Worker branché sur le domaine, pense à retirer l'ancienne route pour éviter
> tout conflit.

---

## Modifier le site plus tard

Le workflow ZIP est remplacé par ceci :

1. Édite les fichiers dans le dossier **public/** (c'est ton site : HTML, CSS, images).
2. Relance `npx wrangler deploy`.

C'est tout. Plus besoin de rezipper.

---

## Adresses e-mail dans le code

Dans `src/index.js`, en haut :

- `SENDER_ADDR = "site@associationvivevoix.fr"` — l'expéditeur. Il **doit** appartenir à
  ton domaine (pas besoin de créer une vraie boîte, mais le domaine doit être celui où
  Email Routing est actif).
- `RECIPIENT_ADDR = "contact@associationvivevoix.fr"` — là où tu reçois les messages.
  C'est l'adresse que tu as vérifiée à l'étape 1.

Si tu changes l'adresse de réception, mets-la à jour à **deux endroits** :
`src/index.js` (RECIPIENT_ADDR) **et** `wrangler.jsonc` (destination_address).

---

## En cas de souci

- « Email address not verified » → tu as sauté la vérification de l'étape 1.
- Le formulaire affiche une erreur → ouvre les logs en direct avec `npx wrangler tail`
  pendant que tu testes l'envoi.
- Le site s'affiche mais pas le formulaire → vérifie que le fichier `src/index.js` est
  bien déployé (le message de `wrangler deploy` doit lister les bindings CONTACT_EMAIL et ASSETS).
