/* ==========================================================================
   Copie de secours des realisations — APERCU LOCAL UNIQUEMENT
   --------------------------------------------------------------------------
   La source de verite est et reste `data/realisations.json`.
   Ce fichier n'existe que pour une seule raison : quand on ouvre le site en
   double-cliquant sur index.html (adresse en « file:// »), les navigateurs
   interdisent la lecture d'un fichier JSON par JavaScript. La galerie serait
   alors vide pendant la demonstration.

   Une fois le site en ligne (http:// ou https://), ce fichier n'est JAMAIS lu :
   seul `data/realisations.json` compte. Le futur panel d'administration ne doit
   ecrire que dans le JSON.

   Si vous modifiez `data/realisations.json` et que vous voulez que l'apercu par
   double-clic reste a jour, recopiez le contenu du JSON entre les crochets
   ci-dessous. Sinon, ignorez ce fichier : il peut meme etre supprime apres la
   mise en ligne.
   ========================================================================== */

window.ABV_REALISATIONS_APERCU = [
  {
    "id": "haguenau-2025-01",
    "titre": "Maison individuelle, Haguenau",
    "type": "fenetres",
    "commune": "Haguenau",
    "annee": 2025,
    "description": "12 fenêtres PVC oscillo-battantes en dépose totale.",
    "images": [
      "assets/img/realisations/haguenau-2025-01-1.jpg",
      "assets/img/realisations/haguenau-2025-01-2.jpg"
    ]
  },
  {
    "id": "brumath-2025-02",
    "titre": "Maison individuelle, Brumath",
    "type": "portes",
    "commune": "Brumath",
    "annee": 2025,
    "description": "Porte d'entrée aluminium avec vitrage latéral fixe.",
    "images": [
      "assets/img/realisations/brumath-2025-02-1.jpg"
    ]
  },
  {
    "id": "bischwiller-2025-03",
    "titre": "Maison de ville, Bischwiller",
    "type": "volets",
    "commune": "Bischwiller",
    "annee": 2025,
    "description": "Remplacement de 8 volets battants bois par des volets roulants aluminium.",
    "images": [
      "assets/img/realisations/bischwiller-2025-03-1.jpg"
    ]
  },
  {
    "id": "schweighouse-2024-04",
    "titre": "Maison individuelle, Schweighouse-sur-Moder",
    "type": "fenetres",
    "commune": "Schweighouse-sur-Moder",
    "annee": 2024,
    "description": "Baie coulissante aluminium 3 vantaux, 3,60 m de large, sur terrasse existante.",
    "images": [
      "assets/img/realisations/schweighouse-2024-04-1.jpg",
      "assets/img/realisations/schweighouse-2024-04-2.jpg"
    ]
  },
  {
    "id": "soufflenheim-2024-05",
    "titre": "Maison individuelle, Soufflenheim",
    "type": "portes-garage",
    "commune": "Soufflenheim",
    "annee": 2024,
    "description": "Porte de garage sectionnelle motorisée, dépose d'une porte basculante.",
    "images": [
      "assets/img/realisations/soufflenheim-2024-05-1.jpg"
    ]
  },
  {
    "id": "niederbronn-2024-06",
    "titre": "Maison alsacienne, Niederbronn-les-Bains",
    "type": "fenetres",
    "commune": "Niederbronn-les-Bains",
    "annee": 2024,
    "description": "9 fenêtres bois-alu en rénovation, dormants existants conservés.",
    "images": [
      "assets/img/realisations/niederbronn-2024-06-1.jpg"
    ]
  },
  {
    "id": "val-de-moder-2023-07",
    "titre": "Maison individuelle, Val-de-Moder",
    "type": "volets",
    "commune": "Val-de-Moder",
    "annee": 2023,
    "description": "Volets roulants solaires posés sur 6 ouvertures, sans travaux électriques.",
    "images": [
      "assets/img/realisations/val-de-moder-2023-07-1.jpg"
    ]
  },
  {
    "id": "wissembourg-2023-08",
    "titre": "Maison de ville, Wissembourg",
    "type": "portes",
    "commune": "Wissembourg",
    "annee": 2023,
    "description": "Porte d'entrée bois sur mesure et porte de service aluminium.",
    "images": [
      "assets/img/realisations/wissembourg-2023-08-1.jpg"
    ]
  }
];
