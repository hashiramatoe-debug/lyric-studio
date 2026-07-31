# Lyric Studio

Application web pour créer des vidéos de paroles synchronisées avec spectre audio,
sur une image ou une vidéo de fond. Tout le traitement se fait dans le navigateur :
aucun fichier n'est envoyé sur un serveur.

Projet indépendant, sans lien avec SIRA.

## Contenu du dépôt

```
index.html      l'application entière (HTML + CSS + JS)
api/transcribe.js  transcription automatique (fonction serverless)
manifest.json   déclaration PWA (nom, icônes, couleurs)
sw.js           service worker : fonctionne hors connexion
vercel.json     en-têtes de cache
icons/          jeu d'icônes 192 / 512 / maskable / Apple
```

Aucune dépendance, aucune étape de build. Une seule fonction serverless,
uniquement pour la transcription automatique.

## Mise en ligne sur Vercel

1. Crée un dépôt GitHub `lyric-studio` et dépose ces fichiers à la racine.
2. Sur vercel.com : **Add New → Project → Import** ce dépôt.
3. Framework Preset : **Other**. Laisse Build Command et Output Directory vides.
4. **Deploy**.
5. Pour la transcription automatique : **Settings → Environment Variables**,
   ajoute `OPENAI_API_KEY` avec ta clé OpenAI, puis redéploie.
   Sans cette clé, tout le reste de l'application fonctionne normalement.

Tu obtiens une adresse en `https://…vercel.app`. Le HTTPS est indispensable :
c'est lui qui débloque le micro, l'enregistrement vidéo et l'installation.

## Installer sur le téléphone

Ouvre l'adresse dans Chrome, puis le bouton **Installer** en haut à droite
(ou menu ⋮ → Ajouter à l'écran d'accueil). L'application s'ouvre ensuite
en plein écran, sans barre d'adresse, et fonctionne sans connexion.

## Comment s'en servir

1. **Audio** — charge le fichier son, renseigne titre et artiste.
2. **Paroles** — colle le texte, une phrase par ligne.
3. **Auto** — transcription automatique. Deux modes : caler tes propres paroles
   sur l'audio, ou laisser l'application écrire le texte à ta place.
4. **Synchro** — correction manuelle des repères, ou synchronisation au tap.
   Sauvegarde le projet en `.json` pour ne pas perdre ce travail.
5. **Fond** — image ou vidéo, assombrissement, flou, zoom lent, pulsation.
6. **Style** — type de spectre, couleurs, police, effets d'apparition.
7. **Export** — enregistre la vidéo en `.webm`.

## À savoir

- La transcription coûte environ 0,006 $ par minute d'audio traitée.
  Sur une chanson, les mots couverts par la musique sont parfois mal reconnus :
  relis toujours le texte. Les repères de temps, eux, restent fiables.
- L'export se fait en temps réel : 3 minutes de son = 3 minutes d'enregistrement.
  Garde l'application au premier plan pendant toute la durée.
- Le fichier produit est en `.webm`. Pour du `.mp4`, réimporte-le dans CapCut
  et exporte depuis là.
- Après une mise à jour du code, le service worker sert l'ancienne version
  jusqu'au rechargement suivant. Change `VERSION` dans `sw.js` pour forcer.
