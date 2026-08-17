/* Pose la classe "js" sur <html> avant le premier rendu.
   Les fondus a l'apparition ne s'activent que si cette classe est presente :
   sans JavaScript, tout le contenu reste visible d'emblee.
   Charge en debut de <head>, sans defer, precisement pour s'executer tot. */
document.documentElement.className += ' js';
