/* ==========================================================================
   ABV HABITAT — galerie des realisations
   --------------------------------------------------------------------------
   Toutes les donnees viennent de `data/realisations.json`. Aucun chantier
   n'est ecrit en dur dans le HTML : ajouter un chantier = ajouter un objet
   dans le JSON. C'est ce fichier que le futur panel d'administration
   modifiera.

   Ce script alimente deux emplacements :
     - [data-galerie="apercu"]   : les 3 chantiers les plus recents (accueil)
     - [data-galerie="complete"] : la galerie filtrable (page realisations)

   Il fournit aussi la visionneuse (lightbox) : clavier, piege de focus,
   retour du focus au declencheur. Aucune librairie externe.
   ========================================================================== */

(function () {
  'use strict';

  var LIBELLES_TYPE = {
    'fenetres': 'Fenêtres',
    'portes': 'Portes',
    'volets': 'Volets',
    'portes-garage': 'Portes de garage'
  };

  // Dimensions attendues des photos de chantier, affichees dans les
  // emplacements vides pour guider le client.
  var DIMENSIONS_PHOTO = '1200×900';

  var chantiers = [];
  var diaporama = [];      // liste a plat des photos actuellement parcourables
  var indexCourant = 0;
  var declencheur = null;  // element a re-focaliser a la fermeture
  var boite = null;

  /* ------------------------------------------------------------------
     Chargement des donnees
     ------------------------------------------------------------------
     En ligne (http/https) : lecture de data/realisations.json.
     En ouverture directe du fichier (file://) : les navigateurs interdisent
     cette lecture. On bascule alors sur data/realisations-apercu.js, qui
     n'est la que pour la demonstration hors ligne. Voir le README.
     ------------------------------------------------------------------ */

  function chargerDonnees() {
    return fetch('data/realisations.json', { cache: 'no-cache' })
      .then(function (reponse) {
        if (!reponse.ok) throw new Error('Statut ' + reponse.status);
        return reponse.json();
      })
      .catch(function (erreur) {
        if (Array.isArray(window.ABV_REALISATIONS_APERCU)) {
          if (window.location.protocol === 'file:') {
            console.info(
              'ABV : ouverture locale du fichier — les réalisations sont lues '
              + 'depuis data/realisations-apercu.js. En ligne, seul '
              + 'data/realisations.json est utilisé.'
            );
          } else {
            console.warn('ABV : data/realisations.json illisible (' + erreur.message
              + '), repli sur la copie d’aperçu.');
          }
          return window.ABV_REALISATIONS_APERCU;
        }
        throw erreur;
      });
  }

  /* ------------------------------------------------------------------
     Fabrication des elements
     ------------------------------------------------------------------ */

  function nomFichier(chemin) {
    return chemin.split('/').pop();
  }

  function creerEmplacement(chemin, alt, classeRatio) {
    var bloc = document.createElement('div');
    bloc.className = 'emplacement ' + (classeRatio || 'emplacement--4-3');
    bloc.setAttribute('data-src', chemin);
    bloc.setAttribute('data-alt', alt);

    var libelle = document.createElement('span');
    libelle.className = 'emplacement__libelle';
    libelle.textContent = nomFichier(chemin) + ' — ' + DIMENSIONS_PHOTO;
    bloc.appendChild(libelle);

    return bloc;
  }

  function texteAlternatif(chantier, indexImage) {
    var base = LIBELLES_TYPE[chantier.type] || 'Chantier';
    return base + ' — ' + chantier.titre + ', ' + chantier.annee
      + (indexImage > 0 ? ' (photo ' + (indexImage + 1) + ')' : '');
  }

  function creerCarte(chantier, positionDiaporama) {
    var item = document.createElement('li');
    item.className = 'chantier fondu';

    var figure = document.createElement('figure');
    figure.className = 'chantier__visuel';

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'chantier__bouton';
    bouton.setAttribute('data-position', String(positionDiaporama));
    bouton.setAttribute(
      'aria-label',
      'Agrandir : ' + chantier.titre + ', ' + (LIBELLES_TYPE[chantier.type] || '')
        + ', ' + chantier.annee
    );
    bouton.appendChild(
      creerEmplacement(chantier.images[0], texteAlternatif(chantier, 0), 'emplacement--4-3')
    );
    figure.appendChild(bouton);

    if (chantier.images.length > 1) {
      var compteur = document.createElement('span');
      compteur.className = 'chantier__nombre';
      compteur.textContent = chantier.images.length + ' photos';
      figure.appendChild(compteur);
    }

    item.appendChild(figure);

    var corps = document.createElement('div');
    corps.className = 'chantier__corps';

    var meta = document.createElement('p');
    meta.className = 'chantier__meta';
    var typeSpan = document.createElement('span');
    typeSpan.textContent = LIBELLES_TYPE[chantier.type] || chantier.type;
    var anneeSpan = document.createElement('span');
    anneeSpan.className = 'chantier__annee';
    anneeSpan.textContent = String(chantier.annee);
    meta.appendChild(typeSpan);
    meta.appendChild(anneeSpan);
    corps.appendChild(meta);

    var titre = document.createElement('h3');
    titre.className = 'chantier__titre';
    titre.textContent = chantier.titre;
    corps.appendChild(titre);

    var description = document.createElement('p');
    description.className = 'chantier__description';
    description.textContent = chantier.description;
    corps.appendChild(description);

    item.appendChild(corps);
    return item;
  }

  /* ------------------------------------------------------------------
     Rendu des listes
     ------------------------------------------------------------------ */

  function construireDiaporama(liste) {
    var photos = [];
    liste.forEach(function (chantier) {
      chantier.images.forEach(function (chemin, index) {
        photos.push({
          chemin: chemin,
          alt: texteAlternatif(chantier, index),
          chantier: chantier,
          rang: index
        });
      });
    });
    return photos;
  }

  function rendre(conteneur, liste, animer) {
    conteneur.textContent = '';
    diaporama = construireDiaporama(liste);

    var position = 0;
    liste.forEach(function (chantier) {
      var carte = creerCarte(chantier, position);
      if (!animer) carte.classList.add('est-visible');
      conteneur.appendChild(carte);
      position += chantier.images.length;
    });

    if (window.ABV && window.ABV.initEmplacements) {
      window.ABV.initEmplacements(conteneur);
    }
    if (window.ABV && window.ABV.observerFondus) {
      window.ABV.observerFondus(conteneur);
    }

    // Meme reference de fonction a chaque rendu : pas de doublon d'ecouteur.
    conteneur.addEventListener('click', surClicCarte);
  }

  function surClicCarte(evenement) {
    var bouton = evenement.target.closest('.chantier__bouton');
    if (!bouton) return;
    ouvrirVisionneuse(parseInt(bouton.getAttribute('data-position'), 10), bouton);
  }

  /* ------------------------------------------------------------------
     Visionneuse (lightbox)
     ------------------------------------------------------------------ */

  function creerVisionneuse() {
    boite = document.createElement('div');
    boite.className = 'lightbox';
    boite.setAttribute('role', 'dialog');
    boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-label', 'Photo de chantier en grand format');

    boite.innerHTML =
      '<div class="lightbox__barre">'
      + '<p class="lightbox__position" data-role="position"></p>'
      + '<button type="button" class="lightbox__fermer" data-role="fermer">Fermer</button>'
      + '</div>'
      + '<div class="lightbox__scene">'
      + '<button type="button" class="lightbox__nav" data-role="precedent" aria-label="Photo précédente">&#8592;</button>'
      + '<figure class="lightbox__figure">'
      + '<div data-role="media"></div>'
      + '<figcaption class="lightbox__legende" data-role="legende"></figcaption>'
      + '</figure>'
      + '<button type="button" class="lightbox__nav" data-role="suivant" aria-label="Photo suivante">&#8594;</button>'
      + '</div>'
      + '<p class="lightbox__aide">Flèches gauche et droite pour naviguer, Échap pour fermer.</p>';

    document.body.appendChild(boite);

    boite.querySelector('[data-role="fermer"]').addEventListener('click', fermerVisionneuse);
    boite.querySelector('[data-role="precedent"]').addEventListener('click', function () {
      allerA(indexCourant - 1);
    });
    boite.querySelector('[data-role="suivant"]').addEventListener('click', function () {
      allerA(indexCourant + 1);
    });

    // Clic sur le fond : fermeture.
    boite.addEventListener('mousedown', function (evenement) {
      if (evenement.target === boite) fermerVisionneuse();
    });

    boite.addEventListener('keydown', surToucheVisionneuse);
    return boite;
  }

  function elementsFocalisables() {
    return Array.prototype.filter.call(
      boite.querySelectorAll('button'),
      function (element) { return !element.disabled; }
    );
  }

  function surToucheVisionneuse(evenement) {
    if (evenement.key === 'Escape') {
      evenement.preventDefault();
      fermerVisionneuse();
      return;
    }

    if (evenement.key === 'ArrowLeft') {
      evenement.preventDefault();
      allerA(indexCourant - 1);
      return;
    }

    if (evenement.key === 'ArrowRight') {
      evenement.preventDefault();
      allerA(indexCourant + 1);
      return;
    }

    // Piege de focus : le clavier ne sort pas de la visionneuse.
    if (evenement.key === 'Tab') {
      var focalisables = elementsFocalisables();
      if (!focalisables.length) return;
      var premier = focalisables[0];
      var dernier = focalisables[focalisables.length - 1];

      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    }
  }

  function allerA(index) {
    if (!diaporama.length) return;
    if (index < 0 || index >= diaporama.length) return;

    indexCourant = index;
    var photo = diaporama[index];

    var media = boite.querySelector('[data-role="media"]');
    media.textContent = '';
    media.appendChild(creerEmplacement(photo.chemin, photo.alt, 'emplacement--4-3'));
    if (window.ABV && window.ABV.initEmplacements) {
      window.ABV.initEmplacements(media);
    }

    var legende = boite.querySelector('[data-role="legende"]');
    legende.textContent = '';
    var meta = document.createElement('span');
    meta.className = 'lightbox__legende-meta';
    meta.textContent = (LIBELLES_TYPE[photo.chantier.type] || photo.chantier.type)
      + ' · ' + photo.chantier.commune + ' · ' + photo.chantier.annee;
    legende.appendChild(meta);
    legende.appendChild(document.createTextNode(photo.chantier.description));

    boite.querySelector('[data-role="position"]').textContent =
      'Photo ' + (index + 1) + ' sur ' + diaporama.length;

    var precedent = boite.querySelector('[data-role="precedent"]');
    var suivant = boite.querySelector('[data-role="suivant"]');
    precedent.disabled = index === 0;
    suivant.disabled = index === diaporama.length - 1;

    // Si le bouton qui avait le focus vient d'etre desactive, on repositionne.
    if (document.activeElement && document.activeElement.disabled) {
      boite.querySelector('[data-role="fermer"]').focus();
    }
  }

  // Le reste de la page est neutralise pendant l'ouverture : ni clavier,
  // ni lecteur d'ecran ne peuvent en sortir. Complete le piege de focus.
  function neutraliserFond(actif) {
    var blocs = document.querySelectorAll(
      'body > header, body > main, body > footer, body > .lien-evitement'
    );
    for (var i = 0; i < blocs.length; i++) {
      if (actif) {
        blocs[i].setAttribute('inert', '');
        blocs[i].setAttribute('aria-hidden', 'true');
      } else {
        blocs[i].removeAttribute('inert');
        blocs[i].removeAttribute('aria-hidden');
      }
    }
  }

  function ouvrirVisionneuse(position, source) {
    if (!diaporama.length) return;
    if (!boite) creerVisionneuse();

    declencheur = source || null;
    boite.classList.add('est-ouverte');
    document.body.style.overflow = 'hidden';
    neutraliserFond(true);
    allerA(Math.min(Math.max(position, 0), diaporama.length - 1));
    boite.querySelector('[data-role="fermer"]').focus();
  }

  function fermerVisionneuse() {
    if (!boite) return;
    boite.classList.remove('est-ouverte');
    document.body.style.overflow = '';
    // Rendre la page utilisable avant de lui redonner le focus.
    neutraliserFond(false);
    if (declencheur && document.contains(declencheur)) declencheur.focus();
    declencheur = null;
  }

  /* ------------------------------------------------------------------
     Filtres
     ------------------------------------------------------------------ */

  function initFiltres(conteneur) {
    var barre = document.querySelector('.filtres');
    if (!barre) return;

    var compte = document.querySelector('.galerie__compte');

    function appliquer(valeur) {
      var liste = valeur === 'tout'
        ? chantiers
        : chantiers.filter(function (chantier) { return chantier.type === valeur; });

      rendre(conteneur, liste, false);

      if (compte) {
        if (!liste.length) {
          compte.textContent = 'Aucun chantier pour ce filtre.';
        } else if (liste.length === 1) {
          compte.textContent = '1 chantier affiché.';
        } else {
          compte.textContent = liste.length + ' chantiers affichés.';
        }
      }
    }

    barre.addEventListener('click', function (evenement) {
      var bouton = evenement.target.closest('.filtres__bouton');
      if (!bouton) return;

      var boutons = barre.querySelectorAll('.filtres__bouton');
      for (var i = 0; i < boutons.length; i++) {
        boutons[i].setAttribute('aria-pressed', boutons[i] === bouton ? 'true' : 'false');
      }
      appliquer(bouton.getAttribute('data-filtre'));
    });
  }

  /* ------------------------------------------------------------------
     Demarrage
     ------------------------------------------------------------------ */

  function afficherEchec(conteneur) {
    var message = document.createElement('li');
    message.className = 'galerie__message';
    message.textContent = 'Les réalisations n’ont pas pu être chargées. '
      + 'Vérifiez que le fichier data/realisations.json est bien présent et valide.';
    conteneur.textContent = '';
    conteneur.appendChild(message);
  }

  function demarrer() {
    var apercu = document.querySelector('[data-galerie="apercu"]');
    var complete = document.querySelector('[data-galerie="complete"]');
    if (!apercu && !complete) return;

    chargerDonnees()
      .then(function (donnees) {
        if (!Array.isArray(donnees)) throw new Error('Format inattendu');

        // Assainissement : le JSON sera un jour ecrit par le panel
        // d'administration. On force les types attendus et on ecarte les
        // chemins d'image suspects avant tout usage. Le rendu passe ensuite
        // exclusivement par textContent et setAttribute, jamais par du HTML
        // construit avec ces valeurs : pas d'injection possible.
        var imageOk = (window.ABV && window.ABV.cheminImageValide)
          ? window.ABV.cheminImageValide
          : function () { return true; };

        var propres = donnees
          .filter(function (c) { return c && typeof c === 'object'; })
          .map(function (c) {
            return {
              id: String(c.id || ''),
              titre: String(c.titre || ''),
              type: String(c.type || ''),
              commune: String(c.commune || ''),
              annee: parseInt(c.annee, 10) || 0,
              description: String(c.description || ''),
              images: (Array.isArray(c.images) ? c.images : []).filter(imageOk)
            };
          })
          .filter(function (c) { return c.id && c.titre && c.images.length; });

        // Tri du plus recent au plus ancien, puis par identifiant.
        chantiers = propres.sort(function (a, b) {
          if (b.annee !== a.annee) return b.annee - a.annee;
          return a.id.localeCompare(b.id);
        });

        if (apercu) {
          rendre(apercu, chantiers.slice(0, 3), true);
        }

        if (complete) {
          rendre(complete, chantiers, true);
          var compte = document.querySelector('.galerie__compte');
          if (compte) compte.textContent = chantiers.length + ' chantiers affichés.';
          initFiltres(complete);
        }
      })
      .catch(function (erreur) {
        console.error('ABV : chargement des réalisations impossible.', erreur);
        if (apercu) afficherEchec(apercu);
        if (complete) afficherEchec(complete);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
