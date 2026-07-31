# Lyric Studio

Application web pour créer des vidéos de paroles synchronisées avec spectre audio,
sur une image ou une vidéo de fond. Tout le traitement se fait dans le navigateur :
aucun fichier n'est envoyé sur un serveur.

Projet indépendant, sans lien avec SIRA.

## Contenu du dépôt

```
index.html      l'application entière (HTML + CSS + JS)
manifest.json   déclaration PWA (nom, icônes, couleurs)
sw.js           service worker : fonctionne hors connexion
vercel.json     en-têtes de cache
icons/          jeu d'icônes 192 / 512 / maskable / Apple
```

Aucune dépendance, aucune étape de build, aucune fonction serverless.

## Mise en ligne sur Vercel

1. Crée un dépôt GitHub `lyric-studio` et dépose ces fichiers à la racine.
2. Sur vercel.com : **Add New → Project → Import** ce dépôt.
3. Framework Preset : **Other**. Laisse Build Command et Output Directory vides.
4. **Deploy**.

Tu obtiens une adresse en `https://…vercel.app`. Le HTTPS est indispensable :
c'est lui qui débloque le micro, l'enregistrement vidéo et l'installation.

## Installer sur le téléphone

Ouvre l'adresse dans Chrome, puis le bouton **Installer** en haut à droite
(ou menu ⋮ → Ajouter à l'écran d'accueil). L'application s'ouvre ensuite
en plein écran, sans barre d'adresse, et fonctionne sans connexion.

## Comment s'en servir

1. **Audio** — charge le fichier son, renseigne titre et artiste.
2. **Paroles** — colle le texte, une phrase par ligne.
3. **Synchro** — lance la lecture, tape le bouton au début de chaque phrase.
   Sauvegarde le projet en `.json` pour ne pas perdre ce travail.
4. **Fond** — image ou vidéo, assombrissement, flou, zoom lent, pulsation.
5. **Style** — type de spectre, couleurs, police, effets d'apparition.
6. **Export** — enregistre la vidéo en `.webm`.

## À savoir

- La synchronisation est manuelle. Un alignement automatique demanderait une
  transcription côté serveur (type Whisper), ajoutable plus tard.
- L'export se fait en temps réel : 3 minutes de son = 3 minutes d'enregistrement.
  Garde l'application au premier plan pendant toute la durée.
- Le fichier produit est en `.webm`. Pour du `.mp4`, réimporte-le dans CapCut
  et exporte depuis là.
- Après une mise à jour du code, le service worker sert l'ancienne version
  jusqu'au rechargement suivant. Change `VERSION` dans `sw.js` pour forcer.
