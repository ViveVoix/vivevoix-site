# Vive Voix — Projet du site (version simple)

Tous les fichiers sont à la racine, pas de sous-dossiers : c'est fait exprès
pour que l'upload sur GitHub soit facile.

## Les fichiers
- Les .html, .css, .js, images .png/.jpg = le SITE.
- worker.js = le code qui sert le site et envoie les e-mails du formulaire.
- wrangler.jsonc = la configuration Cloudflare.
- .assetsignore = dit à Cloudflare de ne PAS publier les fichiers techniques.

## Modifier le site plus tard
1. Sur GitHub, ouvre le fichier (ex : index.html), clique le crayon (Edit).
2. Modifie, puis "Commit changes".
3. Cloudflare redéploie tout seul en 1-2 minutes.

Voir GUIDE-DEPLOIEMENT.md pour l'activation d'Email Routing.
