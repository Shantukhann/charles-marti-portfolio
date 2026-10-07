# Site de Charles Marti : mode d'emploi

## Fichiers à mettre en ligne (ensemble, dans le même dossier)

```
index.html
motion.css
motion.js
i18n.js
CV_Charles_MARTI.pdf
images/
    CK-SD-PA.jpg
    Diner-500-personnes-PA.jpg
    soiree-etudiante.jpg
    evenement-entreprise.jpg
    scenographie.jpg
    diner-gala.jpg
    seminaire.jpg
    lumiere-son.jpg
    miniature-video.jpg   (seulement si vous ajoutez la vidéo)
```

`serve.ps1` et le dossier `.claude/` ne servent qu'à l'aperçu local : ne pas les publier.

## À faire avant de publier

1. **Photos** : mettre les vraies images dans `images/` (noms identiques à ceux ci-dessus).
   Idéal : JPG de 1600 px de large maximum, moins de 400 Ko chacune.
2. **Vidéo YouTube** : dans `index.html`, remplacer `VIDEO_ID_ICI` par l'identifiant de la vidéo.
   Tant que ce n'est pas fait, la tuile vidéo reste masquée automatiquement.
3. **Aperçu de partage (LinkedIn, WhatsApp)** : dans `index.html`, décommenter la ligne
   `og:image` et remplacer `TON-DOMAINE` par votre adresse.
4. **Cache** : si vous modifiez `motion.css` ou `motion.js`, changez le numéro `?v=35`
   dans `index.html` pour que les visiteurs recoivent la nouvelle version.

## Mise en ligne gratuite (au choix)

- **Netlify** : netlify.com/drop, glisser-déposer le dossier. Le site est en ligne en 30 secondes.
- **GitHub Pages** : créer un dépôt, déposer les fichiers, Settings > Pages > branche `main`.
- **Vercel** : importer le dépôt GitHub.

Un nom de domaine (ex. charlesmarti.fr) se branche ensuite dans les réglages de l'hébergeur.

## Réglages utiles (dans `motion.js`)

| Effet | Où |
|---|---|
| Vitesse du fluide de transition | `go(0, 1, 1100)` et `go(1, 2, 1100)` dans `initFluidOverlay` |
| Pause du logo avant la sortie | `setTimeout(uncover, 420)` |
| Épaisseur / nombre des coulées | `tongueCell` et `shapeA` (colonnes `2.8`, `6.3`, `13.`) |
| Couleurs du fond et du fluide | objet `palettes` (3 pages) |
| Vitesse du fond fluide | `tAcc += dt * 0.08` |
| Mode allégé (mobile, appareils modestes) | constante `lite` en haut du fichier |

Le site respecte le réglage « réduire les animations » du système : dans ce cas, aucune animation ne se lance.

## Ajouter une réalisation (page Réalisations)

1. Déposez la photo dans le dossier `images/`.
2. Dans `index.html`, cherchez `PROJECTS` et ajoutez une ligne :
   `{ src: 'images/ma-photo.jpg', cat: 'galas', title: 'Titre', sub: 'Détail · 500 participants', caption: 'Légende affichée en grand' },`
3. Pour une vidéo YouTube : `{ video: 'ID_DE_LA_VIDEO', cat: 'corporate', title: '...', sub: '...', caption: '...' },`
   (la miniature est récupérée automatiquement).
4. Catégories : `galas`, `corporate`, `lieux`. Les filtres n'apparaissent que si au moins deux catégories contiennent des supports.

Une image absente du dossier n'est simplement pas affichée : vous pouvez donc publier le site avant d'avoir tous vos supports.
## Mode sombre et version anglaise

- Deux boutons dans la barre de navigation : **EN / FR** (langue) et **lune / soleil** (thème).
- Le choix du visiteur est mémorisé dans son navigateur. Par défaut : thème du système (clair ou sombre) et
  langue du navigateur (français si le navigateur est en français, sinon anglais).
- On peut forcer la langue dans un lien : `https://votre-site.fr/?lang=en` ou `?lang=fr`.
- Les traductions sont dans `i18n.js` (dictionnaire `EN` : texte français à gauche, anglais à droite).
  Si vous modifiez un texte français dans `index.html`, modifiez-le aussi à gauche dans ce dictionnaire,
  sinon il restera en français dans la version anglaise.
- Les réalisations ont leur traduction dans la liste `PROJECTS` (champ `en`).
- Le CV téléchargeable (`CV_Charles_MARTI.pdf`) est le même dans les deux langues. Pour une version anglaise,
  ajoutez un fichier `CV_Charles_MARTI_EN.pdf` et dites-le-moi : je ferai suivre le lien automatiquement.