
/**
 * Dépendances
 */

var fs = require('fs')
  , f = require('./functions');

/**
 * Page d'accueil (GET)
 */

exports.index = function(req, res)
{
  // Chargement des groupes
  var groupsJSON = f.getGroupsJSON();
  var groups = f.getGroups();

  // Tableau pour l'affichage des données
  var data = {
      groupsJSON: groupsJSON,
      groups: groups
  };

  res.render('index', data);
};

/**
 * Page de changement de fond d'écran (GET)
 */

exports.setBackground = function(req, res)
{
  res.render('set-background', {
    backgrounds: fs.readdirSync('public/images/backgrounds').sort() || []
  });
};

/**
 * Fichier Manifest (GET)
 */

exports.cacheManifest = function(req, res)
{
  res.set('Content-Type', 'text/cache-manifest')
  res.render('cache-manifest', {
    backgrounds: fs.readdirSync('public/images/backgrounds').sort() || []
  });
};
