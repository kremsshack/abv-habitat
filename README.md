# Site ABV Habitat — mode d'emploi

Ce document est écrit pour quelqu'un qui n'est pas développeur. Il explique
comment regarder le site, ajouter un chantier, changer un texte, et ce qu'il
reste à faire avant la mise en ligne.

Aucun logiciel n'est nécessaire pour modifier le site, sauf un éditeur de texte
correct (Notepad++, Visual Studio Code ou Sublime Text). **N'utilisez pas Word
ni le Bloc-notes de Windows** : ils abîment les accents et les guillemets.

---

## 1. Ce que contient le dossier

```
index.html                 Page d'accueil
realisations.html          Galerie des chantiers
contact.html               Coordonnées et formulaire de devis
mentions-legales.html      Mentions légales
confidentialite.html       Politique de confidentialité
robots.txt                 Instructions pour les moteurs de recherche
sitemap.xml                Liste des pages pour Google
favicon.svg                Petite icône affichée dans l'onglet du navigateur

css/style.css              Toute l'apparence du site (un seul fichier)
js/main.js                 Menu, animations, formulaire
js/galerie.js              Affichage de la galerie

data/realisations.json     >>> LES CHANTIERS SONT ICI <<<
data/realisations-apercu.js  Copie utilisée seulement pour l'aperçu hors ligne

assets/img/                Photos du site (bandeau, carte)
assets/img/realisations/   Photos des chantiers
assets/img/placeholders/   Réserve, vide en V1

CONTENU-A-FOURNIR.md       Ce que le client doit livrer
README.md                  Ce document
```

---

## 2. Regarder le site

### Le plus simple : double-cliquer sur `index.html`

Le site s'ouvre dans votre navigateur. Tout fonctionne : le menu, le formulaire,
la galerie, la visionneuse de photos.

### Pour être exact : lancer un petit serveur local

Quand on ouvre un fichier par double-clic, le navigateur interdit à la galerie de
lire `data/realisations.json` (c'est une règle de sécurité, pas un défaut du site).
Le site bascule alors sur la copie `data/realisations-apercu.js` pour que la
démonstration reste complète.

Pour voir exactement ce que verront les visiteurs, ouvrez un terminal dans ce
dossier et lancez :

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

**Une fois le site en ligne, ce détail disparaît :** seul
`data/realisations.json` est utilisé, et `data/realisations-apercu.js` peut être
supprimé.

---

## 3. Ajouter un chantier dans la galerie

C'est la manipulation la plus fréquente. Elle se fait en deux temps.

### Étape 1 — déposer les photos

Copiez les photos dans le dossier `assets/img/realisations/`.

Le nom du fichier doit suivre cette règle :

```
commune-annee-numero-index.jpg
```

| Morceau  | Règle                                                   | Exemple      |
|----------|---------------------------------------------------------|--------------|
| commune  | minuscules, sans accent, tirets à la place des espaces   | `haguenau`   |
| annee    | 4 chiffres                                               | `2025`       |
| numero   | numéro du chantier dans l'année, sur 2 chiffres          | `01`         |
| index    | numéro de la photo dans ce chantier                      | `1`, `2`…    |

Exemples corrects : `haguenau-2025-01-1.jpg`, `val-de-moder-2023-07-1.jpg`

Format attendu : **1200 × 900 pixels**, format 4/3, en `.jpg`, moins de 400 Ko.

### Étape 2 — déclarer le chantier dans `data/realisations.json`

Ouvrez `data/realisations.json`. Vous verrez une liste de blocs entre accolades,
séparés par des virgules. Copiez un bloc existant, collez-le, et modifiez-le.

```json
{
  "id": "haguenau-2025-01",
  "titre": "Maison individuelle, Haguenau",
  "type": "fenetres",
  "commune": "Haguenau",
  "annee": 2025,
  "description": "12 fenêtres PVC oscillo-battantes en dépose totale.",
  "images": ["assets/img/realisations/haguenau-2025-01-1.jpg"]
}
```

#### Le détail de chaque champ

| Champ         | Type    | Obligatoire | À écrire                                                                 |
|---------------|---------|-------------|--------------------------------------------------------------------------|
| `id`          | texte   | oui         | Identifiant unique, en minuscules : `commune-annee-numero`               |
| `titre`       | texte   | oui         | Ce qui s'affiche en gros. Exemple : `Maison individuelle, Haguenau`      |
| `type`        | texte   | oui         | **Exactement** l'une de ces 4 valeurs (voir ci-dessous)                  |
| `commune`     | texte   | oui         | Nom de la commune, avec majuscule et accents                            |
| `annee`       | nombre  | oui         | 4 chiffres, **sans guillemets**                                          |
| `description` | texte   | oui         | Une phrase courte et concrète. Ce que vous avez posé, en quelle quantité |
| `images`      | liste   | oui         | Un ou plusieurs chemins de photos, entre guillemets, séparés par virgule |

Les 4 valeurs possibles pour `type`, qui pilotent les filtres de la galerie :

- `fenetres` — fenêtres et baies coulissantes
- `portes` — portes d'entrée et portes de service
- `volets` — volets et stores
- `portes-garage` — portes de garage

Attention : c'est écrit sans accent et sans majuscule. `fenetres`, pas `Fenêtres`.

#### Les 5 erreurs qui cassent le fichier

1. **Une virgule en trop** après le dernier bloc, juste avant le `]` final.
2. **Une virgule manquante** entre deux blocs.
3. **Des guillemets courbes** (« ” ») au lieu des guillemets droits (`"`).
   C'est ce que fait Word. Utilisez un vrai éditeur de texte.
4. **Des guillemets autour de l'année** : écrivez `2025`, pas `"2025"`.
5. **Un chemin de photo qui ne correspond pas** au nom réel du fichier.
   Les majuscules comptent sur un serveur.

Si la galerie affiche « Les réalisations n'ont pas pu être chargées », c'est
presque toujours l'une de ces cinq erreurs. Vous pouvez vérifier le fichier en
le collant sur un validateur JSON en ligne.

#### Si vous testez par double-clic

Reportez la même modification dans `data/realisations-apercu.js`, entre les
crochets. Sinon, l'aperçu hors ligne restera sur l'ancienne version. Une fois le
site en ligne, ce fichier ne sert plus.

---

## 4. Remplacer une photo du site (bandeau, carte)

Les photos qui ne sont pas des chantiers vont dans `assets/img/`.

Tant que le fichier n'existe pas, un rectangle gris s'affiche avec le nom du
fichier attendu. **Dès que vous déposez le fichier au bon nom, la photo remplace
le rectangle automatiquement.** Il n'y a rien à modifier dans le code.

| Emplacement                | Nom du fichier attendu           | Dimensions   |
|----------------------------|----------------------------------|--------------|
| Grande photo de l'accueil  | `assets/img/hero-chantier.jpg`   | 1920 × 1080  |
| Carte de la page Contact   | `assets/img/carte-zone.png`      | 800 × 600    |
| Photos de chantier         | `assets/img/realisations/…`      | 1200 × 900   |

---

## 5. Modifier un texte

Ouvrez la page concernée (`index.html`, `contact.html`…) dans votre éditeur de
texte, cherchez la phrase avec `Ctrl + F`, remplacez-la, enregistrez.

Ne touchez pas à ce qui est entre chevrons (`<p>`, `<h2>`, `<div class="…">`) :
ce sont les balises qui tiennent la mise en page. Modifiez uniquement le texte
entre elles.

Les grands blocs sont repérés par des commentaires du type :

```html
<!-- ================================================================
     Zone d'intervention
     ================================================================ -->
```

### Les textes à remplacer partout

Ces valeurs sont des **remplaçants provisoires**. Utilisez « Rechercher et
remplacer dans tous les fichiers » de votre éditeur :

| À chercher              | À remplacer par                    | Où                                    |
|-------------------------|------------------------------------|---------------------------------------|
| `03 88 XX XX XX`        | le vrai numéro                     | toutes les pages                      |
| `tel:+3338800000`       | `tel:+33` puis le numéro sans le 0 | toutes les pages                      |
| `contact@abvhabitat.fr` | la vraie adresse e-mail            | toutes les pages                      |
| `[Adresse à compléter]` | l'adresse du siège                 | pieds de page et contact              |
| `#lien-google-a-fournir`| l'URL de la fiche Google           | `index.html` (bouton « Laisser un avis ») |
| `#lien-instagram-a-fournir` | l'URL du compte Instagram      | pieds de page                         |
| `www.abvhabitat.fr`     | le vrai domaine                    | `robots.txt`, `sitemap.xml`, `index.html` (bloc JSON-LD) |

Tout ce qui est encadré et écrit `[À COMPLÉTER]` dans les pages légales doit
également être renseigné.

---

## 6. Avant la mise en ligne — à faire absolument

- [ ] **Compléter les mentions légales.** SIRET, RCS, capital, adresse du siège,
      nom du gérant, coordonnées de l'hébergeur. Ces mentions sont **obligatoires**
      pour tout site professionnel en France (article 6-III de la LCEN). Un site
      en ligne sans elles expose l'entreprise à une sanction.
- [ ] **Compléter la politique de confidentialité.** Nom de l'hébergeur et du
      fournisseur de messagerie. Obligatoire dès qu'un formulaire collecte des
      données (RGPD).
- [ ] **Renseigner l'assurance décennale** dans les mentions légales : assureur,
      numéro de contrat, couverture géographique. C'est une obligation d'affichage
      pour les entreprises du bâtiment.
- [ ] **Nommer un médiateur de la consommation** dans les mentions légales.
      Obligatoire pour toute entreprise vendant à des particuliers.
- [ ] **Remplacer tous les remplaçants provisoires** du tableau ci-dessus.
- [ ] **Brancher le formulaire.** Aujourd'hui il valide la saisie et affiche une
      confirmation, mais **n'envoie rien**. Voir la section 8.
- [ ] **Mettre le domaine réel** dans `robots.txt`, `sitemap.xml` et dans le bloc
      JSON-LD en bas d'`index.html`.
- [ ] **Ajouter les balises `<link rel="canonical">`** sur les trois pages
      publiques une fois le domaine connu. Elles ont été volontairement omises
      pour ne pas pointer vers un domaine faux.
- [ ] **Activer HTTPS** chez l'hébergeur (certificat gratuit Let's Encrypt en
      général inclus).
- [ ] **Arbitrer la question des polices Google.** Voir la section 7.
- [ ] **Déclarer le site** dans Google Search Console et le relier à la fiche
      Google Business Profile.

---

## 7. Les polices Google — un point à trancher

Le site charge ses deux polices (Barlow Condensed et Inter) depuis les serveurs
de Google. À ce moment-là, l'adresse IP du visiteur est transmise à Google.
Aucun cookie n'est déposé, mais des tribunaux européens ont déjà considéré cette
transmission comme un traitement de données nécessitant un consentement.

Deux options :

1. **Laisser tel quel.** C'est ce que fait l'immense majorité des sites. Le
   risque est faible mais réel. La politique de confidentialité le mentionne.
2. **Héberger les polices sur le serveur du site.** Il faut télécharger les
   fichiers de police, les placer dans `assets/fonts/`, remplacer le `<link>`
   Google par des règles `@font-face` dans `css/style.css`, et supprimer le
   paragraphe correspondant de la page confidentialité. C'est une demi-heure de
   travail pour un développeur, et cela supprime aussi une requête externe
   (le site se charge un peu plus vite).

L'option 2 est recommandée.

---

## 8. Brancher le formulaire (à faire par un développeur)

Le formulaire est déjà construit pour ça :

- il utilise `<form method="post" action="">` — il suffit de mettre l'adresse du
  script de traitement dans `action` ;
- tous les champs ont un attribut `name` explicite (`nom`, `telephone`, `email`,
  `commune`, `code_postal`, `profil`, `projet[]`, `nombre_ouvertures`,
  `materiau`, `type_travaux`, `echeance`, `precisions`, `photos[]`, `rgpd`) ;
- l'attribut `enctype="multipart/form-data"` est déjà en place pour l'envoi des
  photos.

Côté serveur, il restera à : revalider **toutes** les données (la validation
JavaScript actuelle ne protège de rien, elle est là pour le confort de
l'utilisateur), ajouter une protection anti-robot, limiter la taille et le type
des fichiers reçus, envoyer l'e-mail, et retirer la mention
« Maquette — le formulaire n'envoie pas encore de message. » dans
`contact.html`.

---

## 9. Préparer le panneau d'administration (V2)

Le site a été construit pour qu'un panneau en PHP puisse être ajouté plus tard
sans toucher au reste. Ce panneau n'aura que deux choses à faire :

1. **Écrire dans `data/realisations.json`.** Aucun chantier n'est écrit en dur
   dans le HTML. C'est le seul fichier de données du site.
2. **Déposer les images dans `assets/img/realisations/`**, en respectant la
   convention de nommage `commune-annee-numero-index.jpg`.

### Schéma d'un chantier

```json
{
  "id":          "chaine, unique, minuscules, format commune-annee-numero",
  "titre":       "chaine",
  "type":        "chaine — une valeur parmi : fenetres | portes | volets | portes-garage",
  "commune":     "chaine",
  "annee":       2025,
  "description": "chaine, une phrase",
  "images":      ["chaine — chemin relatif depuis la racine du site"]
}
```

Le fichier est un **tableau JSON** de ces objets, encodé en UTF-8.

Le tri est fait par le site lui-même, du plus récent au plus ancien : l'ordre des
objets dans le fichier n'a pas d'importance.

Le panneau devra veiller à : garder l'encodage UTF-8, écrire de façon atomique
(fichier temporaire puis renommage) pour ne jamais laisser un JSON à moitié
écrit, et refuser un `type` qui ne fait pas partie des quatre valeurs autorisées.

Si de nouveaux types sont ajoutés plus tard, il faudra aussi ajouter le libellé
correspondant dans `js/galerie.js` (constante `LIBELLES_TYPE`) et un bouton de
filtre dans `realisations.html`.

---

## 10. Notes techniques

### Couleurs et contraste

La palette imposée est définie en haut de `css/style.css`. Trois nuances ont été
ajoutées pour respecter le niveau AA d'accessibilité (contraste suffisant pour
être lu par une personne de plus de 50 ans ou par temps de forte luminosité) :

- `--laiton-texte` (`#8A6A38`) : le laiton d'origine `#B08D57` n'atteint que
  2,9:1 sur fond clair, en dessous du minimum de 4,5:1. Cette nuance plus sombre
  atteint 4,7:1 et sert **uniquement au texte**.
- `--gris-sur-sombre` (`#A8ADB2`) : texte secondaire sur les fonds anthracite.
- `--blanc` (`#FFFFFF`) : fond des cartes. Le gris clair `#E8E9E7` ne permettait
  pas d'y poser du texte secondaire de façon lisible.

Le laiton d'origine est conservé tel quel pour les aplats de boutons, les
séparateurs et les puces.

### Ce que le site ne fait pas

- Aucun cookie, aucun `localStorage`, aucun traceur.
- Aucun appel réseau sortant, hormis le chargement des polices Google.
- Aucune dépendance : ni jQuery, ni framework, ni `npm install`.
- Le fichier `css/style.css` et les deux fichiers JavaScript sont lisibles et
  commentés. Ils ne sont pas minifiés, pour rester modifiables.

### Compatibilité

Testé de 320 px (petit téléphone) à 1920 px. Fonctionne sur les versions
récentes de Chrome, Firefox, Edge et Safari.
