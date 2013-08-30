
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
  var backgrounds = fs.readdirSync('public/images/backgrounds').sort();
  
  res.render('set-background', {
    backgrounds: backgrounds || []
  });
};
