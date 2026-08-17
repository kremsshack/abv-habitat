/* ==========================================================================
   ABV HABITAT — interactions generales
   Contenu :
     1. Navigation mobile
     2. Fondu a l'apparition au defilement
     3. Remplacement automatique des emplacements photo
     4. Formulaire de devis (validation cote client, page contact)
   Aucune dependance, aucun stockage navigateur, aucun appel reseau.
   ========================================================================== */

(function () {
  'use strict';

  var mouvementReduit = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ------------------------------------------------------------------
     1. Navigation mobile
     ------------------------------------------------------------------ */

  function initNavigation() {
    var bascule = document.querySelector('.entete__bascule');
    var nav = document.querySelector('.nav');
    if (!bascule || !nav) return;

    function fermer() {
      nav.classList.remove('est-ouverte');
      bascule.setAttribute('aria-expanded', 'false');
    }

    function ouvrir() {
      nav.classList.add('est-ouverte');
      bascule.setAttribute('aria-expanded', 'true');
    }

    bascule.addEventListener('click', function () {
      if (bascule.getAttribute('aria-expanded') === 'true') {
        fermer();
      } else {
        ouvrir();
      }
    });

    // Un clic sur un lien referme le panneau.
    nav.addEventListener('click', function (evenement) {
      if (evenement.target.closest('a')) fermer();
    });

    // Echap referme et rend le focus au bouton.
    document.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape' && bascule.getAttribute('aria-expanded') === 'true') {
        fermer();
        bascule.focus();
      }
    });

    // Au passage en affichage large, on repart d'un etat propre.
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) fermer();
    });
  }

  /* ------------------------------------------------------------------
     2. Fondu a l'apparition
     ------------------------------------------------------------------ */

  var observateurFondus = null;

  // Prend en charge les elements .fondu presents dans `racine` (ou toute la
  // page). Egalement appelee par galerie.js pour les cartes ajoutees apres
  // le chargement : sans cela, elles resteraient invisibles.
  function observerFondus(racine) {
    var elements = (racine || document).querySelectorAll('.fondu:not(.est-visible)');
    if (!elements.length) return;

    // Mouvement reduit ou navigateur ancien : tout est visible d'emblee.
    if (mouvementReduit || !('IntersectionObserver' in window)) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add('est-visible');
      }
      return;
    }

    if (!observateurFondus) {
      observateurFondus = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add('est-visible');
            observateurFondus.unobserve(entree.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }

    for (var j = 0; j < elements.length; j++) {
      observateurFondus.observe(elements[j]);
    }

    // Filet de securite : si l'observateur ne s'est pas prononce apres
    // 3 secondes (onglet en arriere-plan, navigateur capricieux), le contenu
    // est rendu visible d'office. Mieux vaut perdre un fondu que cacher
    // la galerie.
    setTimeout(function () {
      var restants = (racine || document).querySelectorAll('.fondu:not(.est-visible)');
      for (var k = 0; k < restants.length; k++) {
        restants[k].classList.add('est-visible');
      }
    }, 3000);
  }

  /* ------------------------------------------------------------------
     3. Remplacement automatique des emplacements photo
     ------------------------------------------------------------------
     Tant que la photo n'existe pas, le bloc gris reste affiche avec le nom
     du fichier attendu. Des que le fichier est depose au bon chemin, il
     remplace le bloc sans aucune modification du code.
     ------------------------------------------------------------------ */

  // N'accepte que des chemins relatifs simples vers des images du site.
  // Bloque les URL absolues, les protocoles (javascript:, data:, //hote)
  // et les remontees de dossier. Protege le jour ou le JSON sera ecrit
  // par le panel d'administration.
  function cheminImageValide(chemin) {
    return typeof chemin === 'string'
      && /^assets\/img\/[a-z0-9_\-./]+\.(jpg|jpeg|png|webp|svg)$/i.test(chemin)
      && chemin.indexOf('..') === -1;
  }

  function remplacerEmplacement(bloc) {
    var chemin = bloc.getAttribute('data-src');
    if (!cheminImageValide(chemin)) return;

    var test = new Image();

    test.onload = function () {
      var image = document.createElement('img');
      image.className = 'photo';
      image.src = chemin;
      image.alt = bloc.getAttribute('data-alt') || '';
      image.width = test.naturalWidth;
      image.height = test.naturalHeight;
      if (bloc.getAttribute('data-lazy') !== 'non') {
        image.loading = 'lazy';
        image.decoding = 'async';
      }
      bloc.textContent = '';
      bloc.appendChild(image);
      bloc.classList.add('emplacement--remplie');
    };

    // Aucun traitement en cas d'echec : le bloc gris reste en place.
    test.onerror = function () {};
    test.src = chemin;
  }

  function initEmplacements(racine) {
    var cible = racine || document;
    var blocs = cible.querySelectorAll('.emplacement[data-src]');
    for (var i = 0; i < blocs.length; i++) {
      remplacerEmplacement(blocs[i]);
    }

    // Cas particulier : image de fond du hero.
    var media = cible.querySelector('.hero__media[data-src]');
    if (media && cheminImageValide(media.getAttribute('data-src'))) {
      var cheminHero = media.getAttribute('data-src');
      var testHero = new Image();
      testHero.onload = function () {
        media.style.backgroundImage = 'url("' + cheminHero + '")';
        var note = document.querySelector('.hero__note-photo');
        if (note) note.hidden = true;
      };
      testHero.onerror = function () {};
      testHero.src = cheminHero;
    }
  }

  /* ------------------------------------------------------------------
     4. Formulaire de devis
     ------------------------------------------------------------------
     Validation cote client uniquement. Aucune donnee n'est transmise en V1.
     Les attributs `name` sont deja en place pour un traitement serveur.
     ------------------------------------------------------------------ */

  var REGLES = [
    {
      nom: 'nom',
      libelle: 'Nom et prénom',
      valider: function (v) { return v.trim().length >= 2; },
      message: 'Indiquez votre nom et votre prénom.'
    },
    {
      nom: 'telephone',
      libelle: 'Téléphone',
      valider: function (v) {
        var chiffres = v.replace(/\D/g, '');
        return chiffres.length >= 9 && chiffres.length <= 15;
      },
      message: 'Indiquez un numéro de téléphone valide, par exemple 03 88 12 34 56.'
    },
    {
      nom: 'email',
      libelle: 'E-mail',
      valider: function (v) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim()); },
      message: 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.'
    },
    {
      nom: 'commune',
      libelle: 'Commune',
      valider: function (v) { return v.trim().length >= 2; },
      message: 'Indiquez la commune du chantier.'
    },
    {
      nom: 'code_postal',
      libelle: 'Code postal',
      valider: function (v) { return /^\d{5}$/.test(v.trim()); },
      message: 'Le code postal doit comporter 5 chiffres.'
    }
  ];

  function afficherErreurChamp(champ, message) {
    var zone = document.getElementById('erreur-' + champ.name);
    if (zone) zone.textContent = message;
    champ.setAttribute('aria-invalid', 'true');
  }

  function effacerErreurChamp(champ) {
    var zone = document.getElementById('erreur-' + champ.name);
    if (zone) zone.textContent = '';
    champ.removeAttribute('aria-invalid');
  }

  function libelleValeur(formulaire, nom) {
    var element = formulaire.elements[nom];
    if (!element) return '';

    // Groupe de boutons radio
    if (element instanceof RadioNodeList || (element.length && !element.tagName)) {
      var choisi = formulaire.querySelector('[name="' + nom + '"]:checked');
      if (!choisi) return '';
      var etiquette = formulaire.querySelector('label[for="' + choisi.id + '"]');
      return etiquette ? etiquette.textContent.trim() : choisi.value;
    }

    return element.value ? element.value.trim() : '';
  }

  function valeursCochees(formulaire, nom) {
    var coches = formulaire.querySelectorAll('[name="' + nom + '"]:checked');
    var resultat = [];
    for (var i = 0; i < coches.length; i++) {
      var etiquette = formulaire.querySelector('label[for="' + coches[i].id + '"]');
      resultat.push(etiquette ? etiquette.textContent.trim() : coches[i].value);
    }
    return resultat;
  }

  function construireConfirmation(formulaire) {
    var projets = valeursCochees(formulaire, 'projet[]');

    var lignes = [
      ['Nom', libelleValeur(formulaire, 'nom')],
      ['Téléphone', libelleValeur(formulaire, 'telephone')],
      ['E-mail', libelleValeur(formulaire, 'email')],
      ['Commune', libelleValeur(formulaire, 'commune') + ' (' + libelleValeur(formulaire, 'code_postal') + ')'],
      ['Projet', projets.join(', ')],
      ['Nombre d’ouvertures', libelleValeur(formulaire, 'nombre_ouvertures')],
      ['Matériau', libelleValeur(formulaire, 'materiau')],
      ['Type de travaux', libelleValeur(formulaire, 'type_travaux')],
      ['Échéance', libelleValeur(formulaire, 'echeance')]
    ];

    var section = document.createElement('section');
    section.className = 'confirmation';
    section.setAttribute('tabindex', '-1');
    section.setAttribute('aria-labelledby', 'titre-confirmation');

    var titre = document.createElement('h2');
    titre.className = 'confirmation__titre';
    titre.id = 'titre-confirmation';
    titre.textContent = 'Votre demande est complète';
    section.appendChild(titre);

    var intro = document.createElement('p');
    intro.textContent = 'Voici le récapitulatif de ce que vous avez saisi. '
      + 'Sur le site final, cette demande partira par e-mail et vous serez rappelé sous 48 heures.';
    section.appendChild(intro);

    var recap = document.createElement('div');
    recap.className = 'confirmation__recap';
    var liste = document.createElement('dl');

    lignes.forEach(function (ligne) {
      if (!ligne[1]) return;
      var dt = document.createElement('dt');
      dt.textContent = ligne[0];
      var dd = document.createElement('dd');
      dd.textContent = ligne[1];
      liste.appendChild(dt);
      liste.appendChild(dd);
    });

    recap.appendChild(liste);
    section.appendChild(recap);

    var note = document.createElement('p');
    note.className = 'texte-secondaire';
    note.textContent = 'Maquette — aucune donnée n’a été envoyée ni enregistrée.';
    section.appendChild(note);

    var retour = document.createElement('button');
    retour.type = 'button';
    retour.className = 'bouton bouton--contour';
    retour.textContent = 'Revenir au formulaire';
    retour.addEventListener('click', function () {
      section.parentNode.replaceChild(formulaire, section);
      formulaire.reset();
      var premier = formulaire.querySelector('input, select, textarea');
      if (premier) premier.focus();
    });
    section.appendChild(retour);

    return section;
  }

  function initFormulaire() {
    var formulaire = document.querySelector('.formulaire');
    if (!formulaire) return;

    var resume = document.getElementById('resume-erreurs');

    // Effacement de l'erreur des qu'on corrige le champ.
    REGLES.forEach(function (regle) {
      var champ = formulaire.elements[regle.nom];
      if (!champ || !champ.addEventListener) return;
      champ.addEventListener('input', function () {
        if (champ.getAttribute('aria-invalid') === 'true' && regle.valider(champ.value)) {
          effacerErreurChamp(champ);
        }
      });
    });

    // Affichage des fichiers choisis (aucun envoi).
    var fichiers = formulaire.elements['photos[]'];
    var listeFichiers = document.getElementById('liste-fichiers');
    if (fichiers && listeFichiers) {
      fichiers.addEventListener('change', function () {
        if (!fichiers.files || !fichiers.files.length) {
          listeFichiers.textContent = '';
          return;
        }
        var noms = [];
        for (var i = 0; i < fichiers.files.length; i++) {
          noms.push(fichiers.files[i].name);
        }
        listeFichiers.textContent = (noms.length === 1 ? 'Fichier choisi : ' : 'Fichiers choisis : ')
          + noms.join(', ');
      });
    }

    formulaire.addEventListener('submit', function (evenement) {
      evenement.preventDefault();

      var erreurs = [];

      REGLES.forEach(function (regle) {
        var champ = formulaire.elements[regle.nom];
        if (!champ) return;
        if (regle.valider(champ.value)) {
          effacerErreurChamp(champ);
        } else {
          afficherErreurChamp(champ, regle.message);
          erreurs.push({ id: champ.id, libelle: regle.libelle, message: regle.message });
        }
      });

      // Au moins un type de projet.
      var projets = formulaire.querySelectorAll('[name="projet[]"]:checked');
      var erreurProjet = document.getElementById('erreur-projet');
      if (!projets.length) {
        if (erreurProjet) erreurProjet.textContent = 'Cochez au moins un type de projet.';
        erreurs.push({
          id: 'projet-fenetres',
          libelle: 'Votre projet',
          message: 'Cochez au moins un type de projet.'
        });
      } else if (erreurProjet) {
        erreurProjet.textContent = '';
      }

      // Consentement RGPD.
      var rgpd = formulaire.elements['rgpd'];
      var erreurRgpd = document.getElementById('erreur-rgpd');
      if (rgpd && !rgpd.checked) {
        if (erreurRgpd) erreurRgpd.textContent = 'Vous devez accepter l’utilisation de vos données pour être recontacté.';
        rgpd.setAttribute('aria-invalid', 'true');
        erreurs.push({
          id: 'rgpd',
          libelle: 'Consentement',
          message: 'Vous devez accepter l’utilisation de vos données pour être recontacté.'
        });
      } else if (rgpd) {
        if (erreurRgpd) erreurRgpd.textContent = '';
        rgpd.removeAttribute('aria-invalid');
      }

      if (erreurs.length) {
        if (resume) {
          resume.textContent = '';

          var titre = document.createElement('h2');
          titre.textContent = erreurs.length === 1
            ? 'Un champ doit être corrigé'
            : erreurs.length + ' champs doivent être corrigés';
          resume.appendChild(titre);

          var ul = document.createElement('ul');
          erreurs.forEach(function (erreur) {
            var li = document.createElement('li');
            var lien = document.createElement('a');
            lien.href = '#' + erreur.id;
            lien.textContent = erreur.libelle + ' : ' + erreur.message;
            lien.addEventListener('click', function (clic) {
              clic.preventDefault();
              var cible = document.getElementById(erreur.id);
              if (cible) cible.focus();
            });
            li.appendChild(lien);
            ul.appendChild(li);
          });
          resume.appendChild(ul);
          resume.setAttribute('tabindex', '-1');
          resume.focus();
        }
        return;
      }

      if (resume) resume.textContent = '';

      var confirmation = construireConfirmation(formulaire);
      formulaire.parentNode.replaceChild(confirmation, formulaire);
      confirmation.focus();
    });
  }

  /* ------------------------------------------------------------------
     Demarrage
     ------------------------------------------------------------------ */

  function demarrer() {
    initNavigation();
    observerFondus();
    initEmplacements();
    initFormulaire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

  // Utilise par galerie.js pour les blocs ajoutes apres coup.
  window.ABV = window.ABV || {};
  window.ABV.initEmplacements = initEmplacements;
  window.ABV.observerFondus = observerFondus;
  window.ABV.cheminImageValide = cheminImageValide;
  window.ABV.mouvementReduit = mouvementReduit;
})();
