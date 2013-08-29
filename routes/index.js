
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
